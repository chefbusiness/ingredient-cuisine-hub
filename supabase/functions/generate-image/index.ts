
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
    const { ingredientName, description } = await req.json();
    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');

    if (!replicateApiKey) {
      throw new Error('REPLICATE_API_KEY no está configurado');
    }

    if (!ingredientName) {
      throw new Error('ingredientName es requerido');
    }

    // Prompt optimizado para ilustraciones minimalistas
    const prompt = `Professional food illustration of ${ingredientName}, ${description || ''}. Clean minimalist style, natural colors, simple elegant lines, accurate representation. White background, high quality, 800x800 resolution.`;
    
    console.log('Generando ilustración para:', ingredientName);
    console.log('Prompt:', prompt);

    // Usando Flux Schnell que es más confiable y gratuito
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "f2ab8a5569070ad56005b2fba7d8059c9887d8a6c5b8de55",  // Flux Schnell - modelo confiable
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error de Replicate:', response.status, errorText);
      throw new Error(`Error de Replicate: ${response.status} - ${errorText}`);
    }

    const prediction = await response.json();
    console.log('Predicción creada:', prediction.id);

    // Polling para esperar el resultado
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 30; // Máximo 60 segundos de espera

    while ((result.status === 'starting' || result.status === 'processing') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${replicateApiKey}`,
        },
      });
      
      if (!pollResponse.ok) {
        console.error('Error al verificar estado:', pollResponse.status);
        throw new Error(`Error al verificar estado: ${pollResponse.status}`);
      }
      
      result = await pollResponse.json();
      console.log('Estado de la generación:', result.status, `(intento ${attempts}/${maxAttempts})`);
    }

    if (result.status === 'succeeded' && result.output) {
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      
      console.log('Imagen generada exitosamente:', imageUrl);
      
      return new Response(JSON.stringify({ 
        success: true,
        imageUrl: imageUrl,
        image_url: imageUrl, // Para compatibilidad con el frontend
        prompt: prompt
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (attempts >= maxAttempts) {
      throw new Error('Timeout: La generación de imagen tomó demasiado tiempo');
    } else {
      throw new Error(`Error en la generación: ${result.error || 'Estado: ' + result.status}`);
    }

  } catch (error) {
    console.error('Error en generate-image:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
