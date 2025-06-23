import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Security function to verify super admin access (synchronized with generate-content)
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

    console.log('✅ User authenticated:', user.email);

    // Check super admin status from profiles table (same as generate-content)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('❌ Error fetching user profile:', profileError.message);
      return { authorized: false, userEmail: user.email };
    }

    console.log('📋 User profile:', { email: profile.email, role: profile.role });

    if (profile.role !== 'super_admin') {
      console.log('❌ User is not a super admin:', profile.email, 'Current role:', profile.role);
      return { authorized: false, userEmail: profile.email };
    }

    console.log('✅ Super admin access verified for:', profile.email);
    return { authorized: true, userEmail: profile.email };
  } catch (error) {
    console.log('❌ Error verifying admin access:', error);
    return { authorized: false };
  }
}

// Input validation and sanitization functions
function sanitizeText(input: any, maxLength: number = 255): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

function validateIngredientData(ingredient: any): boolean {
  return ingredient.name && 
         ingredient.name_en && 
         ingredient.description && 
         ingredient.category &&
         typeof ingredient.name === 'string' &&
         typeof ingredient.name_en === 'string';
}

// Función para verificar si un ingrediente es duplicado
const isDuplicate = (newIngredient: any, existingIngredients: any[]): boolean => {
  const normalizeText = (text: string) => text?.toLowerCase().trim() || '';
  
  return existingIngredients.some(existing => {
    const existingNames = [
      normalizeText(existing.name),
      normalizeText(existing.name_en),
      normalizeText(existing.name_fr),
      normalizeText(existing.name_it),
      normalizeText(existing.name_pt),
      normalizeText(existing.name_zh)
    ].filter(Boolean);
    
    const newNames = [
      normalizeText(newIngredient.name),
      normalizeText(newIngredient.name_en),
      normalizeText(newIngredient.name_fr),
      normalizeText(newIngredient.name_it),
      normalizeText(newIngredient.name_pt),
      normalizeText(newIngredient.name_zh)
    ].filter(Boolean);
    
    return existingNames.some(existingName => 
      newNames.includes(existingName)
    );
  });
};

