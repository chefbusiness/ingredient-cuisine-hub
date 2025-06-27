
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
          
          IMPORTANTE: Responde SOLO con JSON válido, sin comentarios adicionales ni texto explicativo.
          
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

    console.log('📡 Enviando consulta a Perplexity API...');

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
      console.error('❌ Error de Perplexity API:', response.status, response.statusText, errorText);
      throw new Error(`Error de Perplexity API: ${response.status} ${response.statusText}. Detalles: ${errorText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log('📦 Respuesta recibida de Perplexity (primeros 200 chars):', generatedContent.substring(0, 200));
    
    // Parse content
    return this.parseContent(generatedContent);
  }

  private parseContent(content: string): any[] {
    try {
      // Clean the content by removing any markdown code blocks
      let cleanContent = content;
      
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanContent = jsonMatch[1];
      }
      
      // Remove any comments that might break JSON parsing
      cleanContent = cleanContent.replace(/\/\/[^\n\r]*/g, '');
      
      // Try to parse as JSON directly
      const parsed = JSON.parse(cleanContent);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error('❌ Error parsing JSON:', error);
      console.error('📄 Contenido completo recibido:', content);
      return [];
    }
  }
}

// Price validation functions
function guessCategory(ingredientName: string): string {
  const name = ingredientName.toLowerCase();
  
  // Especias (casos críticos primero)
  if (name.includes('pimienta') && name.includes('negra')) {
    return 'especias_premium'; // €15-25/kg para pimienta negra
  }
  
  if (name.includes('azafrán') || name.includes('saffron')) {
    return 'especias_premium'; // €3000-8000/kg
  }
  
  if (name.includes('fruta') && name.includes('pasión')) {
    return 'frutas_tropicales'; // €12-20/kg
  }
  
  // Frutas tropicales y exóticas
  if (name.includes('mango') || name.includes('aguacate') || name.includes('papaya') ||
      name.includes('guayaba') || name.includes('maracuyá')) {
    return 'frutas_tropicales';
  }
  
  // Especias comunes
  if (name.includes('pimienta') || name.includes('canela') || name.includes('clavo') ||
      name.includes('nuez moscada') || name.includes('comino')) {
    return 'especias_comunes';
  }
  
  // Hierbas frescas
  if (name.includes('albahaca') || name.includes('cilantro') || name.includes('perejil') ||
      name.includes('menta') || name.includes('romero')) {
    return 'hierbas_frescas';
  }
  
  // Carnes
  if (name.includes('carne') || name.includes('pollo') || name.includes('cerdo') ||
      name.includes('ternera') || name.includes('cordero') || name.includes('jamón') ||
      name.includes('chorizo') || name.includes('morcilla') || name.includes('bacón')) {
    return 'carnes';
  }
  
  // Aceites
  if (name.includes('aceite')) {
    return 'aceites';
  }
  
  return 'general';
}

function validateHorecaPrice(price: number, category: string, ingredientName: string): boolean {
  const priceRanges = {
    frutas_tropicales: { min: 8, max: 25 },
    especias_premium: { min: 15, max: 100 }, // Para pimienta negra y especias caras
    especias_comunes: { min: 8, max: 30 },
    hierbas_frescas: { min: 15, max: 50 },
    carnes: { min: 3, max: 60 },
    aceites: { min: 2, max: 50 },
    general: { min: 0.5, max: 30 }
  };
  
  // Casos especiales críticos
  const nameLower = ingredientName.toLowerCase();
  
  if (nameLower.includes('azafrán')) {
    return price >= 3000 && price <= 8000;
  }

  if (nameLower.includes('pimienta') && nameLower.includes('negra')) {
    return price >= 15 && price <= 25; // Rango específico para pimienta negra
  }

  if (nameLower.includes('fruta') && nameLower.includes('pasión')) {
    return price >= 12 && price <= 20;
  }

  const range = priceRanges[category as keyof typeof priceRanges] || priceRanges.general;
  return price >= range.min && price <= range.max;
}

// Pricing processor
async function processMultiCountryPrices(ingredientId: string, pricesData: any[]) {
  const pricesToInsert = [];
  
  console.log(`💰 Procesando precios para ingrediente ${ingredientId}:`, pricesData.length, 'países');
  
  for (const priceData of pricesData) {
    try {
      // Get country by code
      const { data: country, error: countryError } = await supabase
        .from('countries')
        .select('id')
        .eq('code', priceData.country_code)
        .single();
      
      if (countryError) {
        console.log(`⚠️ País no encontrado para código ${priceData.country_code}:`, countryError);
        continue;
      }
      
      if (country && priceData.price && priceData.price > 0) {
        pricesToInsert.push({
          ingredient_id: ingredientId,
          country_id: country.id,
          price: priceData.price,
          unit: priceData.unit || 'kg'
        });
        console.log(`✅ Precio agregado: ${priceData.country} - €${priceData.price}/${priceData.unit || 'kg'}`);
      }
    } catch (error) {
      console.error(`❌ Error procesando precio para ${priceData.country}:`, error);
    }
  }
  
  if (pricesToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('ingredient_prices')
      .insert(pricesToInsert);
      
    if (insertError) {
      console.error('❌ Error insertando precios:', insertError);
      throw insertError;
    }
    
    console.log(`💾 ${pricesToInsert.length} precios insertados exitosamente`);
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
    console.log('🚀 === INICIANDO ACTUALIZACIÓN DE PRECIOS HORECA ===');
    
    // Security check: Verify super admin access
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
    const { mode = 'problematic', ingredientIds, batchSize = 3 } = requestBody;

    console.log(`🎯 Modo: ${mode}, Lote: ${batchSize}`);

    let targetIngredients = [];

    if (mode === 'all') {
      const { data: allIngredients, error } = await supabase
        .from('ingredients')
        .select('id, name, name_en')
        .order('created_at', { ascending: true });

      if (error) throw new Error(`Error obteniendo ingredientes: ${error.message}`);
      targetIngredients = allIngredients;
      console.log(`📋 Procesando TODOS los ingredientes: ${targetIngredients.length}`);
      
    } else if (mode === 'specific' && ingredientIds) {
      const { data: specificIngredients, error } = await supabase
        .from('ingredients')
        .select('id, name, name_en')
        .in('id', ingredientIds);

      if (error) throw new Error(`Error obteniendo ingredientes específicos: ${error.message}`);
      targetIngredients = specificIngredients;
      console.log(`🎯 Procesando ingredientes específicos: ${targetIngredients.length}`);
      
    } else {
      // Modo por defecto: ingredientes con precios problemáticos
      console.log('🔍 Identificando ingredientes con precios problemáticos...');
      
      const { data: ingredientsWithPrices, error } = await supabase
        .from('ingredient_prices')
        .select(`
          ingredient_id,
          price,
          unit,
          ingredients!inner(id, name, name_en)
        `);

      if (error) throw new Error(`Error obteniendo precios existentes: ${error.message}`);

      const problematicIngredients = new Set();
      let totalPricesChecked = 0;
      let problematicPricesFound = 0;

      for (const priceRecord of ingredientsWithPrices) {
        totalPricesChecked++;
        const ingredient = priceRecord.ingredients;
        const category = guessCategory(ingredient.name);
        const isValidPrice = validateHorecaPrice(priceRecord.price, category, ingredient.name);
        
        if (!isValidPrice) {
          problematicIngredients.add(ingredient.id);
          problematicPricesFound++;
          console.log(`🚨 Precio problemático detectado: ${ingredient.name} - €${priceRecord.price} (categoría: ${category})`);
        }
      }

      const { data: uniqueProblematic, error: uniqueError } = await supabase
        .from('ingredients')
        .select('id, name, name_en')
        .in('id', Array.from(problematicIngredients));

      if (uniqueError) throw new Error(`Error obteniendo ingredientes problemáticos: ${uniqueError.message}`);

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

    // Procesar en lotes más pequeños
    for (let i = 0; i < targetIngredients.length; i += batchSize) {
      const batch = targetIngredients.slice(i, i + batchSize);
      console.log(`🔄 Procesando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(targetIngredients.length/batchSize)}`);
      
      for (const ingredient of batch) {
        try {
          console.log(`📊 === ACTUALIZANDO: ${ingredient.name} ===`);
          
          // Prompt específico y limpio para actualización de precios
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
                  "country": "Italia", 
                  "country_code": "IT", 
                  "price": 17.60, 
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
                },
                {
                  "country": "Argentina", 
                  "country_code": "AR", 
                  "price": 4200.00, 
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
            reason: error.message
          });
        }
        
        processedCount++;
        
        // Pausa entre ingredientes para evitar rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Pausa entre lotes
      if (i + batchSize < targetIngredients.length) {
        console.log('⏸️ Pausa entre lotes (5 segundos)...');
        await new Promise(resolve => setTimeout(resolve, 5000));
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

    console.log(`🎉 === ACTUALIZACIÓN COMPLETADA ===`);
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
    console.error('❌ Error crítico en update-ingredient-prices:', error);
    
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
