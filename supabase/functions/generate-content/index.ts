
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
    console.log('🔄 === GENERATE-CONTENT FUNCTION EJECUTÁNDOSE ===');
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

    // VERSIÓN SIMPLIFICADA - Solo responder con datos mock
    console.log('🧪 === VERSIÓN DE PRUEBA - GENERANDO DATOS MOCK ===');
    
    const mockIngredient = {
      name: "Ingrediente de Prueba",
      name_en: "Test Ingredient",
      name_la: "Ingrediente de Prueba",
      name_fr: "Ingrédient de Test",
      name_it: "Ingrediente di Prova",
      name_pt: "Ingrediente de Teste",
      name_zh: "测试配料",
      description: "Este es un ingrediente generado para probar que la función funciona correctamente. Se puede usar en diversas preparaciones culinarias.",
      category: requestBody.category || "verduras",
      temporada: "Todo el año",
      origen: "España",
      merma: 10.0,
      rendimiento: 90.0,
      popularity: 50,
      prices_by_country: [
        {
          country: "España",
          price: 5.50,
          unit: "kg",
          source: "Test - Frutas Eloy",
          date: new Date().toISOString().split('T')[0]
        },
        {
          country: "Francia",
          price: 6.20,
          unit: "kg", 
          source: "Test - Metro France",
          date: new Date().toISOString().split('T')[0]
        }
      ],
      recipes: [
        "Ensalada mediterránea de prueba",
        "Salteado de verduras test",
        "Crema de ingrediente de prueba"
      ],
      professional_uses: [
        "Ideal para ensaladas y guarniciones",
        "Perfecto para elaboraciones frías",
        "Excelente para decoración de platos"
      ]
    };

    const mockData = requestBody.ingredientsList && requestBody.ingredientsList.length > 0
      ? requestBody.ingredientsList.map((ingredientName: string) => ({
          ...mockIngredient,
          name: ingredientName,
          name_en: ingredientName,
          requested_ingredient: ingredientName
        }))
      : [mockIngredient];

    console.log('🎉 Mock data generated successfully:', mockData.length, 'items');

    // Log the admin action
    try {
      await supabase.rpc('log_admin_action', {
        action_type: 'generate_content_test',
        resource_type: requestBody.type || 'ingredient',
        action_details: {
          count: mockData.length,
          category: requestBody.category,
          generated_count: mockData.length,
          ai_provider: 'mock_test',
          generation_mode: requestBody.ingredientsList ? 'manual' : 'automatic'
        }
      });
    } catch (logError) {
      console.log('⚠️ Failed to log admin action:', logError);
      // Don't fail the request if logging fails
    }

    const response = { 
      success: true,
      data: mockData,
      generated_count: mockData.length,
      ai_provider: 'mock_test_version',
      research_quality: 'test',
      generation_mode: requestBody.ingredientsList ? 'manual' : 'automatic',
      message: 'Función ejecutándose correctamente - versión de prueba'
    };

    console.log('📤 Sending successful response:', {
      success: response.success,
      generated_count: response.generated_count,
      generation_mode: response.generation_mode
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in generate-content test version:', error);
    console.error('📊 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
      ai_provider: 'mock_test_version'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
