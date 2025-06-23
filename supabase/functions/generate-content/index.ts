
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { generateIngredientData } from './utils.ts';

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
    console.log('🔄 === GENERACIÓN DE CONTENIDO CON PERPLEXITY ===');
    console.log('📊 Request method:', req.method);
    console.log('📊 Request headers:', Object.fromEntries(req.headers));
    
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
    console.log('📥 Request body received:', {
      type: requestBody.type,
      count: requestBody.count,
      category: requestBody.category,
      hasIngredientsList: !!requestBody.ingredientsList,
      ingredientsListLength: requestBody.ingredientsList?.length || 0
    });

    const { type, count, category, additionalPrompt, ingredientsList } = requestBody;

    // Input validation and sanitization
    if (!type || !['ingredient', 'category'].includes(type)) {
      console.log('❌ Invalid type parameter:', type);
      return new Response(JSON.stringify({ 
        error: 'Invalid type parameter. Must be "ingredient" or "category"',
        code: 'INVALID_TYPE'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate count parameter
    const validatedCount = Math.min(Math.max(parseInt(count) || 1, 1), 50); // Limit to prevent abuse
    
    // Sanitize category input
    const sanitizedCategory = category ? category.toString().trim().slice(0, 100) : '';
    
    // Sanitize additional prompt
    const sanitizedPrompt = additionalPrompt ? additionalPrompt.toString().trim().slice(0, 500) : '';

    // Validate and sanitize ingredients list if provided
    let sanitizedIngredientsList: string[] | undefined;
    if (ingredientsList && Array.isArray(ingredientsList)) {
      sanitizedIngredientsList = ingredientsList
        .map(ingredient => ingredient.toString().trim())
        .filter(ingredient => ingredient.length > 0 && ingredient.length <= 100)
        .slice(0, 20); // Limit to 20 ingredients maximum
      
      console.log(`📝 Manual ingredient list provided: ${sanitizedIngredientsList.length} ingredients`);
      sanitizedIngredientsList.forEach((ingredient, idx) => {
        console.log(`   ${idx + 1}. "${ingredient}" (length: ${ingredient.length})`);
      });
    }

    if (sanitizedIngredientsList && sanitizedIngredientsList.length > 0) {
      console.log(`🎯 MODO MANUAL: Generando datos específicos para ${sanitizedIngredientsList.length} ingredientes`);
    } else {
      console.log(`🔄 MODO AUTOMÁTICO: Generando ${validatedCount} ${type}(s) para categoría: ${sanitizedCategory} usando PERPLEXITY SONAR`);
    }

    let generatedData;
    if (type === 'ingredient') {
      console.log('🚀 Starting ingredient data generation...');
      generatedData = await generateIngredientData(
        validatedCount, 
        sanitizedCategory, 
        sanitizedPrompt,
        sanitizedIngredientsList
      );
      console.log('🏁 Ingredient data generation completed, results:', generatedData.length);
    } else {
      // Category generation logic would go here
      console.log('📂 Category generation not implemented yet');
      generatedData = [];
    }

    const generationMode = sanitizedIngredientsList && sanitizedIngredientsList.length > 0 ? 'manual' : 'automatic';
    console.log(`✅ Successfully generated ${generatedData.length} items with Perplexity research (${generationMode} mode)`);

    // Log the admin action
    try {
      await supabase.rpc('log_admin_action', {
        action_type: 'generate_content_perplexity',
        resource_type: type,
        action_details: {
          count: validatedCount,
          category: sanitizedCategory,
          generated_count: generatedData.length,
          ai_provider: 'perplexity_sonar',
          generation_mode: generationMode,
          manual_ingredients: sanitizedIngredientsList || []
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
      ai_provider: 'perplexity_sonar',
      research_quality: 'high',
      generation_mode: generationMode
    };

    console.log('📤 Sending response:', {
      success: response.success,
      generated_count: response.generated_count,
      generation_mode: response.generation_mode
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in generate-content with Perplexity:', error);
    console.error('📊 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
      ai_provider: 'perplexity_sonar'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
