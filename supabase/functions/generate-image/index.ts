
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🖼️ === GENERATE-IMAGE FUNCTION START ===');
  
  if (req.method === 'OPTIONS') {
    console.log('⚡ Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📋 Reading request body...');
    const body = await req.json();
    console.log('📥 Body received:', JSON.stringify(body, null, 2));

    const { ingredientName, name, description } = body;
    const finalIngredientName = ingredientName || name;

    console.log('🔑 Checking REPLICATE_API_KEY...');
    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    
    if (!replicateApiKey) {
      console.error('❌ REPLICATE_API_KEY not configured');
      throw new Error('REPLICATE_API_KEY not configured');
    }
    console.log('✅ REPLICATE_API_KEY is configured');

    if (!finalIngredientName) {
      console.error('❌ Ingredient name is required');
      throw new Error('Ingredient name is required');
    }
    console.log('✅ Ingredient name:', finalIngredientName);

    console.log('📝 Creating professional prompt...');
    const prompt = `Professional food photography of ${finalIngredientName}, high-end culinary photography, macro lens, natural studio lighting, clean white background, food styling, commercial quality, ultra-detailed, realistic textures, fresh appearance`;
    console.log('📝 Prompt:', prompt);

    console.log('🚀 Making Replicate API call...');
    
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "black-forest-labs/flux-1.1-pro",
        input: {
          prompt: prompt,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 95,
          safety_tolerance: 2,
          prompt_upsampling: true
        },
      }),
    });

    console.log('📊 Replicate response status:', replicateResponse.status);

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      console.error('❌ Replicate API error:', {
        status: replicateResponse.status,
        statusText: replicateResponse.statusText,
        error: errorText
      });
      throw new Error(`Replicate error: ${replicateResponse.status} - ${errorText}`);
    }

    console.log('⏳ Parsing prediction response...');
    const prediction = await replicateResponse.json();
    console.log('📋 Initial prediction:', { id: prediction.id, status: prediction.status });

    console.log('🔄 Starting polling for result...');
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 15;

    while ((result.status === 'starting' || result.status === 'processing') && attempts < maxAttempts) {
      console.log(`🔄 Attempt ${attempts + 1}/${maxAttempts} - Status: ${result.status}`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      attempts++;
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${replicateApiKey}`,
        },
      });
      
      if (!pollResponse.ok) {
        console.error('❌ Error polling status:', pollResponse.status);
        throw new Error(`Error polling status: ${pollResponse.status}`);
      }
      
      result = await pollResponse.json();
      console.log(`📊 Current status: ${result.status}`);
    }

    console.log('🏁 Final result:', { status: result.status, hasOutput: !!result.output });

    if (result.status === 'succeeded' && result.output) {
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      
      console.log('✅ Image generated successfully:', imageUrl.substring(0, 50) + '...');
      
      return new Response(JSON.stringify({ 
        success: true,
        imageUrl: imageUrl,
        prompt: prompt,
        model: "flux-1.1-pro"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (attempts >= maxAttempts) {
      console.error('❌ Timeout: Generation took too long');
      throw new Error('Timeout: Image generation took too long');
    } else {
      console.error('❌ Generation failed:', result.error || result.status);
      throw new Error(`Generation failed: ${result.error || 'Status: ' + result.status}`);
    }

  } catch (error) {
    console.error('❌ GENERAL ERROR in generate-image:', {
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
