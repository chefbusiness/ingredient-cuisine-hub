
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

serve(async (req) => {
  console.log('🔄 === MIGRATE SINGLE IMAGE FUNCTION ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredientId, ingredientName, currentImageUrl } = await req.json();
    
    console.log(`📸 Migrating image for: ${ingredientName}`);
    console.log(`🔗 Current URL: ${currentImageUrl}`);
    
    // Skip if not a Replicate URL
    if (!currentImageUrl || !currentImageUrl.includes('replicate.delivery')) {
      console.log('⏭️ Skipping - not a Replicate URL');
      return new Response(JSON.stringify({ 
        success: true, 
        skipped: true, 
        reason: 'Not a Replicate URL' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Generate SEO filename
    const seoFileName = generateSEOFileName(ingredientName);
    
    // Download image from Replicate
    console.log('📥 Downloading from Replicate...');
    const response = await fetch(currentImageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }
    
    const imageBlob = await response.blob();
    const imageBuffer = await imageBlob.arrayBuffer();
    
    // Upload to Supabase Storage
    console.log('📤 Uploading to Supabase Storage...');
    const { data, error } = await supabase.storage
      .from('ingredient-images')
      .upload(seoFileName, imageBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: true
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('ingredient-images')
      .getPublicUrl(seoFileName);

    const newImageUrl = publicUrlData.publicUrl;
    
    // Update ingredient record
    console.log('💾 Updating ingredient record...');
    const { error: updateError } = await supabase
      .from('ingredients')
      .update({ 
        image_url: newImageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', ingredientId);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log(`✅ Successfully migrated: ${ingredientName}`);
    
    return new Response(JSON.stringify({ 
      success: true,
      oldUrl: currentImageUrl,
      newUrl: newImageUrl,
      storagePath: seoFileName
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Migration error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
