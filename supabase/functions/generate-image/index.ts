
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== INICIO DE GENERATE-IMAGE FUNCTION ===');
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('1. Leyendo el body de la request...');
    const body = await req.json();
    console.log('Body recibido:', JSON.stringify(body, null, 2));

    const { ingredientName, description, name } = body;
    const finalIngredientName = ingredientName || name;

    console.log('2. Verificando REPLICATE_API_KEY...');
    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    
    if (!replicateApiKey) {
      console.error('❌ REPLICATE_API_KEY no está configurado');
      throw new Error('REPLICATE_API_KEY no está configurado');
    }
    console.log('✅ REPLICATE_API_KEY está configurado');

    if (!finalIngredientName) {
      console.error('❌ Nombre del ingrediente es requerido');
      throw new Error('Nombre del ingrediente es requerido');
    }
    console.log('✅ Nombre del ingrediente:', finalIngredientName);

    console.log('3. Creando prompt...');
    const prompt = `Professional food illustration of ${finalIngredientName}, clean minimalist style, white background, high quality`;
    console.log('Prompt creado:', prompt);

    console.log('4. Haciendo llamada a Replicate API...');
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "f2ab8a5569070ad56005b2fba7d8059c9887d8a6c5b8de55", // Flux Schnell
        input: {
          prompt: prompt,
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
          num_inference_steps: 4
        },
      }),
    });

    console.log('5. Respuesta de Replicate status:', replicateResponse.status);

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      console.error('❌ Error de Replicate API:', {
        status: replicateResponse.status,
        statusText: replicateResponse.statusText,
        error: errorText
      });
      throw new Error(`Error de Replicate: ${replicateResponse.status} - ${errorText}`);
    }

    console.log('6. Parseando respuesta de predicción...');
    const prediction = await replicateResponse.json();
    console.log('Predicción inicial:', JSON.stringify(prediction, null, 2));

    console.log('7. Iniciando polling para resultado...');
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 20; // Reducido para evitar timeouts largos

    while ((result.status === 'starting' || result.status === 'processing') && attempts < maxAttempts) {
      console.log(`Intento ${attempts + 1}/${maxAttempts} - Estado: ${result.status}`);
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 segundos entre polls
      attempts++;
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${replicateApiKey}`,
        },
      });
      
      if (!pollResponse.ok) {
        console.error('❌ Error al verificar estado:', pollResponse.status);
        throw new Error(`Error al verificar estado: ${pollResponse.status}`);
      }
      
      result = await pollResponse.json();
      console.log(`Estado actual: ${result.status}`);
    }

    console.log('8. Resultado final:', JSON.stringify(result, null, 2));

    if (result.status === 'succeeded' && result.output) {
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      
      console.log('✅ Imagen generada exitosamente:', imageUrl);
      
      return new Response(JSON.stringify({ 
        success: true,
        imageUrl: imageUrl,
        image_url: imageUrl, // Para compatibilidad
        prompt: prompt
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (attempts >= maxAttempts) {
      console.error('❌ Timeout: La generación tomó demasiado tiempo');
      throw new Error('Timeout: La generación de imagen tomó demasiado tiempo');
    } else {
      console.error('❌ Error en la generación:', result.error || result.status);
      throw new Error(`Error en la generación: ${result.error || 'Estado: ' + result.status}`);
    }

  } catch (error) {
    console.error('❌ ERROR GENERAL en generate-image:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
