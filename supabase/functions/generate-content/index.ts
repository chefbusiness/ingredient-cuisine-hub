
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifySuperAdminAccess } from './auth.ts';
import { logAdminAction } from './logging.ts';
import { PerplexityClient } from './perplexity-client.ts';
import { generateIngredientPrompt } from './prompts/ingredient-prompts.ts';
import { generateCategoryPrompt } from './prompts/category-prompts.ts';
import { parseContent } from './content-parser.ts';
import { validateSources } from './source-validator.ts';
import { createFallbackData } from './fallback-data.ts';
import { buildSuccessResponse, buildFallbackResponse, buildErrorResponse } from './response-builder.ts';
import { getExistingIngredients } from './existing-ingredients.ts';
import { generateIngredientData, generateCategoryData } from './utils.ts'; // AÑADIDO: usar utils para modo manual

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 === GENERATE-CONTENT FUNCTION INICIANDO ===');
    console.log('📊 Request method:', req.method);
    console.log('📊 Timestamp:', new Date().toISOString());
    
    // Security check: Verify super admin access
    const authHeader = req.headers.get('authorization');
    console.log('🔐 Verificando autenticación...');
    
    const authResult = await verifySuperAdminAccess(authHeader);
    
    if (!authResult.authorized) {
      const errorMessage = authResult.userEmail 
        ? `Usuario ${authResult.userEmail} no tiene permisos de super admin. Contacta al administrador para obtener acceso.`
        : 'Se requiere autenticación de super admin para acceder a esta función.';
        
      console.log('❌ Unauthorized access attempt');
      return new Response(JSON.stringify({ 
        error: errorMessage,
        code: 'UNAUTHORIZED',
        userEmail: authResult.userEmail
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Authorization successful, processing request...');

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('📥 Request body received:', requestBody);
    } catch (parseError) {
      console.error('❌ Error parsing request body:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        code: 'INVALID_REQUEST_BODY'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DETECTAR MODO MANUAL: Verificar si hay ingredient específico, ingredientsList o categoriesList
    const isManualMode = (requestBody.ingredient && requestBody.ingredient.trim()) || 
                        (requestBody.ingredientsList && requestBody.ingredientsList.length > 0) ||
                        (requestBody.categoriesList && requestBody.categoriesList.length > 0);
    
    // DETECTAR TIPO DE CONTENIDO
    const isCategory = requestBody.type === 'category' || 
                      (requestBody.categoriesList && requestBody.categoriesList.length > 0);
    
    console.log('🎯 === MODO Y TIPO DETECTADO ===');
    console.log('📋 Modo manual detectado:', isManualMode);
    console.log('📋 Tipo de contenido:', isCategory ? 'CATEGORY' : 'INGREDIENT');
    console.log('📋 Ingrediente específico:', requestBody.ingredient || 'N/A');
    console.log('📋 Lista de ingredientes:', requestBody.ingredientsList?.length || 0);
    console.log('📋 Lista de categorías:', requestBody.categoriesList?.length || 0);

    // CREACIÓN DIRECTA DE CATEGORÍAS SIN IA
    if (isCategory && isManualMode && requestBody.categoriesList) {
      console.log('📂 === CREACIÓN DIRECTA DE CATEGORÍAS (SIN IA) ===');
      
      try {
        // Primero crear cliente de Supabase
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const savedCategories = [];
        
        for (const categoryName of requestBody.categoriesList) {
          const categoryData = {
            name: categoryName.trim(),
            name_en: categoryName.trim().toLowerCase(),
            description: `Categoría de ${categoryName.trim()}`
          };

          console.log('💾 Guardando categoría en BD:', categoryData.name);
          
          // Insertar directamente en la base de datos
          const { data: savedCategory, error: saveError } = await supabaseClient
            .from('categories')
            .insert(categoryData)
            .select()
            .single();

          if (saveError) {
            console.error('❌ Error guardando categoría:', saveError);
            throw saveError;
          }

          console.log('✅ Categoría guardada exitosamente:', savedCategory.name);
          savedCategories.push(savedCategory);
        }

        console.log('✅ Todas las categorías guardadas:', savedCategories.length);
        
        // Log successful generation
        await logAdminAction('generate_content_direct_categories', 'category', {
          count: savedCategories.length,
          category_names: savedCategories.map(c => c.name),
          generation_mode: 'direct_manual',
          ai_provider: 'none_direct_insertion'
        });

        const response = buildSuccessResponse(
          savedCategories,
          'none_direct_insertion',
          'direct_manual',
          'Categorías creadas y guardadas directamente sin IA'
        );

        console.log('📤 Sending direct categories response with saved data');

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      } catch (directError) {
        console.error('❌ Error en creación directa de categorías:', directError);
        throw directError;
      }
    }

    // Verificar si Perplexity API Key está disponible
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    console.log('🔑 Perplexity API Key status:', perplexityApiKey ? `Presente (${perplexityApiKey.length} chars)` : 'NO ENCONTRADA');

    // INTENTAR CON PERPLEXITY SOLO PARA INGREDIENTES
    if (perplexityApiKey && !isCategory) {
      console.log('🌐 === INTENTANDO GENERACIÓN CON PERPLEXITY (SOLO INGREDIENTES) ===');
      
      try {
        let generatedData;
        
        if (isManualMode) {
          console.log('🎯 === USANDO MODO MANUAL CON UTILS.TS ===');
          
          // SOLO MODO MANUAL PARA INGREDIENTES (SIN CAMBIOS)
          console.log('🥕 === PROCESANDO INGREDIENTES MANUALES ===');
          generatedData = await generateIngredientData(
            requestBody.count || 1,
            requestBody.category,
            '',
            requestBody.ingredientsList || (requestBody.ingredient ? [requestBody.ingredient] : undefined)
          );
        } else {
          // MODO AUTOMÁTICO: Usar PerplexityClient directamente
          console.log('🤖 === MODO AUTOMÁTICO: USAR CLIENT DIRECTO ===');
          const perplexityClient = new PerplexityClient();
          
          // Get existing ingredients to avoid duplicates
          console.log('📋 Obteniendo ingredientes existentes...');
          let existingIngredients = [];
          try {
            existingIngredients = await getExistingIngredients();
            console.log('📊 Ingredientes existentes cargados:', existingIngredients.length);
          } catch (existingError) {
            console.log('⚠️ Error obteniendo ingredientes existentes:', existingError.message);
          }
          
          const prompt = generateIngredientPrompt(requestBody, existingIngredients);
          console.log('📝 Prompt generado, longitud:', prompt.length);
          
          generatedData = await perplexityClient.generateContent(prompt);
        }
        
        if (generatedData && generatedData.length > 0) {
          console.log('✅ Perplexity respondió exitosamente:', generatedData.length, 'elementos');
          
          // Log successful generation
          await logAdminAction('generate_content_perplexity', requestBody.type || 'ingredient', {
            count: generatedData.length,
            category: requestBody.category,
            region: requestBody.region,
            generated_count: generatedData.length,
            ai_provider: 'perplexity_sonar_deep_research',
            generation_mode: isManualMode ? 'manual' : 'automatic',
            perplexity_success: true,
            requested_ingredient: requestBody.ingredient || undefined
          });

          const response = buildSuccessResponse(
            generatedData,
            'perplexity_sonar_deep_research',
            isManualMode ? 'manual' : 'automatic',
            'Contenido generado exitosamente con investigación web real de Perplexity'
          );

          console.log('📤 Sending successful Perplexity response');

          return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (perplexityError) {
        console.error('❌ Error con Perplexity, pasando a fallback:', perplexityError.message);
      }
    } else if (!isCategory) {
      console.log('⚠️ Perplexity API Key no disponible para ingredientes, usando fallback');
    }

    // FALLBACK: Usar datos de prueba si Perplexity falla
    console.log('🔧 === USANDO DATOS FALLBACK ===');
    
    try {
      const fallbackData = createFallbackData(requestBody);
      console.log('✅ Datos fallback generados:', fallbackData.length, 'elementos');

      // Log fallback generation
      await logAdminAction('generate_content_fallback', requestBody.type || 'ingredient', {
        count: fallbackData.length,
        category: requestBody.category,
        region: requestBody.region,
        generated_count: fallbackData.length,
        ai_provider: 'fallback_after_perplexity_error',
        generation_mode: isManualMode ? 'manual' : 'automatic',
        perplexity_available: !!perplexityApiKey,
        perplexity_success: false
      });

      const response = buildFallbackResponse(
        fallbackData,
        isManualMode ? 'manual' : 'automatic',
        perplexityApiKey ? 'Error temporal con Perplexity API - usando datos de prueba' : 'Perplexity API Key no configurada - usando datos de prueba'
      );

      console.log('📤 Sending fallback response');

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (fallbackError) {
      console.error('❌ Error en datos fallback:', fallbackError);
      throw fallbackError;
    }

  } catch (error) {
    console.error('❌ Error general en generate-content:', error);
    console.error('📊 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });
    
    const response = buildErrorResponse(error, 'INTERNAL_ERROR');
    
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
