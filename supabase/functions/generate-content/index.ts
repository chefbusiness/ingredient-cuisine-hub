
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
    console.log('🔄 Processing generate-content request...');
    
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

    const { type, count, category, additionalPrompt } = await req.json();

    // Input validation and sanitization
    if (!type || !['ingredient', 'category'].includes(type)) {
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

    console.log(`🔄 Generating ${validatedCount} ${type}(s) for category: ${sanitizedCategory}`);

    let generatedData;
    if (type === 'ingredient') {
      generatedData = await generateIngredientData(validatedCount, sanitizedCategory, sanitizedPrompt);
    } else {
      // Category generation logic would go here
      generatedData = [];
    }

    console.log(`✅ Successfully generated ${generatedData.length} items`);

    // Log the admin action
    try {
      await supabase.rpc('log_admin_action', {
        action_type: 'generate_content',
        resource_type: type,
        action_details: {
          count: validatedCount,
          category: sanitizedCategory,
          generated_count: generatedData.length
        }
      });
    } catch (logError) {
      console.log('⚠️ Failed to log admin action:', logError);
      // Don't fail the request if logging fails
    }

    return new Response(JSON.stringify({ 
      success: true,
      data: generatedData,
      generated_count: generatedData.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in generate-content:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      code: 'INTERNAL_ERROR'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
