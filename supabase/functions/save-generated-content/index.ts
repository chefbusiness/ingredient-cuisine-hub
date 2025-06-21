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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();

    if (type === 'ingredient') {
      const results = [];
      
      for (const ingredient of data) {
        console.log('Procesando ingrediente:', ingredient.name, 'con categoría:', ingredient.category);
        
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
              name_en: categoryName === 'especias' ? 'spices' : categoryName,
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

        // Crear el ingrediente
        const { data: newIngredient, error: ingredientError } = await supabase
          .from('ingredients')
          .insert({
            name: ingredient.name,
            name_en: ingredient.name_en,
            name_la: ingredient.name_la,
            description: ingredient.description,
            category_id: categoryId,
            temporada: ingredient.temporada,
            origen: ingredient.origen,
            merma: ingredient.merma,
            rendimiento: ingredient.rendimiento,
            popularity: ingredient.popularity
          })
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

        results.push({
          id: newIngredient.id,
          name: ingredient.name,
          category: categoryName,
          success: true
        });
      }

      return new Response(JSON.stringify({ 
        success: true,
        results: results 
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
