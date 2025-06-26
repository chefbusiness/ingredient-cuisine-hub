
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { PerplexityClient } from '../generate-content/perplexity-client.ts';
import { validateHorecaPrice, guessCategory } from '../generate-content/price-validator.ts';
import { processMultiCountryPrices } from '../save-generated-content/pricing.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Security function to verify super admin access
async function verifySuperAdminAccess(authHeader: string | null): Promise<{ authorized: boolean, userEmail?: string }> {
  if (!authHeader) {
    console.log('❌ No authorization header provided');
    return { authorized: false };
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.log('❌ Invalid or expired token:', userError?.message);
      return { authorized: false };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (profileError || profile.role !== 'super_admin') {
      console.log('❌ User is not a super admin');
      return { authorized: false, userEmail: profile?.email };
    }

    console.log('✅ Super admin access verified for:', profile.email);
    return { authorized: true, userEmail: profile.email };
  } catch (error) {
    console.log('❌ Error verifying admin access:', error);
    return { authorized: false };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 === ACTUALIZACIÓN MASIVA DE PRECIOS HORECA ===');
    
    // Security check: Verify super admin access
    const authHeader = req.headers.get('authorization');
    const authResult = await verifySuperAdminAccess(authHeader);
    
    if (!authResult.authorized) {
      const errorMessage = authResult.userEmail 
        ? `Usuario ${authResult.userEmail} no tiene permisos de super admin.`
        : 'Se requiere autenticación de super admin para esta función.';
        
      return new Response(JSON.stringify({ 
        error: errorMessage,
        code: 'UNAUTHORIZED'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestBody = await req.json();
    const { mode = 'problematic', ingredientIds, batchSize = 5 } = requestBody;

    console.log(`🎯 Modo de actualización: ${mode}`);
    console.log(`📦 Tamaño de lote: ${batchSize}`);

    let targetIngredients = [];

    if (mode === 'all') {
      // Obtener todos los ingredientes
      const { data: allIngredients, error } = await supabase
        .from('ingredients')
        .select('id, name, name_en')
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Error obteniendo ingredientes: ${error.message}`);
      }
      
      targetIngredients = allIngredients;
      console.log(`📋 Procesando TODOS los ingredientes: ${targetIngredients.length}`);
    } else if (mode === 'specific' && ingredientIds) {
      // Ingredientes específicos
      const { data: specificIngredients, error } = await supabase
        .from('ingredients')
        .select('id, name, name_en')
        .in('id', ingredientIds);

      if (error) {
        throw new Error(`Error obteniendo ingredientes específicos: ${error.message}`);
      }
      
      targetIngredients = specificIngredients;
      console.log(`🎯 Procesando ingredientes específicos: ${targetIngredients.length}`);
    } else {
      // Modo por defecto: solo ingredientes con precios problemáticos
      console.log('🔍 Identificando ingredientes con precios problemáticos...');
      
      const { data: ingredientsWithPrices, error } = await supabase
        .from('ingredient_prices')
        .select(`
          ingredient_id,
          price,
          unit,
          ingredients!inner(id, name, name_en)
        `);

      if (error) {
        throw new Error(`Error obteniendo precios existentes: ${error.message}`);
      }

      const problematicIngredients = new Set();
      let totalPricesChecked = 0;
      let problematicPricesFound = 0;

      // Identificar ingredientes con precios sospechosos
      for (const priceRecord of ingredientsWithPrices) {
        totalPricesChecked++;
        const ingredient = priceRecord.ingredients;
        const category = guessCategory(ingredient.name);
        const isValidPrice = validateHorecaPrice(priceRecord.price, category, ingredient.name);
        
        if (!isValidPrice) {
          problematicIngredients.add(ingredient.id);
          problematicPricesFound++;
        }
      }

      // Convertir a array de ingredientes únicos
      const { data: uniqueProblematic, error: uniqueError } = await supabase
        .from('ingredients')
        .select('id, name, name_en')
        .in('id', Array.from(problematicIngredients));

      if (uniqueError) {
        throw new Error(`Error obteniendo ingredientes problemáticos: ${uniqueError.message}`);
      }

      targetIngredients = uniqueProblematic;
      
      console.log(`📊 Análisis completado:`);
      console.log(`   Total precios revisados: ${totalPricesChecked}`);
      console.log(`   Precios problemáticos: ${problematicPricesFound}`);
      console.log(`   Ingredientes a actualizar: ${targetIngredients.length}`);
    }

    if (targetIngredients.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No se encontraron ingredientes para procesar',
        summary: {
          total_processed: 0,
          successful_updates: 0,
          failed_updates: 0,
          updated_ingredients: []
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Inicializar cliente de Perplexity
    const perplexityClient = new PerplexityClient();
    
    let processedCount = 0;
    let successfulUpdates = 0;
    let failedUpdates = 0;
    const updatedIngredients = [];
    const failedIngredients = [];

    // Procesar en lotes
    for (let i = 0; i < targetIngredients.length; i += batchSize) {
      const batch = targetIngredients.slice(i, i + batchSize);
      console.log(`🔄 Procesando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(targetIngredients.length/batchSize)}`);
      
      for (const ingredient of batch) {
        try {
          console.log(`📊 Actualizando precios para: ${ingredient.name}`);
          
          // Prompt específico para actualización de precios
          const priceUpdatePrompt = `
            Investiga y actualiza los precios HORECA profesionales para el ingrediente "${ingredient.name}" (${ingredient.name_en || ''}).
            
            CRÍTICO: Enfócate EXCLUSIVAMENTE en precios para restaurantes y distribución mayorista.
            
            Para España, consulta OBLIGATORIAMENTE frutaseloy.com como fuente principal.
            Para otros países, usa fuentes mayoristas especializadas en HORECA.
            
            Responde SOLO con este JSON (sin markdown, sin explicaciones):
            {
              "prices_by_country": [
                {
                  "country": "España", 
                  "country_code": "ES", 
                  "price": [precio_numerico], 
                  "currency": "EUR", 
                  "unit": "kg",
                  "market_type": "mayorista_horeca"
                },
                {
                  "country": "Estados Unidos", 
                  "country_code": "US", 
                  "price": [precio_numerico], 
                  "currency": "USD", 
                  "unit": "kg",
                  "market_type": "mayorista_horeca"
                },
                {
                  "country": "Francia", 
                  "country_code": "FR", 
                  "price": [precio_numerico], 
                  "currency": "EUR", 
                  "unit": "kg",
                  "market_type": "mayorista_horeca"
                },
                {
                  "country": "Italia", 
                  "country_code": "IT", 
                  "price": [precio_numerico], 
                  "currency": "EUR", 
                  "unit": "kg",
                  "market_type": "mayorista_horeca"
                },
                {
                  "country": "México", 
                  "country_code": "MX", 
                  "price": [precio_numerico], 
                  "currency": "MXN", 
                  "unit": "kg",
                  "market_type": "mayorista_horeca"
                },
                {
                  "country": "Argentina", 
                  "country_code": "AR", 
                  "price": [precio_numerico], 
                  "currency": "ARS", 
                  "unit": "kg",
                  "market_type": "mayorista_horeca"
                }
              ]
            }
          `;

          // Obtener nuevos precios usando Perplexity
          const newPricesData = await perplexityClient.generateContent(priceUpdatePrompt);
          
          if (newPricesData && newPricesData.length > 0 && newPricesData[0].prices_by_country) {
            // Eliminar precios existentes
            const { error: deleteError } = await supabase
              .from('ingredient_prices')
              .delete()
              .eq('ingredient_id', ingredient.id);

            if (deleteError) {
              console.log(`⚠️ Error eliminando precios antiguos para ${ingredient.name}:`, deleteError);
            } else {
              console.log(`🗑️ Precios antiguos eliminados para ${ingredient.name}`);
            }

            // Insertar nuevos precios
            await processMultiCountryPrices(ingredient.id, newPricesData[0].prices_by_country);
            
            successfulUpdates++;
            updatedIngredients.push({
              id: ingredient.id,
              name: ingredient.name,
              prices_updated: newPricesData[0].prices_by_country.length
            });
            
            console.log(`✅ Precios actualizados exitosamente para: ${ingredient.name}`);
          } else {
            console.log(`⚠️ No se obtuvieron precios válidos para: ${ingredient.name}`);
            failedUpdates++;
            failedIngredients.push({
              id: ingredient.id,
              name: ingredient.name,
              reason: 'No se obtuvieron precios válidos de Perplexity'
            });
          }
          
        } catch (error) {
          console.error(`❌ Error actualizando ${ingredient.name}:`, error);
          failedUpdates++;
          failedIngredients.push({
            id: ingredient.id,
            name: ingredient.name,
            reason: error.message
          });
        }
        
        processedCount++;
        
        // Pausa pequeña entre ingredientes para evitar rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Pausa entre lotes
      if (i + batchSize < targetIngredients.length) {
        console.log('⏸️ Pausa entre lotes...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Log the admin action
    try {
      await supabase.rpc('log_admin_action', {
        action_type: 'update_ingredient_prices_bulk',
        resource_type: 'ingredient_prices',
        action_details: {
          mode: mode,
          total_processed: processedCount,
          successful_updates: successfulUpdates,
          failed_updates: failedUpdates,
          batch_size: batchSize
        }
      });
    } catch (logError) {
      console.log('⚠️ Failed to log admin action:', logError);
    }

    console.log(`🎉 === ACTUALIZACIÓN MASIVA COMPLETADA ===`);
    console.log(`📊 Procesados: ${processedCount}/${targetIngredients.length}`);
    console.log(`✅ Exitosos: ${successfulUpdates}`);
    console.log(`❌ Fallidos: ${failedUpdates}`);

    const response = {
      success: true,
      summary: {
        total_processed: processedCount,
        successful_updates: successfulUpdates,
        failed_updates: failedUpdates,
        updated_ingredients: updatedIngredients,
        failed_ingredients: failedIngredients,
        mode: mode
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in update-ingredient-prices:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
