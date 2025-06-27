
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

    // Verificar si Perplexity API Key está disponible
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    console.log('🔑 Perplexity API Key status:', perplexityApiKey ? `Presente (${perplexityApiKey.length} chars)` : 'NO ENCONTRADA');

    // Get existing ingredients to avoid duplicates
    console.log('📋 Obteniendo ingredientes existentes...');
    let existingIngredients = [];
    try {
      existingIngredients = await getExistingIngredients();
      console.log('📊 Ingredientes existentes cargados:', existingIngredients.length);
    } catch (existingError) {
      console.log('⚠️ Error obteniendo ingredientes existentes:', existingError.message);
    }

    // MODO DEBUGGING TEMPORAL: Usar datos fallback para probar que funciona
    console.log('🔧 === MODO DEBUGGING: USANDO DATOS FALLBACK ===');
    console.log('🎯 Esto es temporal para verificar que la función se ejecuta correctamente');
    
    try {
      const fallbackData = createFallbackData(requestBody);
      console.log('✅ Datos fallback generados:', fallbackData.length, 'elementos');

      // Log successful generation (modo debugging)
      await logAdminAction('generate_content_debug', requestBody.type || 'ingredient', {
        count: fallbackData.length,
        category: requestBody.category,
        region: requestBody.region,
        generated_count: fallbackData.length,
        ai_provider: 'debug_fallback',
        generation_mode: requestBody.ingredientsList ? 'manual' : 'automatic',
        debug_mode: true,
        perplexity_available: !!perplexityApiKey
      });

      const response = buildFallbackResponse(
        fallbackData,
        requestBody.ingredientsList ? 'manual' : 'automatic',
        'Modo debugging activo - usando datos de prueba para verificar funcionamiento'
      );

      console.log('📤 Sending debug response:', {
        success: response.success,
        generated_count: response.generated_count,
        ai_provider: response.ai_provider,
        generation_mode: response.generation_mode
      });

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
