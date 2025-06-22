
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
async function verifySuperAdminAccess(authHeader: string | null): Promise<boolean> {
  if (!authHeader) {
    console.log('❌ No authorization header provided');
    return false;
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.log('❌ Invalid or expired token:', userError?.message);
      return false;
    }

    // Use the new security function to check super admin status
    const { data: isSuperAdmin, error: roleError } = await supabase
      .rpc('verify_super_admin_access');

    if (roleError) {
      console.log('❌ Error checking super admin status:', roleError.message);
      return false;
    }

    if (!isSuperAdmin) {
      console.log('❌ User is not a super admin:', user.email);
      return false;
    }

    console.log('✅ Super admin access verified for:', user.email);
    return true;
  } catch (error) {
    console.log('❌ Error verifying admin access:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security check: Verify super admin access
    const authHeader = req.headers.get('authorization');
    const isAuthorized = await verifySuperAdminAccess(authHeader);
    
    if (!isAuthorized) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized: Super admin access required',
        code: 'UNAUTHORIZED'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
