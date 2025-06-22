
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

// Función para verificar si un ingrediente es duplicado
const isDuplicate = (newIngredient: any, existingIngredients: any[]): boolean => {
  const normalizeText = (text: string) => text?.toLowerCase().trim() || '';
  
  return existingIngredients.some(existing => {
    // Verificar nombres en todos los idiomas
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
    
    // Verificar si algún nombre coincide
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
    const { type, data } = await req.json();

    if (type === 'ingredient') {
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
        
        // Verificar duplicados
        if (isDuplicate(ingredient, existingIngredients || [])) {
          console.log(`⚠️ DUPLICADO DETECTADO: ${ingredient.name} ya existe, saltando...`);
          duplicatesFound++;
          results.push({
            name: ingredient.name,
            category: ingredient.category,
            success: false,
            reason: 'duplicate',
            skipped: true
          });
          continue;
        }
        
        // Verificar que todos los idiomas críticos estén presentes
        const requiredLanguages = ['name_fr', 'name_it', 'name_pt', 'name_zh'];
        const missingLanguages = requiredLanguages.filter(lang => !ingredient[lang]);
        
        if (missingLanguages.length > 0) {
          console.log(`⚠️ Ingrediente ${ingredient.name} falta idiomas:`, missingLanguages);
        }
        
        // Primero obtener o crear la categoría
        let categoryName = ingredient.category || 'otros';
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

        console.log('Usando categoría ID:', categoryId, 'para ingrediente:', ingredient.name);

        // Crear el ingrediente con TODOS los campos de idiomas
        const ingredientData = {
          name: ingredient.name,
          name_en: ingredient.name_en,
          name_la: ingredient.name_la,
          name_fr: ingredient.name_fr || null,
          name_it: ingredient.name_it || null,
          name_pt: ingredient.name_pt || null,
          name_zh: ingredient.name_zh || null,
          description: ingredient.description,
          category_id: categoryId,
          temporada: ingredient.temporada,
          origen: ingredient.origen,
          merma: ingredient.merma,
          rendimiento: ingredient.rendimiento,
          popularity: ingredient.popularity
        };

        console.log('Datos del ingrediente a insertar:', {
          name: ingredientData.name,
          languages: {
            name_en: ingredientData.name_en,
            name_fr: ingredientData.name_fr,
            name_it: ingredientData.name_it,
            name_pt: ingredientData.name_pt,
            name_zh: ingredientData.name_zh
          }
        });

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

        // Agregar información nutricional
        if (ingredient.nutritional_info) {
          await supabase
            .from('nutritional_info')
            .insert({
              ingredient_id: newIngredient.id,
              ...ingredient.nutritional_info
            });
        }

        // Agregar usos
        if (ingredient.uses) {
          for (const use of ingredient.uses) {
            await supabase
              .from('ingredient_uses')
              .insert({
                ingredient_id: newIngredient.id,
                use_description: use
              });
          }
        }

        // Agregar recetas
        if (ingredient.recipes) {
          for (const recipe of ingredient.recipes) {
            await supabase
              .from('ingredient_recipes')
              .insert({
                ingredient_id: newIngredient.id,
                ...recipe
              });
          }
        }

        // Agregar variedades
        if (ingredient.varieties) {
          for (const variety of ingredient.varieties) {
            await supabase
              .from('ingredient_varieties')
              .insert({
                ingredient_id: newIngredient.id,
                variety_name: variety
              });
          }
        }

        // Agregar precio si existe
        if (ingredient.price_estimate) {
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
                price: ingredient.price_estimate,
                unit: 'kg'
              });
          }
        }

        successfullyCreated++;
        results.push({
          id: newIngredient.id,
          name: ingredient.name,
          category: categoryName,
          languages_complete: missingLanguages.length === 0,
          missing_languages: missingLanguages,
          success: true
        });
      }

      console.log('=== RESUMEN DE PROCESAMIENTO ===');
      console.log(`✅ Ingredientes creados exitosamente: ${successfullyCreated}`);
      console.log(`⚠️ Duplicados detectados y omitidos: ${duplicatesFound}`);
      
      results.forEach(result => {
        if (result.skipped) {
          console.log(`- ${result.name}: ⚠️ OMITIDO (duplicado)`);
        } else {
          console.log(`- ${result.name}: ${result.languages_complete ? '✅ Completo' : '⚠️ Faltan idiomas: ' + result.missing_languages.join(', ')}`);
        }
      });

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
        const { data: newCategory, error } = await supabase
          .from('categories')
          .insert(category)
          .select('id, name')
          .single();

        if (error && !error.message.includes('duplicate')) {
          throw error;
        }

        results.push({
          id: newCategory?.id,
          name: category.name,
          success: !error
        });
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
