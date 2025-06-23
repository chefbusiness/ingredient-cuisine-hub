
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const generateSEOFileName = (ingredientName: string) => {
  const cleanName = ingredientName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple hyphens
    .trim();
  
  const timestamp = Date.now();
  return `${cleanName}-${timestamp}.webp`;
};

const downloadAndUploadImage = async (imageUrl: string, fileName: string) => {
  console.log('📥 Downloading image from Replicate:', imageUrl.substring(0, 50) + '...');
  
  // Download image from Replicate
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  
  const imageBlob = await response.blob();
  const imageBuffer = await imageBlob.arrayBuffer();
  
  console.log('📤 Uploading image to Supabase Storage:', fileName);
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('ingredient-images')
    .upload(fileName, imageBuffer, {
      contentType: 'image/webp',
      cacheControl: '31536000', // 1 year cache
      upsert: true
    });

  if (error) {
    console.error('❌ Storage upload error:', error);
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  console.log('✅ Image uploaded successfully to storage:', data?.path);

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('ingredient-images')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};

serve(async (req) => {
  console.log('🖼️ === ENHANCED GENERATE-IMAGE WITH STORAGE ===');
  
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

    console.log('📝 Creating botanical illustration prompt...');
    const prompt = `Botanical illustration of ${finalIngredientName}, scientific botanical drawing style, watercolor and digital art technique, detailed textures, vibrant natural colors, clean white background, professional culinary illustration, ultra-detailed, artistic rendering`;
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
      const replicateImageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      
      console.log('✅ Image generated successfully from Replicate:', replicateImageUrl.substring(0, 50) + '...');
      
      // Generate SEO-friendly filename
      const seoFileName = generateSEOFileName(finalIngredientName);
      console.log('📝 Generated SEO filename:', seoFileName);
      
      try {
        // Download from Replicate and upload to Supabase Storage
        const supabaseImageUrl = await downloadAndUploadImage(replicateImageUrl, seoFileName);
        
        console.log('🎉 Image successfully migrated to Supabase Storage');
        
        return new Response(JSON.stringify({ 
          success: true,
          imageUrl: supabaseImageUrl, // Return Supabase URL instead of Replicate URL
          originalUrl: replicateImageUrl, // Keep original for backup
          storagePath: seoFileName,
          prompt: prompt,
          model: "flux-1.1-pro"
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      } catch (storageError) {
        console.error('❌ Storage migration failed, falling back to Replicate URL:', storageError);
        
        // Fallback: return original Replicate URL if storage fails
        return new Response(JSON.stringify({ 
          success: true,
          imageUrl: replicateImageUrl, // Fallback to Replicate URL
          storageError: storageError.message,
          prompt: prompt,
          model: "flux-1.1-pro"
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
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
