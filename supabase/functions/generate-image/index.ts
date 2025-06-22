
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

    // Prompt modificado para ilustraciones minimalistas
    const prompt = `Delicate minimalist illustration of ${ingredientName}, ${description || ''}. Clean vector-style artwork with natural colors, simple elegant lines, and accurate botanical/culinary representation. Subtle shadows, white background, professional food illustration style, recognizable ingredient characteristics, 800x800 resolution, high quality illustration.`;
    
    const negativePrompt = "photograph, photo, realistic, 3D render, camera, lens, shadows, complex background, cluttered, busy, ornate, decorative elements, text, watermarks";

    console.log('Generando ilustración para:', ingredientName);
    console.log('Prompt:', prompt);

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "671ac676df456e5c4cc11b5c5f3c169aed57b47e0816e99da0a71121e988e3ca", // Versión actualizada de Flux 1.1 Pro
        input: {
          prompt: prompt,
          negative_prompt: negativePrompt,
          aspect_ratio: "1:1",
          output_format: "jpeg",
          output_quality: 90,
          safety_tolerance: 5,
          seed: Math.floor(Math.random() * 1000000),
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error de Replicate: ${response.status} - ${errorText}`);
    }

    const prediction = await response.json();
    console.log('Predicción creada:', prediction.id);

    // Polling para esperar el resultado
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${replicateApiKey}`,
        },
      });
      
      result = await pollResponse.json();
      console.log('Estado de la generación:', result.status);
    }

    if (result.status === 'succeeded' && result.output) {
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      
      return new Response(JSON.stringify({ 
        success: true,
        imageUrl: imageUrl,
        image_url: imageUrl, // Para compatibilidad con el frontend
        prompt: prompt
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
