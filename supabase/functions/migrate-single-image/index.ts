
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

// Security function to verify super admin access
async function verifySuperAdminAccess(authHeader: string | null): Promise<{ authorized: boolean, userEmail?: string }> {
  if (!authHeader) {
    console.log('❌ No authorization header provided');
    return { authorized: false };
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.log('❌ Invalid or expired token:', userError?.message);
      return { authorized: false };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('❌ Error fetching user profile:', profileError.message);
      return { authorized: false, userEmail: user.email };
    }

    if (profile.role !== 'super_admin') {
      console.log('❌ User is not a super admin:', profile.email);
      return { authorized: false, userEmail: profile.email };
    }

    return { authorized: true, userEmail: profile.email };
  } catch (error) {
    console.log('❌ Error verifying admin access:', error);
    return { authorized: false };
  }
}

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

  // Verify super admin access
  const authHeader = req.headers.get('Authorization');
  const { authorized, userEmail } = await verifySuperAdminAccess(authHeader);

  if (!authorized) {
    console.log('🚫 Unauthorized access attempt from:', userEmail || 'unknown user');
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Unauthorized: Super admin access required' 
    }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log('✅ Super admin access verified for:', userEmail);

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
