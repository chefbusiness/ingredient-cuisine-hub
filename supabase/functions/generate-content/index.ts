
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PerplexityClient } from './perplexity-client.ts';
import { generatePrompt } from './prompts.ts';
import { verifySuperAdminAccess } from './auth.ts';
import { logAdminAction } from './logging.ts';
import { createFallbackData } from './fallback-data.ts';
import { buildSuccessResponse, buildFallbackResponse, buildErrorResponse } from './response-builder.ts';
import { getExistingIngredients } from './existing-ingredients.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 === GENERATE-CONTENT FUNCTION CON PERPLEXITY COMPLETO ===');
    console.log('📊 Request method:', req.method);
    console.log('📊 Timestamp:', new Date().toISOString());
    
    // Security check: Verify super admin access
    const authHeader = req.headers.get('authorization');
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
    const requestBody = await req.json();
    console.log('📥 Request body received:', requestBody);

    // Verificar si Perplexity API Key está disponible
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      console.log('❌ PERPLEXITY_API_KEY no está configurada');
      return new Response(JSON.stringify({ 
        error: 'La clave PERPLEXITY_API_KEY no está configurada en las variables de entorno.',
        code: 'PERPLEXITY_KEY_MISSING',
        ai_provider: 'perplexity_missing'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🔑 Perplexity API Key encontrada, longitud:', perplexityApiKey.length);

    // Get existing ingredients to avoid duplicates
    const existingIngredients = await getExistingIngredients();

    // FUNCIONALIDAD COMPLETA DE PERPLEXITY
    console.log('🧠 === INICIANDO INVESTIGACIÓN CON PERPLEXITY SONAR DEEP RESEARCH ===');
    
    try {
      const perplexityClient = new PerplexityClient();
      
      // Generate prompt with existing ingredients context
      const prompt = generatePrompt(requestBody, existingIngredients);
      console.log('📝 Prompt generado para Perplexity (primeros 200 chars):', prompt.substring(0, 200) + '...');
      
      // Call Perplexity API
      console.log('🔍 Llamando a Perplexity Sonar Deep Research...');
      const generatedData = await perplexityClient.generateContent(prompt);
      
      console.log('🎉 Contenido generado exitosamente por Perplexity:', generatedData.length, 'elementos');
      
      // Log successful generation
      await logAdminAction('generate_content_perplexity', requestBody.type || 'ingredient', {
        count: generatedData.length,
        category: requestBody.category,
        region: requestBody.region,
        generated_count: generatedData.length,
        ai_provider: 'perplexity_sonar_deep_research',
        generation_mode: requestBody.ingredientsList ? 'manual' : 'automatic',
        perplexity_key_length: perplexityApiKey.length
      });

      const response = buildSuccessResponse(
        generatedData,
        'perplexity_sonar_deep_research',
        requestBody.ingredientsList ? 'manual' : 'automatic',
        'Contenido generado exitosamente con investigación web real de Perplexity'
      );

      console.log('📤 Sending successful Perplexity response:', {
        success: response.success,
        generated_count: response.generated_count,
        ai_provider: response.ai_provider,
        generation_mode: response.generation_mode
      });

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (perplexityError) {
      console.error('❌ Error en Perplexity:', perplexityError);
      console.error('📊 Perplexity error details:', {
        name: perplexityError.name,
        message: perplexityError.message,
        stack: perplexityError.stack?.substring(0, 500)
      });
      
      // En caso de error de Perplexity, devolver datos mock como fallback
      console.log('🚨 FALLBACK: Generando datos mock debido a error de Perplexity');
      
      const fallbackData = createFallbackData(requestBody);

      // Log the fallback action
      await logAdminAction('generate_content_fallback', requestBody.type || 'ingredient', {
        count: fallbackData.length,
        category: requestBody.category,
        generated_count: fallbackData.length,
        ai_provider: 'fallback_mock',
        generation_mode: requestBody.ingredientsList ? 'manual' : 'automatic',
        error_reason: perplexityError.message,
        perplexity_key_present: !!perplexityApiKey
      });

      const response = buildFallbackResponse(
        fallbackData,
        requestBody.ingredientsList ? 'manual' : 'automatic'
      );

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('❌ Error general en generate-content:', error);
    console.error('📊 General error details:', {
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
