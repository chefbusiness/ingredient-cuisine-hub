
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { sanitizeText, validateIngredientData, isDuplicate } from './validation.ts';
import { processMultiCountryPrices } from './pricing.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function processIngredients(data: any[], userEmail: string): Promise<{ success: boolean, results: any[], data: any[], summary: any }> {
  // Validate all ingredients
  for (const ingredient of data) {
    if (!validateIngredientData(ingredient)) {
      console.log('❌ Invalid ingredient data format for:', ingredient);
      throw new Error('Invalid ingredient data format');
    }
  }

  // Obtener ingredientes existentes para validación de duplicados
  const { data: existingIngredients, error: fetchError } = await supabase
    .from('ingredients')
    .select('name, name_en, name_fr, name_it, name_pt, name_zh');
  
  if (fetchError) {
    console.error('❌ Error obteniendo ingredientes existentes:', fetchError);
    throw fetchError;
  }

  console.log(`🔍 Found ${existingIngredients?.length || 0} existing ingredients for duplicate check`);

  const results = [];
  const savedIngredientsData = [];
  let duplicatesFound = 0;
  let successfullyCreated = 0;
  
  for (const ingredient of data) {
    console.log('🔄 Procesando ingrediente:', ingredient.name, 'con categoría:', ingredient.category);
    
    // Sanitize input data
    const sanitizedIngredient = {
      name: sanitizeText(ingredient.name, 100),
      name_en: sanitizeText(ingredient.name_en, 100),
      name_la: sanitizeText(ingredient.name_la, 100),
      name_fr: sanitizeText(ingredient.name_fr, 100),
      name_it: sanitizeText(ingredient.name_it, 100),
      name_pt: sanitizeText(ingredient.name_pt, 100),
      name_zh: sanitizeText(ingredient.name_zh, 100),
      description: sanitizeText(ingredient.description, 6000), // Increased limit for complete descriptions
      category: sanitizeText(ingredient.category, 50),
      temporada: sanitizeText(ingredient.temporada, 100),
      origen: sanitizeText(ingredient.origen, 100),
      merma: Math.max(0, Math.min(100, parseFloat(ingredient.merma) || 0)),
      rendimiento: Math.max(0, Math.min(100, parseFloat(ingredient.rendimiento) || 100)),
      popularity: Math.max(0, Math.min(100, parseInt(ingredient.popularity) || 0))
    };
    
    // Verificar duplicados
    if (isDuplicate(sanitizedIngredient, existingIngredients || [])) {
      console.log(`⚠️ DUPLICADO DETECTADO: ${sanitizedIngredient.name} ya existe, saltando...`);
      duplicatesFound++;
      results.push({
        name: sanitizedIngredient.name,
        category: sanitizedIngredient.category,
        success: false,
        reason: 'duplicate',
        skipped: true
      });
      continue;
    }
    
    // Verificar que todos los idiomas críticos estén presentes
    const requiredLanguages = ['name_fr', 'name_it', 'name_pt', 'name_zh'];
    const missingLanguages = requiredLanguages.filter(lang => !sanitizedIngredient[lang]);
    
    if (missingLanguages.length > 0) {
      console.log(`⚠️ Ingrediente ${sanitizedIngredient.name} falta idiomas:`, missingLanguages);
    }
    
    // Get or create category
    let categoryName = sanitizedIngredient.category || 'otros';
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();

    let categoryId = existingCategory?.id;
    
    if (!categoryId) {
      console.log('🆕 Creando nueva categoría:', categoryName);
      const { data: newCategory, error: categoryError } = await supabase
        .from('categories')
        .insert({
          name: categoryName,
          name_en: categoryName === 'especias' ? 'spices' : 
                   categoryName === 'verduras' ? 'vegetables' :
                   categoryName === 'frutas' ? 'fruits' :
                   categoryName === 'carnes' ? 'meats' :
                   categoryName === 'pescados' ? 'fish' :
                   categoryName === 'lacteos' ? 'dairy' :
                   categoryName === 'cereales' ? 'cereals' : categoryName,
          description: `Categoría de ${categoryName}`
        })
        .select('id')
        .single();

      if (categoryError) {
        console.error('❌ Error creando categoría:', categoryError);
        throw categoryError;
      }
      categoryId = newCategory.id;
    }

    console.log('📂 Usando categoría ID:', categoryId, 'para ingrediente:', sanitizedIngredient.name);

    // Create ingredient
    const ingredientData = {
      name: sanitizedIngredient.name,
      name_en: sanitizedIngredient.name_en,
      name_la: sanitizedIngredient.name_la,
      name_fr: sanitizedIngredient.name_fr || null,
      name_it: sanitizedIngredient.name_it || null,
      name_pt: sanitizedIngredient.name_pt || null,
      name_zh: sanitizedIngredient.name_zh || null,
      description: sanitizedIngredient.description,
      category_id: categoryId,
      temporada: sanitizedIngredient.temporada,
      origen: sanitizedIngredient.origen,
      merma: sanitizedIngredient.merma,
      rendimiento: sanitizedIngredient.rendimiento,
      popularity: sanitizedIngredient.popularity
    };

    const { data: newIngredient, error: ingredientError } = await supabase
      .from('ingredients')
      .insert(ingredientData)
      .select('id, name, created_at')
      .single();

    if (ingredientError) {
      console.error('❌ Error creando ingrediente:', ingredientError);
      throw ingredientError;
    }

    console.log('✅ Ingrediente creado exitosamente:', newIngredient.id, '- Name:', newIngredient.name);

    // Process multi-country prices
    if (ingredient.prices_by_country && Array.isArray(ingredient.prices_by_country)) {
      await processMultiCountryPrices(newIngredient.id, ingredient.prices_by_country);
    } else if (ingredient.price_estimate && !isNaN(parseFloat(ingredient.price_estimate))) {
      // Fallback method for compatibility
      console.log('📊 Usando método de precio anterior (solo España)');
      const { data: country } = await supabase
        .from('countries')
        .select('id')
        .eq('code', 'ES')
        .single();

      if (country) {
        await supabase
          .from('ingredient_prices')
          .insert({
            ingredient_id: newIngredient.id,
            country_id: country.id,
            price: Math.max(0, parseFloat(ingredient.price_estimate)),
            unit: 'kg'
          });
      }
    }

    // Add nutritional info
    if (ingredient.nutritional_info) {
      await supabase
        .from('nutritional_info')
        .insert({
          ingredient_id: newIngredient.id,
          calories: Math.max(0, parseInt(ingredient.nutritional_info.calories) || 0),
          protein: Math.max(0, parseFloat(ingredient.nutritional_info.protein) || 0),
          carbs: Math.max(0, parseFloat(ingredient.nutritional_info.carbs) || 0),
          fat: Math.max(0, parseFloat(ingredient.nutritional_info.fat) || 0),
          fiber: Math.max(0, parseFloat(ingredient.nutritional_info.fiber) || 0),
          vitamin_c: Math.max(0, parseFloat(ingredient.nutritional_info.vitamin_c) || 0)
        });
    }

    // Add uses
    if (ingredient.uses && Array.isArray(ingredient.uses)) {
      for (const use of ingredient.uses.slice(0, 10)) {
        await supabase
          .from('ingredient_uses')
          .insert({
            ingredient_id: newIngredient.id,
            use_description: sanitizeText(use, 500)
          });
      }
    }

    // Add recipes
    if (ingredient.recipes && Array.isArray(ingredient.recipes)) {
      for (const recipe of ingredient.recipes.slice(0, 5)) {
        await supabase
          .from('ingredient_recipes')
          .insert({
            ingredient_id: newIngredient.id,
            name: sanitizeText(recipe.name, 200),
            type: sanitizeText(recipe.type, 50),
            difficulty: sanitizeText(recipe.difficulty, 20),
            time: sanitizeText(recipe.time, 50)
          });
      }
    }

    // Add varieties
    if (ingredient.varieties && Array.isArray(ingredient.varieties)) {
      for (const variety of ingredient.varieties.slice(0, 10)) {
        await supabase
          .from('ingredient_varieties')
          .insert({
            ingredient_id: newIngredient.id,
            variety_name: sanitizeText(variety, 100)
          });
      }
    }

    successfullyCreated++;
    
    const savedIngredientData = {
      id: newIngredient.id,
      name: sanitizedIngredient.name,
      created_at: newIngredient.created_at
    };
    savedIngredientsData.push(savedIngredientData);
    
    results.push({
      id: newIngredient.id,
      name: sanitizedIngredient.name,
      category: categoryName,
      languages_complete: missingLanguages.length === 0,
      missing_languages: missingLanguages,
      success: true
    });
  }

  // Log the admin action
  try {
    await supabase.rpc('log_admin_action', {
      action_type: 'save_ingredients_multicountry',
      resource_type: 'ingredient',
      action_details: {
        total_processed: data.length,
        successfully_created: successfullyCreated,
        duplicates_skipped: duplicatesFound,
        user_email: userEmail,
        multi_country_pricing: true
      }
    });
  } catch (logError) {
    console.log('⚠️ Failed to log admin action:', logError);
  }

  console.log('🎉 === RESUMEN DE PROCESAMIENTO MULTI-PAÍS ===');
  console.log(`✅ Ingredientes creados exitosamente: ${successfullyCreated}`);
  console.log(`⚠️ Duplicados detectados y omitidos: ${duplicatesFound}`);
  console.log(`📊 Datos preparados para generación de imágenes: ${savedIngredientsData.length}`);
  console.log(`🌍 Precios procesados para múltiples países por ingrediente`);

  return {
    success: true,
    results: results,
    data: savedIngredientsData,
    summary: {
      total_processed: data.length,
      successfully_created: successfullyCreated,
      duplicates_skipped: duplicatesFound,
      multi_country_pricing_enabled: true
    }
  };
}