// Función para procesar precios múltiples países
async function processMultiCountryPrices(ingredientId: string, pricesData: any[]): Promise<void> {
  console.log(`💰 === PROCESANDO PRECIOS MULTI-PAÍS PARA ${ingredientId} ===`);
  
  if (!pricesData || !Array.isArray(pricesData)) {
    console.log('⚠️ No hay datos de precios o formato incorrecto');
    return;
  }

  console.log(`📊 Procesando ${pricesData.length} precios de diferentes países`);

  // Mapeo de códigos de país a IDs en la base de datos
  const countryMapping: { [key: string]: string } = {
    'ES': 'España',
    'US': 'Estados Unidos', 
    'FR': 'Francia',
    'IT': 'Italia',
    'MX': 'México',
    'AR': 'Argentina'
  };

  let processedPrices = 0;
  let failedPrices = 0;

  for (const priceData of pricesData) {
    try {
      const countryCode = priceData.country_code || 'ES';
      const countryName = countryMapping[countryCode] || priceData.country || 'España';
      
      console.log(`🌍 Procesando precio para ${countryName} (${countryCode}): ${priceData.price} ${priceData.currency}/${priceData.unit}`);

      // Buscar el país en la base de datos
      const { data: country, error: countryError } = await supabase
        .from('countries')
        .select('id')
        .eq('name', countryName)
        .single();

      if (countryError || !country) {
        console.log(`⚠️ País ${countryName} no encontrado en BD, saltando precio`);
        failedPrices++;
        continue;
      }

      // Determinar la unidad apropiada basada en el tipo de ingrediente
      let finalUnit = priceData.unit || 'kg';
      
      // Normalizar unidades
      if (finalUnit.toLowerCase().includes('litro') || finalUnit.toLowerCase() === 'l') {
        finalUnit = 'litro';
      } else if (finalUnit.toLowerCase() === 'g' || finalUnit.toLowerCase() === 'gramo') {
        finalUnit = 'g';
      } else {
        finalUnit = 'kg'; // Por defecto
      }

      // Insertar el precio en la base de datos
      const { error: priceError } = await supabase
        .from('ingredient_prices')
        .insert({
          ingredient_id: ingredientId,
          country_id: country.id,
          price: Math.max(0, parseFloat(priceData.price) || 0),
          unit: finalUnit,
          season_variation: priceData.market_type || 'general'
        });

      if (priceError) {
        console.error(`❌ Error insertando precio para ${countryName}:`, priceError);
        failedPrices++;
      } else {
        console.log(`✅ Precio guardado para ${countryName}: ${priceData.price} ${priceData.currency}/${finalUnit}`);
        processedPrices++;
      }

    } catch (error) {
      console.error(`💥 Error procesando precio:`, error);
      failedPrices++;
    }
  }

  console.log(`🏁 Resumen precios: ${processedPrices} exitosos, ${failedPrices} fallidos`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Processing save-generated-content request...');
    
    // Security check: Verify super admin access (updated to match generate-content)
    const authHeader = req.headers.get('authorization');
    const authResult = await verifySuperAdminAccess(authHeader);
    
    if (!authResult.authorized) {
      const errorMessage = authResult.userEmail 
        ? `Usuario ${authResult.userEmail} no tiene permisos de super admin. Contacta al administrador para obtener acceso.`
        : 'Se requiere autenticación de super admin para acceder a esta función.';
        
      console.log('❌ Unauthorized access attempt');
      return new Response(JSON.stringify({ 
        error: errorMessage,
        code: 'UNAUTHORIZED',
        userEmail: authResult.userEmail
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Authorization successful, processing save request...');

    const { type, data } = await req.json();

    // Input validation
    if (!type || !['ingredient', 'category'].includes(type)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid type parameter',
        code: 'INVALID_TYPE'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(data) || data.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Data must be a non-empty array',
        code: 'INVALID_DATA'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Limit batch size to prevent abuse
    if (data.length > 50) {
      return new Response(JSON.stringify({ 
        error: 'Batch size too large. Maximum 50 items allowed.',
        code: 'BATCH_TOO_LARGE'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📋 Processing ${data.length} ${type}(s) for user: ${authResult.userEmail}`);

    if (type === 'ingredient') {
      // Validate all ingredients
      for (const ingredient of data) {
        if (!validateIngredientData(ingredient)) {
          console.log('❌ Invalid ingredient data format for:', ingredient);
          return new Response(JSON.stringify({ 
            error: 'Invalid ingredient data format',
            code: 'INVALID_INGREDIENT'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
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
      const savedIngredientsData = []; // Para retornar en response.data
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
          description: sanitizeText(ingredient.description, 1000),
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
        
        // Primero obtener o crear la categoría
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

        // Crear el ingrediente con TODOS los campos de idiomas
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

        // NUEVO: Procesar precios de múltiples países
        if (ingredient.prices_by_country && Array.isArray(ingredient.prices_by_country)) {
          await processMultiCountryPrices(newIngredient.id, ingredient.prices_by_country);
        } else if (ingredient.price_estimate && !isNaN(parseFloat(ingredient.price_estimate))) {
          // Fallback al método anterior para compatibilidad
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

        // Agregar información nutricional con sanitización
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

        // Agregar usos con sanitización
        if (ingredient.uses && Array.isArray(ingredient.uses)) {
          for (const use of ingredient.uses.slice(0, 10)) { // Limit to 10 uses
            await supabase
              .from('ingredient_uses')
              .insert({
                ingredient_id: newIngredient.id,
                use_description: sanitizeText(use, 500)
              });
          }
        }

        // Agregar recetas con sanitización
        if (ingredient.recipes && Array.isArray(ingredient.recipes)) {
          for (const recipe of ingredient.recipes.slice(0, 5)) { // Limit to 5 recipes
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

        // Agregar variedades con sanitización
        if (ingredient.varieties && Array.isArray(ingredient.varieties)) {
          for (const variety of ingredient.varieties.slice(0, 10)) { // Limit to 10 varieties
            await supabase
              .from('ingredient_varieties')
              .insert({
                ingredient_id: newIngredient.id,
                variety_name: sanitizeText(variety, 100)
              });
          }
        }

        successfullyCreated++;
        
        // Preparar datos para response.data (necesarios para generación de imágenes)
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
            user_email: authResult.userEmail,
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

      return new Response(JSON.stringify({ 
        success: true,
        results: results,
        data: savedIngredientsData, // CRÍTICO: Datos para la generación de imágenes
        summary: {
          total_processed: data.length,
          successfully_created: successfullyCreated,
          duplicates_skipped: duplicatesFound,
          multi_country_pricing_enabled: true
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'category') {
      const results = [];
      const savedCategoriesData = [];
      
      for (const category of data) {
        // Sanitize category data
        const sanitizedCategory = {
          name: sanitizeText(category.name, 100),
          name_en: sanitizeText(category.name_en, 100),
          description: sanitizeText(category.description, 500)
        };

        const { data: newCategory, error } = await supabase
          .from('categories')
          .insert(sanitizedCategory)
          .select('id, name, created_at')
          .single();

        if (error && !error.message.includes('duplicate')) {
          throw error;
        }

        if (newCategory) {
          savedCategoriesData.push(newCategory);
        }

        results.push({
          id: newCategory?.id,
          name: sanitizedCategory.name,
          success: !error
        });
      }

      // Log the admin action
      try {
        await supabase.rpc('log_admin_action', {
          action_type: 'save_categories',
          resource_type: 'category',
          action_details: {
            total_processed: data.length,
            successfully_created: results.filter(r => r.success).length,
            user_email: authResult.userEmail
          }
        });
      } catch (logError) {
        console.log('⚠️ Failed to log admin action:', logError);
      }

      return new Response(JSON.stringify({ 
        success: true,
        results: results,
        data: savedCategoriesData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Tipo de contenido no soportado');

  } catch (error) {
    console.error('❌ Error en save-generated-content:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
