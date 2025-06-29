
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifySuperAdminAccess } from './auth.ts';
import { processIngredients } from './ingredient-processor.ts';
import { processCategories } from './category-processor.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 === SAVE-GENERATED-CONTENT INICIANDO CON AUDIT LOG SEGURO ===');
    
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

    console.log('✅ Authorization successful, processing save request...');
    console.log('🔑 Usuario autenticado:', authResult.userEmail);

    const { type, data, isManualMode } = await req.json();

    // Input validation
    if (!type || !['ingredient', 'category'].includes(type)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid type parameter',
        code: 'INVALID_TYPE'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(data) || data.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Data must be a non-empty array',
        code: 'INVALID_DATA'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Limit batch size to prevent abuse
    if (data.length > 50) {
      return new Response(JSON.stringify({ 
        error: 'Batch size too large. Maximum 50 items allowed.',
        code: 'BATCH_TOO_LARGE'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📋 Processing ${data.length} ${type}(s) for user: ${authResult.userEmail} ${isManualMode ? '(MODO MANUAL ULTRA-PERMISIVO)' : '(MODO AUTOMÁTICO ESTRICTO)'}`);

    if (type === 'ingredient') {
      const result = await processIngredients(data, authResult.userEmail!, isManualMode || false);
      
      console.log('🎉 === PROCESAMIENTO DE INGREDIENTES COMPLETADO ===');
      console.log('📊 Resultado final:', {
        success: result.success,
        created: result.summary.successfully_created,
        duplicates: result.summary.duplicates_skipped,
        mode: isManualMode ? 'MANUAL_ULTRA_PERMISSIVE' : 'AUTOMATIC_STRICT'
      });
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'category') {
      const result = await processCategories(data, authResult.userEmail!);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Tipo de contenido no soportado');

  } catch (error) {
    console.error('❌ === ERROR CRÍTICO EN SAVE-GENERATED-CONTENT ===');
    console.error('❌ Error details:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
