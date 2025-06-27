
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Perplexity client implementation
class PerplexityClient {
  private apiKey: string;

  constructor() {
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  async generateContent(prompt: string): Promise<any[]> {
    console.log('🔍 === INVESTIGACIÓN CON PERPLEXITY SONAR PARA HOSTELERÍA ===');
    
    const requestBody = {
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        {
          role: 'system',
          content: `Eres un investigador experto en ingredientes culinarios para HOSTELERÍA Y RESTAURANTES con acceso a internet.

          🏢 ENFOQUE EXCLUSIVO B2B/HORECA:
          Investiga EXCLUSIVAMENTE datos para restaurantes, chefs profesionales y distribución mayorista.
          NUNCA uses precios de supermercados de consumo final (Carrefour, Mercadona, Amazon retail).
          
          🥇 JERARQUÍA DE FUENTES CRÍTICA PARA ESPAÑA:
          1. FRUTAS ELOY (frutaseloy.com) - FUENTE PRIORITARIA para frutas, verduras, hierbas, germinados
             - Analiza SIEMPRE precios por kg (no por bandeja o unidad)
             - Verifica si indica "precio por kg" o "por bandeja de X kg"
             - Convierte bandejas a kg usando información del producto
          2. MAKRO España (makro.es) - Fuente secundaria para validación
          3. Mercamadrid - Mercado central mayorista
          
          📊 FUENTES PRIORITARIAS PARA PRECIOS POR PAÍS:
          - España: Frutas Eloy → Makro → Mercamadrid → otros HORECA
          - Francia: Metro.fr → Rungis → distribuidores professionnels
          - Italia: Metro Italia → mercados mayoristas → distribuidores ristorazione
          - EEUU: Restaurant Depot → US Foods → Sysco
          - México: Distribuidores HORECA → mercados mayoristas
          - Argentina: Distribuidores gastronómicos → mercados concentradores
          
          Responde SOLO con JSON válido basado en investigación real de fuentes HORECA/B2B priorizando Frutas Eloy para España.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 8000,
      top_p: 0.9,
      return_images: false,
      return_related_questions: false,
      search_domain_filter: [
        'frutaseloy.com',
        'makro.es',
        'metro.fr',
        'restaurantdepot.com',
        'sysco.com',
        'usfoods.com',
        'fao.org',
        'usda.gov',
        'mercamadrid.es',
        'alibaba.com'
      ],
      search_recency_filter: 'month',
      frequency_penalty: 1.2
    };

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error de Perplexity API: ${response.status} ${response.statusText}. Detalles: ${errorText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    // Parse content
    return this.parseContent(generatedContent);
  }

  private parseContent(content: string): any[] {
    try {
      // Try to parse as JSON directly
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      // If direct parsing fails, try to extract JSON from markdown
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (innerError) {
          console.error('Error parsing extracted JSON:', innerError);
        }
      }
      
      // If all else fails, return empty array
      console.error('Could not parse content as JSON:', content);
      return [];
    }
  }
}

// Price validation functions
function guessCategory(ingredientName: string): string {
  const name = ingredientName.toLowerCase();
  
  if (name.includes('fruta') || name.includes('manzana') || name.includes('pera') || 
      name.includes('plátano') || name.includes('naranja') || name.includes('limón') ||
      name.includes('uva') || name.includes('mango') || name.includes('aguacate')) {
    return 'frutas';
  }
  
  if (name.includes('verdura') || name.includes('lechuga') || name.includes('tomate') ||
      name.includes('cebolla') || name.includes('zanahoria') || name.includes('brócoli')) {
    return 'verduras';
  }
  
  if (name.includes('hierba') || name.includes('albahaca') || name.includes('perejil') ||
      name.includes('cilantro') || name.includes('romero') || name.includes('tomillo')) {
    return 'hierbas';
  }
  
  if (name.includes('carne') || name.includes('pollo') || name.includes('cerdo') ||
      name.includes('ternera') || name.includes('cordero')) {
    return 'carnes';
  }
  
  if (name.includes('pescado') || name.includes('salmón') || name.includes('bacalao') ||
      name.includes('atún') || name.includes('marisco')) {
    return 'pescados';
  }
  
  return 'otros';
}

function validateHorecaPrice(price: number, category: string, ingredientName: string): boolean {
  const priceRanges = {
    frutas: { min: 1.5, max: 25 },
    verduras: { min: 0.8, max: 15 },
    hierbas: { min: 8, max: 50 },
    carnes: { min: 3, max: 40 },
    pescados: { min: 4, max: 50 },
    otros: { min: 0.5, max: 30 }
  };
  
  const range = priceRanges[category as keyof typeof priceRanges] || priceRanges.otros;
  
  // Special cases
  if (ingredientName.toLowerCase().includes('azafrán')) {
    return price >= 3000 && price <= 8000;
  }
  
  if (ingredientName.toLowerCase().includes('trufa')) {
    return price >= 500 && price <= 2000;
  }
  
  return price >= range.min && price <= range.max;
}

// Pricing processor
async function processMultiCountryPrices(ingredientId: string, pricesData: any[]) {
  const pricesToInsert = [];
  
  for (const priceData of pricesData) {
    // Get country by code
    const { data: country } = await supabase
      .from('countries')
      .select('id')
      .eq('code', priceData.country_code)
      .single();
    
    if (country) {
      pricesToInsert.push({
        ingredient_id: ingredientId,
        country_id: country.id,
        price: priceData.price,
        unit: priceData.unit || 'kg'
      });
    }
  }
  
  if (pricesToInsert.length > 0) {
    await supabase
      .from('ingredient_prices')
      .insert(pricesToInsert);
  }
}

// Security function to verify super admin access
async function verifySuperAdminAccess(authHeader: string | null): Promise<{ authorized: boolean, userEmail?: string }> {
  if (!authHeader) {
    return { authorized: false };
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return { authorized: false };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (profileError || profile.role !== 'super_admin') {
      return { authorized: false, userEmail: profile?.email };
    }

    return { authorized: true, userEmail: profile.email };
  } catch (error) {
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
          updated_ingredients: [],
          failed_ingredients: [],
          mode: mode
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
