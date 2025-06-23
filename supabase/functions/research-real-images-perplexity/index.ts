
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifySuperAdminAccess } from './auth.ts';
import { validateImageUrl, isLikelyImageUrl } from './validation.ts';
import { searchImagesWithPerplexity } from './perplexity.ts';
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
    console.log('🔍 === PERPLEXITY RESEARCH REAL IMAGES REQUEST ===');
    
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

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY no configurada');
    }

    const results = [];
    const idsToProcess = Array.isArray(ingredientIds) ? ingredientIds : [ingredientIds];

    for (const ingredientId of idsToProcess) {
      console.log(`🔍 Researching images for ingredient: ${ingredientId}`);

      try {
        // Get ingredient details
        const ingredient = await getIngredient(ingredientId);

        // Search for images using Perplexity Sonar
        console.log(`🤖 Querying Perplexity Sonar for: ${ingredient.name}`);
        const foundImages = await searchImagesWithPerplexity(ingredient, PERPLEXITY_API_KEY);
        
        console.log(`🔍 Perplexity returned ${foundImages.length} potential images`);

        const validImages = [];
        const validationResults = [];
        
        // Enhanced validation process with Perplexity's higher quality results
        for (let i = 0; i < Math.min(foundImages.length, 8); i++) {
          const imageInfo = foundImages[i];
          
          if (!imageInfo.url || typeof imageInfo.url !== 'string') {
            console.log(`❌ Invalid image data at index ${i}`);
            validationResults.push({ index: i, status: 'invalid_data', url: imageInfo.url });
            continue;
          }

          console.log(`🔍 [${i + 1}/${foundImages.length}] Processing: ${imageInfo.url}`);
          
          // Quick format validation
          if (!isLikelyImageUrl(imageInfo.url)) {
            console.log(`❌ Failed quick validation: ${imageInfo.url}`);
            validationResults.push({ index: i, status: 'format_invalid', url: imageInfo.url });
            continue;
          }
          
          // HTTP validation with Perplexity's trusted sources
          const isValid = await validateImageUrl(imageInfo.url);
          if (isValid) {
            validImages.push({
              url: imageInfo.url,
              caption: imageInfo.description || `${ingredient.name} - ${imageInfo.category || 'general'}`,
              category: imageInfo.category || 'general',
              source: imageInfo.source || 'perplexity_search'
            });
            validationResults.push({ index: i, status: 'success', url: imageInfo.url });
            console.log(`✅ [${i + 1}] Valid image confirmed: ${imageInfo.url}`);
          } else {
            validationResults.push({ index: i, status: 'http_validation_failed', url: imageInfo.url });
            console.log(`❌ [${i + 1}] Failed validation: ${imageInfo.url}`);
          }
          
          // Respectful delay between validations
          if (i < foundImages.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        }

        console.log(`📊 Perplexity Validation Summary for ${ingredient.name}:`);
        console.log(`   - Total found: ${foundImages.length}`);
        console.log(`   - Format valid: ${validationResults.filter(r => r.status !== 'format_invalid' && r.status !== 'invalid_data').length}`);
        console.log(`   - HTTP valid: ${validImages.length}`);

        // Save validated images to database
        let savedCount = 0;
        for (const imageInfo of validImages) {
          try {
            const saved = await saveImageToDatabase(ingredientId, imageInfo.url, imageInfo.caption);
            if (saved) {
              savedCount++;
              console.log(`💾 Saved image: ${imageInfo.url}`);
            } else {
              console.log(`❌ Failed to save: ${imageInfo.url}`);
            }
          } catch (error) {
            console.log(`❌ Database error saving ${imageInfo.url}:`, error.message);
          }
        }

        results.push({
          ingredientId,
          ingredientName: ingredient.name,
          success: true,
          imagesFound: validImages.length,
          imagesSaved: savedCount,
          images: validImages,
          totalAttempted: foundImages.length,
          validationDetails: validationResults,
          searchEngine: 'perplexity_sonar'
        });

        console.log(`✅ Completed ${ingredient.name}: ${savedCount}/${validImages.length} valid images saved (${foundImages.length} total found)`);

      } catch (error) {
        console.error(`❌ Error processing ingredient ${ingredientId}:`, error);
        const ingredient = await getIngredient(ingredientId).catch(() => ({ name: 'Unknown' }));
        results.push({
          ingredientId,
          ingredientName: ingredient.name,
          success: false,
          error: error.message,
          searchEngine: 'perplexity_sonar'
        });
      }
    }

    // Log admin action with Perplexity details
    await logAdminAction({
      mode,
      search_engine: 'perplexity_sonar',
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
      total_images_saved: results.reduce((sum, r) => sum + (r.imagesSaved || 0), 0),
      search_engine: 'perplexity_sonar'
    };

    console.log('🎉 === PERPLEXITY RESEARCH COMPLETED ===');
    console.log(`📊 Resumen: ${summary.total_images_saved} imágenes guardadas de ${summary.total_images_found} encontradas`);

    return new Response(JSON.stringify({ 
      success: true,
      results,
      summary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in perplexity research-real-images:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
