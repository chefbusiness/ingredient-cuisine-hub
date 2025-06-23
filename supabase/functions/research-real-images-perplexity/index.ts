
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
    console.log('🔍 === ENHANCED PERPLEXITY SONAR RESEARCH START ===');
    
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
      console.log(`🔍 Processing ingredient: ${ingredientId}`);

      try {
        // Get ingredient details
        const ingredient = await getIngredient(ingredientId);
        console.log(`📝 Ingredient details: ${ingredient.name} (${ingredient.name_en})`);

        // ENHANCED: Search for images using improved Perplexity Sonar
        console.log(`🤖 Querying Enhanced Perplexity Sonar for: ${ingredient.name}`);
        const foundImages = await searchImagesWithPerplexity(ingredient, PERPLEXITY_API_KEY);
        
        console.log(`🔍 Perplexity returned ${foundImages.length} potential images`);

        const validImages = [];
        const validationResults = [];
        let successfulSaves = 0;
        let skippedCount = 0;
        
        // ENHANCED: Process with better error handling and quality control
        for (let i = 0; i < foundImages.length; i++) {
          const imageInfo = foundImages[i];
          
          console.log(`🔍 [${i + 1}/${foundImages.length}] Processing: ${imageInfo.url}`);
          
          try {
            // Quick format validation with enhanced checks
            if (!isLikelyImageUrl(imageInfo.url)) {
              console.log(`❌ Failed enhanced format validation: ${imageInfo.url}`);
              validationResults.push({ index: i, status: 'format_invalid', url: imageInfo.url });
              skippedCount++;
              continue;
            }
            
            // ENHANCED: HTTP validation with better error handling
            const isValid = await validateImageUrl(imageInfo.url);
            if (isValid) {
              const imageData = {
                url: imageInfo.url,
                caption: imageInfo.description || `${ingredient.name} - ${imageInfo.category || 'general'}`,
                category: imageInfo.category || 'general',
                source: 'perplexity_sonar' // Consistent source labeling
              };
              
              validImages.push(imageData);
              validationResults.push({ index: i, status: 'success', url: imageInfo.url });
              console.log(`✅ [${i + 1}] Valid and relevant image confirmed`);
              
              // ENHANCED: Try to save with better error handling
              try {
                const saved = await saveImageToDatabase(ingredientId, imageData.url, imageData.caption);
                if (saved) {
                  successfulSaves++;
                  console.log(`💾 [${i + 1}] SAVED: ${imageData.url.substring(0, 50)}...`);
                } else {
                  console.log(`⚠️ [${i + 1}] Save skipped (probably duplicate): ${imageData.url.substring(0, 50)}...`);
                  skippedCount++;
                }
              } catch (saveError) {
                console.log(`❌ [${i + 1}] Save error: ${saveError.message}`);
                skippedCount++;
              }
              
            } else {
              validationResults.push({ index: i, status: 'http_validation_failed', url: imageInfo.url });
              console.log(`❌ [${i + 1}] HTTP validation failed - URL may be broken`);
              skippedCount++;
            }
          } catch (processingError) {
            console.log(`❌ [${i + 1}] Processing error: ${processingError.message}`);
            validationResults.push({ index: i, status: 'processing_error', url: imageInfo.url, error: processingError.message });
            skippedCount++;
          }
          
          // ENHANCED: Shorter delay for better performance
          if (i < foundImages.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 400));
          }
        }

        console.log(`📊 ENHANCED VALIDATION Summary for ${ingredient.name}:`);
        console.log(`   - Total found: ${foundImages.length}`);
        console.log(`   - Format valid: ${validationResults.filter(r => r.status !== 'format_invalid').length}`);
        console.log(`   - HTTP valid: ${validImages.length}`);
        console.log(`   - Successfully saved: ${successfulSaves}`);
        console.log(`   - Skipped/Failed: ${skippedCount}`);

        results.push({
          ingredientId,
          ingredientName: ingredient.name,
          success: successfulSaves > 0,
          imagesFound: validImages.length,
          imagesSaved: successfulSaves,
          imagesSkipped: skippedCount,
          images: validImages,
          totalAttempted: foundImages.length,
          validationDetails: validationResults,
          searchEngine: 'perplexity_sonar_enhanced'
        });

        if (successfulSaves > 0) {
          console.log(`✅ ENHANCED SUCCESS for ${ingredient.name}: ${successfulSaves} relevant images saved!`);
        } else {
          console.log(`❌ NO IMAGES SAVED for ${ingredient.name} - all ${foundImages.length} images were invalid or irrelevant`);
        }

      } catch (error) {
        console.error(`❌ Error processing ingredient ${ingredientId}:`, error);
        const ingredient = await getIngredient(ingredientId).catch(() => ({ name: 'Unknown' }));
        results.push({
          ingredientId,
          ingredientName: ingredient.name,
          success: false,
          error: error.message,
          searchEngine: 'perplexity_sonar_enhanced'
        });
      }
    }

    // Log admin action with enhanced metrics
    await logAdminAction({
      mode,
      search_engine: 'perplexity_sonar_enhanced',
      processed_ingredients: idsToProcess.length,
      successful_ingredients: results.filter(r => r.success).length,
      total_images_found: results.reduce((sum, r) => sum + (r.imagesFound || 0), 0),
      total_images_saved: results.reduce((sum, r) => sum + (r.imagesSaved || 0), 0),
      total_images_skipped: results.reduce((sum, r) => sum + (r.imagesSkipped || 0), 0),
      user_email: authResult.userEmail
    }, authResult.userEmail);

    const summary = {
      total_processed: idsToProcess.length,
      successful: results.filter(r => r.success).length,
      total_images_found: results.reduce((sum, r) => sum + (r.imagesFound || 0), 0),
      total_images_saved: results.reduce((sum, r) => sum + (r.imagesSaved || 0), 0),
      total_images_skipped: results.reduce((sum, r) => sum + (r.imagesSkipped || 0), 0),
      search_engine: 'perplexity_sonar_enhanced'
    };

    console.log('🎉 === ENHANCED PERPLEXITY SONAR RESEARCH COMPLETED ===');
    console.log(`📊 Enhanced Summary: ${summary.total_images_saved} relevant saved / ${summary.total_images_found} found / ${summary.total_images_skipped} skipped from ${summary.total_processed} ingredients`);

    return new Response(JSON.stringify({ 
      success: true,
      results,
      summary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in enhanced perplexity research:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
