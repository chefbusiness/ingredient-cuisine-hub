import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { PerplexityClient } from './perplexity-client.ts';
import { processMultiCountryPrices } from './price-processor.ts';
import { verifySuperAdminAccess } from './auth.ts';
import { getProblematicIngredients, getAllIngredients, getSpecificIngredients } from './ingredient-analyzer.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 === INICIANDO ACTUALIZACIÓN OPTIMIZADA DE PRECIOS HORECA ===');
    
    const authHeader = req.headers.get('authorization');
    const authResult = await verifySuperAdminAccess(authHeader);
    
    if (!authResult.authorized) {
      const errorMessage = authResult.userEmail 
        ? `Usuario ${authResult.userEmail} no tiene permisos de super admin.`
        : 'Se requiere autenticación de super admin para esta función.';
        
      return new Response(JSON.stringify({ 
        success: false,
        error: errorMessage,
        code: 'UNAUTHORIZED'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`👤 Usuario autorizado: ${authResult.userEmail}`);

    const requestBody = await req.json();
    const { mode = 'problematic', ingredientIds, batchSize = 1 } = requestBody;

    console.log(`🎯 Modo optimizado: ${mode}, Lote: 1 (forzado para estabilidad)`);

    let targetIngredients = [];

    if (mode === 'all') {
      targetIngredients = await getAllIngredients();
      console.log(`📋 Procesando TODOS los ingredientes: ${targetIngredients.length}`);
      
    } else if (mode === 'specific' && ingredientIds) {
      targetIngredients = await getSpecificIngredients(ingredientIds);
      console.log(`🎯 Procesando ingredientes específicos: ${targetIngredients.length}`);
      
    } else {
      targetIngredients = await getProblematicIngredients();
    }

    if (targetIngredients.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No se encontraron ingredientes para procesar',
        summary: {
          total_processed: 0,
          successful_updates: 0,
          failed_updates: 0,
          updated_ingredients: [],
          failed_ingredients: [],
          mode: mode
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const perplexityClient = new PerplexityClient();
    
    let processedCount = 0;
    let successfulUpdates = 0;
    let failedUpdates = 0;
    const updatedIngredients = [];
    const failedIngredients = [];

    console.log(`🔄 Procesando ${targetIngredients.length} ingredientes de uno en uno...`);
    
    for (const ingredient of targetIngredients) {
      try {
        console.log(`📊 === ACTUALIZANDO: ${ingredient.name} (${processedCount + 1}/${targetIngredients.length}) ===`);
        
        // PROMPT OPTIMIZADO PARA REDUCIR PAÍSES (DE 6 A 4)
        const priceUpdatePrompt = `
          Investiga precios HORECA mayoristas para "${ingredient.name}" (${ingredient.name_en || ''}).
          
          Consulta OBLIGATORIAMENTE frutaseloy.com para España y fuentes mayoristas para otros países.
          
          Responde SOLO con este JSON válido (sin comentarios):
          {
            "prices_by_country": [
              {
                "country": "España", 
                "country_code": "ES", 
                "price": 18.50, 
                "currency": "EUR", 
                "unit": "kg",
                "market_type": "mayorista_horeca"
              },
              {
                "country": "Estados Unidos", 
                "country_code": "US", 
                "price": 22.00, 
                "currency": "USD", 
                "unit": "kg",
                "market_type": "mayorista_horeca"
              },
              {
                "country": "Francia", 
                "country_code": "FR", 
                "price": 19.80, 
                "currency": "EUR", 
                "unit": "kg",
                "market_type": "mayorista_horeca"
              },
              {
                "country": "México", 
                "country_code": "MX", 
                "price": 380.00, 
                "currency": "MXN", 
                "unit": "kg",
                "market_type": "mayorista_horeca"
              }
            ]
          }
        `;

        const newPricesData = await perplexityClient.generateContent(priceUpdatePrompt);
        
        if (newPricesData && newPricesData.length > 0 && newPricesData[0].prices_by_country) {
          const { error: deleteError } = await supabase
            .from('ingredient_prices')
            .delete()
            .eq('ingredient_id', ingredient.id);

          if (deleteError) {
            console.log(`⚠️ Error eliminando precios antiguos para ${ingredient.name}:`, deleteError);
          } else {
            console.log(`🗑️ Precios antiguos eliminados para ${ingredient.name}`);
          }

          await processMultiCountryPrices(ingredient.id, newPricesData[0].prices_by_country);
          
          successfulUpdates++;
          updatedIngredients.push({
            id: ingredient.id,
            name: ingredient.name,
            prices_updated: newPricesData[0].prices_by_country.length
          });
          
          console.log(`✅ ÉXITO: ${ingredient.name} actualizado con ${newPricesData[0].prices_by_country.length} precios`);
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
          reason: `Error: ${error.message}`
        });
      }
      
      processedCount++;
      
      if (processedCount < targetIngredients.length) {
        console.log('⏸️ Pausa optimizada (2 segundos)...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    try {
      await supabase.rpc('log_admin_action', {
        action_type: 'update_ingredient_prices_bulk_optimized',
        resource_type: 'ingredient_prices',
        action_details: {
          mode: mode,
          total_processed: processedCount,
          successful_updates: successfulUpdates,
          failed_updates: failedUpdates,
          batch_size: 1,
          optimization: 'anti_timeout_single_processing'
        }
      });
    } catch (logError) {
      console.log('⚠️ Failed to log admin action:', logError);
    }

    console.log(`🎉 === ACTUALIZACIÓN OPTIMIZADA COMPLETADA ===`);
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
    console.error('❌ Error crítico en update-ingredient-prices optimizado:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
