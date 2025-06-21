
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

    // Crear prompt optimizado para ingredientes culinarios
    const prompt = `Professional food photography of ${ingredientName}, ${description || ''}, 
    high quality, clean white background, studio lighting, commercial food photography style, 
    8k resolution, ultra sharp focus, realistic textures, vibrant natural colors, 
    centered composition, ingredient photography for culinary catalog`;

    console.log("Generando imagen para:", ingredientName);
    console.log("Prompt:", prompt);

    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: prompt,
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 90,
          num_inference_steps: 4
        }
      }
    );

    console.log("Imagen generada:", output);

    return new Response(JSON.stringify({ 
      success: true,
      image_url: output[0],
      ingredient_name: ingredientName 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error en generate-image:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
