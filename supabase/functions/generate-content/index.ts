
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
import { generateIngredientData } from './utils.ts'; // AÑADIDO: usar utils para modo manual

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

    // DETECTAR MODO MANUAL: Verificar si hay ingredient específico o ingredientsList
    const isManualMode = (requestBody.ingredient && requestBody.ingredient.trim()) || 
                        (requestBody.ingredientsList && requestBody.ingredientsList.length > 0);
    
    console.log('🎯 === MODO DETECTADO ===');
    console.log('📋 Modo manual detectado:', isManualMode);
    console.log('📋 Ingrediente específico:', requestBody.ingredient || 'N/A');
    console.log('📋 Lista de ingredientes:', requestBody.ingredientsList?.length || 0);

    // Verificar si Perplexity API Key está disponible
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    console.log('🔑 Perplexity API Key status:', perplexityApiKey ? `Presente (${perplexityApiKey.length} chars)` : 'NO ENCONTRADA');

    // INTENTAR CON PERPLEXITY PRIMERO
    if (perplexityApiKey) {
      console.log('🌐 === INTENTANDO GENERACIÓN CON PERPLEXITY ===');
      
      try {
        let generatedData;
        
        if (isManualMode) {
          // CORREGIDO: Usar utils.ts para modo manual que tiene la lógica correcta
          console.log('🎯 === USANDO MODO MANUAL CON UTILS.TS ===');
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
    } else {
      console.log('⚠️ Perplexity API Key no disponible, usando fallback');
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
