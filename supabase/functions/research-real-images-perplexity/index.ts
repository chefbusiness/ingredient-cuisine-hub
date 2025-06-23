
import { corsHeaders } from './auth.ts';
import { getIngredient, saveImageToDatabase, logAdminAction } from './database.ts';
import { searchImagesWithPerplexity } from './perplexity.ts';
import { isLikelyImageUrl, validateImageUrl } from './validation.ts';

console.log('🚀 Perplexity Image Research Function starting...');

Deno.serve(async (req) => {
  console.log(`📋 ${req.method} request received`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { ingredient_id, user_email } = await req.json();

    if (!ingredient_id) {
      throw new Error('ingredient_id es requerido');
    }

    console.log(`🔍 Starting Perplexity research for ingredient: ${ingredient_id}`);

    // Get ingredient info
    const ingredient = await getIngredient(ingredient_id);
    console.log(`📝 Ingredient found: ${ingredient.name} (${ingredient.name_en})`);

    // Search images with Perplexity
    const imageUrls = await searchImagesWithPerplexity(ingredient.name, ingredient.name_en);
    console.log(`🔍 Found ${imageUrls.length} potential image URLs`);

    if (imageUrls.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No se encontraron imágenes para este ingrediente',
        found_images: 0,
        saved_images: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Filter likely image URLs
    const likelyImageUrls = imageUrls.filter(url => {
      const isLikely = isLikelyImageUrl(url);
      if (!isLikely) {
        console.log(`❌ Rejected URL (format): ${url.substring(0, 80)}...`);
      }
      return isLikely;
    });

    console.log(`✅ ${likelyImageUrls.length}/${imageUrls.length} URLs passed format validation`);

    // Validate and save images
    let savedCount = 0;
    const validationPromises = likelyImageUrls.slice(0, 8).map(async (imageUrl, index) => {
      try {
        console.log(`🔍 [${index + 1}/${Math.min(likelyImageUrls.length, 8)}] Validating: ${imageUrl.substring(0, 60)}...`);
        
        const isValid = await validateImageUrl(imageUrl);
        if (!isValid) {
          console.log(`❌ [${index + 1}] Validation failed`);
          return false;
        }

        const caption = `${ingredient.name} - Imagen encontrada con Perplexity AI para ingrediente de cocina profesional`;
        const saved = await saveImageToDatabase(ingredient_id, imageUrl, caption);
        
        if (saved) {
          savedCount++;
          console.log(`✅ [${index + 1}] Image saved successfully`);
          return true;
        } else {
          console.log(`❌ [${index + 1}] Failed to save to database`);
          return false;
        }
      } catch (error) {
        console.log(`❌ [${index + 1}] Error processing: ${error.message}`);
        return false;
      }
    });

    await Promise.all(validationPromises);

    // Log admin action
    await logAdminAction({
      ingredient_id,
      ingredient_name: ingredient.name,
      found_urls: imageUrls.length,
      validated_urls: likelyImageUrls.length,
      saved_images: savedCount,
      search_query: ingredient.name,
      timestamp: new Date().toISOString()
    }, user_email);

    console.log(`🎉 Process completed: ${savedCount} images saved for ${ingredient.name}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Búsqueda completada para ${ingredient.name}`,
      found_images: imageUrls.length,
      validated_images: likelyImageUrls.length,
      saved_images: savedCount,
      ingredient_name: ingredient.name
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('❌ Critical error in Perplexity research:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Error interno del servidor',
      found_images: 0,
      saved_images: 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
