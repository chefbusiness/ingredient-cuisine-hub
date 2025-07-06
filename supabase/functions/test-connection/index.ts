
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 === FUNCIÓN DE DIAGNÓSTICO INICIADA ===');
    
    // Verificar variables de entorno básicas
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    console.log('🔍 Verificando variables de entorno:');
    console.log('✅ SUPABASE_URL:', !!supabaseUrl);
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
    console.log('✅ PERPLEXITY_API_KEY:', !!perplexityKey);
    
    if (perplexityKey) {
      console.log('🔑 PERPLEXITY_API_KEY longitud:', perplexityKey.length);
      console.log('🔑 PERPLEXITY_API_KEY inicio:', perplexityKey.substring(0, 10) + '...');
    }

    // Test detallado de conectividad con Perplexity
    let perplexityTest = false;
    let perplexityError = null;
    let perplexityDetails = {};
    
    if (perplexityKey) {
      try {
        console.log('🌐 Probando conectividad con Perplexity...');
        console.log('🔑 API Key format check:', perplexityKey.startsWith('pplx-') ? 'CORRECTO' : 'FORMATO INCORRECTO');
        
        const testResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [
              { role: 'user', content: 'Test connection - respond with "OK"' }
            ],
            max_tokens: 10
          }),
        });
        
        perplexityTest = testResponse.ok;
        perplexityDetails = {
          status: testResponse.status,
          statusText: testResponse.statusText,
          headers: Object.fromEntries(testResponse.headers.entries())
        };
        
        console.log('🌐 Test Perplexity:', perplexityTest ? 'ÉXITO' : 'FALLO');
        console.log('📊 Response status:', testResponse.status, testResponse.statusText);
        
        if (!testResponse.ok) {
          const errorText = await testResponse.text();
          console.log('❌ Error de Perplexity:', testResponse.status, errorText);
          perplexityError = {
            status: testResponse.status,
            statusText: testResponse.statusText,
            body: errorText
          };
          
          // Diagnóstico específico por código de error
          if (testResponse.status === 401) {
            console.log('🔐 DIAGNÓSTICO: API Key inválida o expirada');
          } else if (testResponse.status === 429) {
            console.log('⏱️ DIAGNÓSTICO: Límite de rate alcanzado');
          } else if (testResponse.status === 402) {
            console.log('💰 DIAGNÓSTICO: Sin créditos disponibles');
          } else if (testResponse.status >= 500) {
            console.log('🚨 DIAGNÓSTICO: Error temporal del servidor de Perplexity');
          }
        } else {
          const responseData = await testResponse.json();
          console.log('✅ Respuesta exitosa de Perplexity:', responseData);
        }
      } catch (error) {
        console.log('❌ Error conectando con Perplexity:', error.message);
        perplexityError = {
          type: 'network_error',
          message: error.message,
          stack: error.stack
        };
      }
    }

    const diagnosticResult = {
      success: true,
      timestamp: new Date().toISOString(),
      environment_variables: {
        supabase_url_present: !!supabaseUrl,
        supabase_key_present: !!supabaseKey,
        perplexity_key_present: !!perplexityKey,
        perplexity_key_length: perplexityKey ? perplexityKey.length : 0,
        perplexity_key_format: perplexityKey ? (perplexityKey.startsWith('pplx-') ? 'CORRECTO' : 'INCORRECTO') : 'N/A'
      },
      connectivity_tests: {
        perplexity_api: perplexityTest,
        perplexity_details: perplexityDetails,
        perplexity_error: perplexityError
      },
      diagnostics: {
        perplexity_status: perplexityTest ? 'FUNCIONANDO' : 'CON PROBLEMAS',
        recommendations: perplexityError ? [
          perplexityError.status === 401 ? 'Verificar que la API Key sea válida y esté activa en tu cuenta de Perplexity' :
          perplexityError.status === 429 ? 'Has alcanzado el límite de requests. Espera un momento antes de volver a intentar' :
          perplexityError.status === 402 ? 'Sin créditos disponibles en tu cuenta de Perplexity. Revisar el plan de facturación' :
          perplexityError.status >= 500 ? 'Error temporal del servidor de Perplexity. Intentar de nuevo en unos minutos' :
          perplexityError.type === 'network_error' ? 'Problema de conectividad de red. Verificar conexión a internet' :
          'Error desconocido. Revisar logs para más detalles'
        ] : ['Todo funcionando correctamente']
      },
      message: 'Función de diagnóstico ejecutada correctamente'
    };

    console.log('✅ Diagnóstico completado:', JSON.stringify(diagnosticResult, null, 2));

    return new Response(JSON.stringify(diagnosticResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error en función de diagnóstico:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
