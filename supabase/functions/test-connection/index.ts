
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

    // Test simple de conectividad con Perplexity
    let perplexityTest = false;
    if (perplexityKey) {
      try {
        console.log('🌐 Probando conectividad con Perplexity...');
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
        console.log('🌐 Test Perplexity:', perplexityTest ? 'ÉXITO' : 'FALLO');
        
        if (!testResponse.ok) {
          const errorText = await testResponse.text();
          console.log('❌ Error de Perplexity:', testResponse.status, errorText);
        }
      } catch (error) {
        console.log('❌ Error conectando con Perplexity:', error.message);
      }
    }

    const diagnosticResult = {
      success: true,
      timestamp: new Date().toISOString(),
      environment_variables: {
        supabase_url_present: !!supabaseUrl,
        supabase_key_present: !!supabaseKey,
        perplexity_key_present: !!perplexityKey,
        perplexity_key_length: perplexityKey ? perplexityKey.length : 0
      },
      connectivity_tests: {
        perplexity_api: perplexityTest
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
