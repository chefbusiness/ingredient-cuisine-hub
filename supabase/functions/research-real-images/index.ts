
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifySuperAdminAccess } from './auth.ts';
import { validateImageUrl } from './validation.ts';
import { searchImagesWithDeepSeek } from './deepseek.ts';
import { getIngredient, saveImageToDatabase, logAdminAction } from './database.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 === RESEARCH REAL IMAGES REQUEST ===');
    
    // Security check
    const authHeader = req.headers.get('authorization');
    const authResult = await verifySuperAdminAccess(authHeader);
    
    if (!authResult.authorized) {
      const errorMessage = authResult.userEmail 
        ? `Usuario ${authResult.userEmail} no tiene permisos de super admin.`
        : 'Se requiere autenticación de super admin.';
        
      return new Response(JSON.stringify({ 
        error: errorMessage,
        code: 'UNAUTHORIZED'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { ingredientIds, mode = 'single' } = await req.json();

    if (!ingredientIds || (Array.isArray(ingredientIds) && ingredientIds.length === 0)) {
      return new Response(JSON.stringify({ 
        error: 'Se requiere al menos un ID de ingrediente',
        code: 'MISSING_INGREDIENT_IDS'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY no configurada');
    }

    const results = [];
    const idsToProcess = Array.isArray(ingredientIds) ? ingredientIds : [ingredientIds];

    for (const ingredientId of idsToProcess) {
      console.log(`🔍 Researching images for ingredient: ${ingredientId}`);

      try {
        // Get ingredient details
        const ingredient = await getIngredient(ingredientId);

        // Search for images using DeepSeek
        const foundImages = await searchImagesWithDeepSeek(ingredient, DEEPSEEK_API_KEY);

        const validImages = [];
        
        // Validate and filter images with improved validation
        for (const imageInfo of foundImages.slice(0, 6)) { // Max 6 images
          if (imageInfo.url && typeof imageInfo.url === 'string') {
            console.log(`🔍 Validating image URL: ${imageInfo.url}`);
            
            const isValid = await validateImageUrl(imageInfo.url);
            if (isValid) {
              validImages.push({
                url: imageInfo.url,
                caption: imageInfo.description || '',
                category: imageInfo.category || 'general'
              });
              console.log(`✅ Valid image found: ${imageInfo.url}`);
            } else {
              console.log(`❌ Invalid image URL: ${imageInfo.url}`);
            }
          }
        }

        // Save valid images to database
        let savedCount = 0;
        for (const imageInfo of validImages) {
          const saved = await saveImageToDatabase(ingredientId, imageInfo.url, imageInfo.caption);
          if (saved) {
            savedCount++;
          } else {
            console.log(`❌ Error saving image: ${imageInfo.url}`);
          }
        }

        results.push({
          ingredientId,
          ingredientName: ingredient.name,
          success: true,
          imagesFound: validImages.length,
          imagesSaved: savedCount,
          images: validImages
        });

        console.log(`✅ Processed ${ingredient.name}: ${savedCount}/${validImages.length} images saved`);

      } catch (error) {
        console.error(`❌ Error processing ingredient ${ingredientId}:`, error);
        const ingredient = await getIngredient(ingredientId).catch(() => ({ name: 'Unknown' }));
        results.push({
          ingredientId,
          ingredientName: ingredient.name,
          success: false,
          error: error.message
        });
      }
    }

    // Log admin action
    await logAdminAction({
      mode,
      processed_ingredients: idsToProcess.length,
      successful_ingredients: results.filter(r => r.success).length,
      total_images_found: results.reduce((sum, r) => sum + (r.imagesFound || 0), 0),
      total_images_saved: results.reduce((sum, r) => sum + (r.imagesSaved || 0), 0),
      user_email: authResult.userEmail
    }, authResult.userEmail);

    const summary = {
      total_processed: idsToProcess.length,
      successful: results.filter(r => r.success).length,
      total_images_found: results.reduce((sum, r) => sum + (r.imagesFound || 0), 0),
      total_images_saved: results.reduce((sum, r) => sum + (r.imagesSaved || 0), 0)
    };

    console.log('🎉 === RESEARCH COMPLETED ===');
    console.log(`📊 Resumen: ${summary.total_images_saved} imágenes guardadas de ${summary.total_images_found} encontradas`);

    return new Response(JSON.stringify({ 
      success: true,
      results,
      summary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in research-real-images:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
