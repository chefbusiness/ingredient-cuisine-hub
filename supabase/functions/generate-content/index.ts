
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { PerplexityClient } from './perplexity-client.ts';
import { generatePrompt } from './prompts.ts';

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

    console.log('✅ User authenticated:', user.email);

    // Check super admin status from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('❌ Error fetching user profile:', profileError.message);
      return { authorized: false, userEmail: user.email };
    }

    console.log('📋 User profile:', { email: profile.email, role: profile.role });

    if (profile.role !== 'super_admin') {
      console.log('❌ User is not a super admin:', profile.email, 'Current role:', profile.role);
      return { authorized: false, userEmail: profile.email };
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
    let existingIngredients: any[] = [];
    try {
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('ingredients')
        .select('name, name_en, categories(name)')
        .limit(1000);

      if (ingredientsError) {
        console.log('⚠️ Warning: Could not fetch existing ingredients:', ingredientsError.message);
      } else {
        existingIngredients = ingredients || [];
        console.log('📋 Loaded', existingIngredients.length, 'existing ingredients to avoid duplicates');
      }
    } catch (error) {
      console.log('⚠️ Warning: Error fetching existing ingredients:', error);
    }

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
      try {
        await supabase.rpc('log_admin_action', {
          action_type: 'generate_content_perplexity',
          resource_type: requestBody.type || 'ingredient',
          action_details: {
            count: generatedData.length,
            category: requestBody.category,
            region: requestBody.region,
            generated_count: generatedData.length,
            ai_provider: 'perplexity_sonar_deep_research',
            generation_mode: requestBody.ingredientsList ? 'manual' : 'automatic',
            perplexity_key_length: perplexityApiKey.length
          }
        });
      } catch (logError) {
        console.log('⚠️ Failed to log admin action:', logError);
        // Don't fail the request if logging fails
      }

      const response = { 
        success: true,
        data: generatedData,
        generated_count: generatedData.length,
        ai_provider: 'perplexity_sonar_deep_research',
        research_quality: 'professional_web_research',
        generation_mode: requestBody.ingredientsList ? 'manual' : 'automatic',
        message: 'Contenido generado exitosamente con investigación web real de Perplexity'
      };

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
      
      const mockIngredient = {
        name: "Ingrediente Fallback",
        name_en: "Fallback Ingredient",
        name_la: "Ingrediente Fallback",
        name_fr: "Ingrédient de Secours",
        name_it: "Ingrediente di Riserva",
        name_pt: "Ingrediente de Reserva",
        name_zh: "备用配料",
        description: "Este ingrediente fue generado como respaldo debido a un error temporal con la API de investigación. Los datos son de prueba.",
        category: requestBody.category || "verduras",
        temporada: "Todo el año",
        origen: "Datos de prueba",
        merma: 15.0,
        rendimiento: 85.0,
        popularity: 40,
        prices_by_country: [
          {
            country: "España",
            price: 8.50,
            unit: "kg",
            source: "Fallback - Datos de prueba",
            date: new Date().toISOString().split('T')[0]
          }
        ],
        recipes: [
          "Receta de prueba 1",
          "Receta de prueba 2"
        ],
        professional_uses: [
          "Uso profesional de prueba",
          "Aplicación gastronómica de prueba"
        ]
      };

      const fallbackData = requestBody.ingredientsList && requestBody.ingredientsList.length > 0
        ? requestBody.ingredientsList.map((ingredientName: string) => ({
            ...mockIngredient,
            name: ingredientName + " (Fallback)",
            name_en: ingredientName + " (Fallback)",
            requested_ingredient: ingredientName
          }))
        : [mockIngredient];

      // Log the fallback action
      try {
        await supabase.rpc('log_admin_action', {
          action_type: 'generate_content_fallback',
          resource_type: requestBody.type || 'ingredient',
          action_details: {
            count: fallbackData.length,
            category: requestBody.category,
            generated_count: fallbackData.length,
            ai_provider: 'fallback_mock',
            generation_mode: requestBody.ingredientsList ? 'manual' : 'automatic',
            error_reason: perplexityError.message,
            perplexity_key_present: !!perplexityApiKey
          }
        });
      } catch (logError) {
        console.log('⚠️ Failed to log fallback action:', logError);
      }

      return new Response(JSON.stringify({ 
        success: true,
        data: fallbackData,
        generated_count: fallbackData.length,
        ai_provider: 'fallback_after_perplexity_error',
        research_quality: 'fallback',
        generation_mode: requestBody.ingredientsList ? 'manual' : 'automatic',
        message: 'Contenido generado con datos de fallback debido a error temporal de Perplexity',
        warning: 'Error temporal con Perplexity API, se usaron datos de prueba'
      }), {
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
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
      ai_provider: 'error_state'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
