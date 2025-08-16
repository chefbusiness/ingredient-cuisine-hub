
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
    return { authorized: false };
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return { authorized: false };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (profileError || profile.role !== 'super_admin') {
      return { authorized: false, userEmail: profile?.email };
    }

    return { authorized: true, userEmail: profile.email };
  } catch (error) {
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

// Sistema inteligente de prompts por tipo de ingrediente
const generateIntelligentPrompt = (ingredientName: string, description: string = '', category: string = '') => {
  const name = ingredientName.toLowerCase();
  const desc = description.toLowerCase();
  const cat = category.toLowerCase();
  
  console.log('🔍 Analyzing ingredient:', { name, category: cat, hasDescription: !!description });
  
  // Detectar tipo de ingrediente basado en múltiples factores
  const isPescado = name.includes('pescado') || name.includes('pez') || name.includes('lubina') || 
                   name.includes('sardina') || name.includes('bacalao') || name.includes('merluza') ||
                   name.includes('salmón') || name.includes('atún') || name.includes('trucha') ||
                   desc.includes('pescado') || desc.includes('azul') || cat.includes('pescado');
                   
  const isMarisco = name.includes('marisco') || name.includes('gamba') || name.includes('langosta') ||
                   name.includes('mejillón') || name.includes('almeja') || name.includes('pulpo') ||
                   name.includes('calamar') || name.includes('sepia') || cat.includes('marisco');
                   
  const isCarne = name.includes('carne') || name.includes('ternera') || name.includes('cerdo') ||
                 name.includes('pollo') || name.includes('pato') || name.includes('cordero') ||
                 name.includes('jamón') || name.includes('lomo') || cat.includes('carne');
                 
  const isAve = name.includes('pollo') || name.includes('pato') || name.includes('pavo') ||
               name.includes('codorniz') || name.includes('gallina') || cat.includes('ave');
               
  const isFruta = name.includes('fruta') || name.includes('manzana') || name.includes('pera') ||
                 name.includes('naranja') || name.includes('limón') || name.includes('uva') ||
                 cat.includes('fruta');
                 
  const isVerdura = name.includes('verdura') || name.includes('lechuga') || name.includes('tomate') ||
                   name.includes('zanahoria') || name.includes('cebolla') || cat.includes('verdura');
                   
  const isEspecia = name.includes('especia') || name.includes('pimienta') || name.includes('azafrán') ||
                   name.includes('pimentón') || name.includes('comino') || cat.includes('especia') ||
                   cat.includes('condimento');
                   
  const isHierba = name.includes('hierba') || name.includes('romero') || name.includes('tomillo') ||
                  name.includes('orégano') || name.includes('albahaca') || cat.includes('hierba');
                  
  const isLagibre = name.includes('lácteo') || name.includes('leche') || name.includes('queso') ||
                   name.includes('yogur') || name.includes('mantequilla') || cat.includes('lácteo');

  let prompt = '';
  
  if (isPescado) {
    console.log('🐟 Detected: Fish');
    prompt = `Professional culinary photography of ${ingredientName}, fresh fish, seafood market quality, clean white background, high-resolution food photography, restaurant presentation, natural lighting`;
  } else if (isMarisco) {
    console.log('🦐 Detected: Seafood');
    prompt = `Professional culinary photography of ${ingredientName}, fresh seafood, premium quality, clean white background, high-resolution food photography, gourmet presentation`;
  } else if (isAve) {
    console.log('🦆 Detected: Poultry');
    prompt = `Professional culinary photography of ${ingredientName}, fresh poultry, butcher quality, clean white background, high-resolution food photography, raw meat presentation`;
  } else if (isCarne) {
    console.log('🥩 Detected: Meat');
    prompt = `Professional culinary photography of ${ingredientName}, fresh meat cut, butcher quality, clean white background, high-resolution food photography, raw meat presentation`;
  } else if (isFruta) {
    console.log('🍎 Detected: Fruit');
    prompt = `Botanical illustration of ${ingredientName}, fresh fruit, vibrant natural colors, scientific botanical drawing style, detailed textures, clean white background, professional illustration`;
  } else if (isVerdura) {
    console.log('🥬 Detected: Vegetable');
    prompt = `Botanical illustration of ${ingredientName}, fresh vegetable, vibrant natural colors, scientific botanical drawing style, detailed textures, clean white background, professional illustration`;
  } else if (isEspecia) {
    console.log('🌶️ Detected: Spice');
    prompt = `Professional macro photography of ${ingredientName}, spice powder or whole spice, culinary presentation, clean white background, high detail, food styling`;
  } else if (isHierba) {
    console.log('🌿 Detected: Herb');
    prompt = `Botanical illustration of ${ingredientName}, fresh herb, detailed leaves, scientific botanical drawing style, vibrant green colors, clean white background, professional illustration`;
  } else if (isLagibre) {
    console.log('🥛 Detected: Dairy');
    prompt = `Professional culinary photography of ${ingredientName}, dairy product, clean presentation, white background, high-resolution food photography, minimalist styling`;
  } else {
    console.log('🔄 Detected: Generic ingredient');
    // Prompt genérico pero específico para ingredientes culinarios
    prompt = `Professional culinary photography of ${ingredientName}, high-quality ingredient, clean white background, food styling, restaurant quality presentation, natural lighting`;
  }

  // Añadir contexto de la descripción si contiene información útil
  if (description && description.length > 20) {
    const contextKeywords = [];
    if (desc.includes('fresco')) contextKeywords.push('fresh');
    if (desc.includes('seco')) contextKeywords.push('dried');
    if (desc.includes('mediterráneo')) contextKeywords.push('mediterranean style');
    if (desc.includes('tradicional')) contextKeywords.push('traditional');
    
    if (contextKeywords.length > 0) {
      prompt += `, ${contextKeywords.join(', ')}`;
    }
  }

  console.log('📝 Generated intelligent prompt:', prompt);
  return prompt;
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
  console.log('🖼️ === ENHANCED INTELLIGENT IMAGE GENERATION ===');
  
  if (req.method === 'OPTIONS') {
    console.log('⚡ Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  // SECURITY: Verify super admin access
  const authHeader = req.headers.get('Authorization');
  const { authorized } = await verifySuperAdminAccess(authHeader);
  
  if (!authorized) {
    console.log('❌ Unauthorized access attempt');
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Access denied. Super admin privileges required.' 
      }), 
      { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    console.log('📋 Reading request body...');
    const body = await req.json();
    console.log('📥 Body received:', JSON.stringify(body, null, 2));

    const { ingredientName, name, description, ingredientId } = body;
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

    // Obtener información adicional del ingrediente si tenemos el ID
    let category = '';
    let fullDescription = description || '';
    
    if (ingredientId) {
      console.log('🔍 Fetching ingredient details from database...');
      const { data: ingredientData, error: dbError } = await supabase
        .from('ingredients')
        .select('description, categories(name)')
        .eq('id', ingredientId)
        .single();
        
      if (!dbError && ingredientData) {
        fullDescription = ingredientData.description || fullDescription;
        category = ingredientData.categories?.name || '';
        console.log('✅ Enhanced context:', { category, hasDescription: !!fullDescription });
      }
    }

    console.log('🧠 Creating intelligent prompt...');
    const prompt = generateIntelligentPrompt(finalIngredientName, fullDescription, category);

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
          model: "flux-1.1-pro",
          intelligentPrompt: true,
          detectedType: 'enhanced'
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
          model: "flux-1.1-pro",
          intelligentPrompt: true
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
    console.error('❌ GENERAL ERROR in intelligent image generation:', {
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
