
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    if (!replicateApiKey) {
      throw new Error('REPLICATE_API_KEY no configurada');
    }

    const replicate = new Replicate({
      auth: replicateApiKey,
    });

    const body = await req.json();
    const { ingredientName, description } = body;

    if (!ingredientName) {
      return new Response(
        JSON.stringify({ error: "ingredientName es requerido" }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Prompt optimizado para Flux 1.1 Pro - fotografía culinaria profesional
    const prompt = `Professional culinary photography of ${ingredientName}, ${description || ''}, 
    shot with macro lens, studio lighting setup with softbox and reflectors, 
    clean white seamless background, commercial food photography style, 
    ultra high resolution 8k, razor sharp focus, natural vibrant colors, 
    perfect lighting gradient, professional food styling, 
    centered composition for ingredient catalog, photorealistic textures, 
    commercial quality suitable for culinary directory, 
    depth of field with ingredient in perfect focus`;

    console.log("Generando imagen con Flux 1.1 Pro para:", ingredientName);
    console.log("Prompt optimizado:", prompt);

    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt: prompt,
          width: 1024,
          height: 1024,
          num_outputs: 1,
          output_format: "webp",
          output_quality: 95,
          num_inference_steps: 30,
          guidance_scale: 3.5,
          safety_tolerance: 2,
          seed: Math.floor(Math.random() * 1000000)
        }
      }
    );

    console.log("Imagen generada con Flux 1.1 Pro:", output);

    return new Response(JSON.stringify({ 
      success: true,
      image_url: Array.isArray(output) ? output[0] : output,
      ingredient_name: ingredientName,
      model_used: "flux-1.1-pro"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error en generate-image con Flux 1.1 Pro:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
