
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

// Security function to verify super admin access
async function verifySuperAdminAccess(authHeader: string | null): Promise<{ authorized: boolean, userId?: string }> {
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

    // Use the new security function to check super admin status
    const { data: isSuperAdmin, error: roleError } = await supabase
      .rpc('verify_super_admin_access');

    if (roleError) {
      console.log('❌ Error checking super admin status:', roleError.message);
      return { authorized: false };
    }

    if (!isSuperAdmin) {
      console.log('❌ User is not a super admin:', user.email);
      return { authorized: false };
    }

    console.log('✅ Super admin access verified for:', user.email);
    return { authorized: true, userId: user.id };
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security check: Verify super admin access
    const authHeader = req.headers.get('authorization');
    const authResult = await verifySuperAdminAccess(authHeader);
    
    if (!authResult.authorized) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized: Super admin access required',
        code: 'UNAUTHORIZED'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    if (type === 'ingredient') {
      // Validate all ingredients
      for (const ingredient of data) {
        if (!validateIngredientData(ingredient)) {
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

      const results = [];
      let duplicatesFound = 0;
      let successfullyCreated = 0;
      
      for (const ingredient of data) {
        console.log('Procesando ingrediente:', ingredient.name, 'con categoría:', ingredient.category);
        
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
          console.log('Creando nueva categoría:', categoryName);
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
            console.error('Error creando categoría:', categoryError);
            throw categoryError;
          }
          categoryId = newCategory.id;
        }

        console.log('Usando categoría ID:', categoryId, 'para ingrediente:', sanitizedIngredient.name);

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
          .select('id')
          .single();

        if (ingredientError) {
          console.error('Error creando ingrediente:', ingredientError);
          throw ingredientError;
        }

        console.log('Ingrediente creado exitosamente:', newIngredient.id);

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

        // Agregar precio con validación
        if (ingredient.price_estimate && !isNaN(parseFloat(ingredient.price_estimate))) {
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

        successfullyCreated++;
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
          action_type: 'save_ingredients',
          resource_type: 'ingredient',
          action_details: {
            total_processed: data.length,
            successfully_created: successfullyCreated,
            duplicates_skipped: duplicatesFound
          }
        });
      } catch (logError) {
        console.log('⚠️ Failed to log admin action:', logError);
      }

      console.log('=== RESUMEN DE PROCESAMIENTO ===');
      console.log(`✅ Ingredientes creados exitosamente: ${successfullyCreated}`);
      console.log(`⚠️ Duplicados detectados y omitidos: ${duplicatesFound}`);

      return new Response(JSON.stringify({ 
        success: true,
        results: results,
        summary: {
          total_processed: data.length,
          successfully_created: successfullyCreated,
          duplicates_skipped: duplicatesFound
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'category') {
      const results = [];
      
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
          .select('id, name')
          .single();

        if (error && !error.message.includes('duplicate')) {
          throw error;
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
            successfully_created: results.filter(r => r.success).length
          }
        });
      } catch (logError) {
        console.log('⚠️ Failed to log admin action:', logError);
      }

      return new Response(JSON.stringify({ 
        success: true,
        results: results 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Tipo de contenido no soportado');

  } catch (error) {
    console.error('Error en save-generated-content:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
