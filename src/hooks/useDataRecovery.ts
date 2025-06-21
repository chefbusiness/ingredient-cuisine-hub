
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDataStatus = () => {
  return useQuery({
    queryKey: ['data-status'],
    queryFn: async () => {
      console.log('=== VERIFICANDO ESTADO DE DATOS ===');
      
      // Obtener estadísticas de ingredientes
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('ingredients')
        .select(`
          id,
          name,
          name_en,
          name_la,
          name_fr,
          name_it,
          name_pt,
          name_zh,
          description,
          ingredient_prices!left(id, price, countries!left(name)),
          ingredient_uses!left(id),
          ingredient_recipes!left(id),
          nutritional_info!left(id),
          ingredient_varieties!left(id)
        `);

      if (ingredientsError) {
        console.error('Error fetching ingredients status:', ingredientsError);
        throw ingredientsError;
      }

      // Analizar el estado de los datos
      const stats = {
        total: ingredients?.length || 0,
        withPrices: 0,
        withMultipleLanguages: 0,
        withUses: 0,
        withRecipes: 0,
        withNutrition: 0,
        withVarieties: 0,
        missingLanguages: 0,
        missingPrices: 0,
        missingAllData: 0
      };

      ingredients?.forEach(ingredient => {
        const hasMultipleLanguages = !!(ingredient.name_la || ingredient.name_fr || ingredient.name_it || ingredient.name_pt || ingredient.name_zh);
        const hasPrices = ingredient.ingredient_prices && ingredient.ingredient_prices.length > 0;
        const hasUses = ingredient.ingredient_uses && ingredient.ingredient_uses.length > 0;
        const hasRecipes = ingredient.ingredient_recipes && ingredient.ingredient_recipes.length > 0;
        const hasNutrition = ingredient.nutritional_info && ingredient.nutritional_info.length > 0;
        const hasVarieties = ingredient.ingredient_varieties && ingredient.ingredient_varieties.length > 0;

        if (hasPrices) stats.withPrices++;
        if (hasMultipleLanguages) stats.withMultipleLanguages++;
        if (hasUses) stats.withUses++;
        if (hasRecipes) stats.withRecipes++;
        if (hasNutrition) stats.withNutrition++;
        if (hasVarieties) stats.withVarieties++;

        if (!hasMultipleLanguages) stats.missingLanguages++;
        if (!hasPrices) stats.missingPrices++;
        if (!hasMultipleLanguages && !hasPrices && !hasUses && !hasRecipes) stats.missingAllData++;
      });

      console.log('📊 Estado de datos:', stats);
      return { stats, ingredients: ingredients || [] };
    },
  });
};

export const useCompleteIngredientsData = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ingredientIds }: { ingredientIds: string[] }) => {
      console.log('=== INICIANDO RECUPERACIÓN DE DATOS ===');
      console.log(`🔄 Procesando ${ingredientIds.length} ingredientes`);

      let completedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Mostrar toast de inicio
      toast({
        title: "Recuperación iniciada",
        description: `Procesando ${ingredientIds.length} ingredientes...`,
      });

      for (const ingredientId of ingredientIds) {
        try {
          // Obtener el ingrediente actual
          const { data: ingredient, error: fetchError } = await supabase
            .from('ingredients')
            .select('id, name, description')
            .eq('id', ingredientId)
            .single();

          if (fetchError || !ingredient) {
            console.error(`❌ Error obteniendo ingrediente ${ingredientId}:`, fetchError);
            errorCount++;
            errors.push(`Error obteniendo ingrediente ${ingredientId}`);
            continue;
          }

          console.log(`🔄 Completando datos para: ${ingredient.name}`);

          // Generar datos completos con DeepSeek
          const { data: generatedData, error: generateError } = await supabase.functions.invoke('generate-content', {
            body: {
              type: 'ingredient',
              ingredient: ingredient.name,
              count: 1
            }
          });

          if (generateError || !generatedData.success) {
            console.error(`❌ Error generando datos para ${ingredient.name}:`, generateError);
            errorCount++;
            errors.push(`Error generando datos para ${ingredient.name}`);
            continue;
          }

          const completedIngredient = generatedData.data[0];

          // Actualizar ingrediente con idiomas faltantes
          const { error: updateError } = await supabase
            .from('ingredients')
            .update({
              name_la: completedIngredient.name_la || null,
              name_fr: completedIngredient.name_fr || null,
              name_it: completedIngredient.name_it || null,
              name_pt: completedIngredient.name_pt || null,
              name_zh: completedIngredient.name_zh || null,
              merma: completedIngredient.merma || 0,
              rendimiento: completedIngredient.rendimiento || 100,
              temporada: completedIngredient.temporada || null,
              origen: completedIngredient.origen || null
            })
            .eq('id', ingredientId);

          if (updateError) {
            console.error(`❌ Error actualizando ingrediente ${ingredient.name}:`, updateError);
            errorCount++;
            errors.push(`Error actualizando ${ingredient.name}`);
            continue;
          }

          // Agregar precios para múltiples países si no existen
          if (completedIngredient.precios && Array.isArray(completedIngredient.precios)) {
            for (const precio of completedIngredient.precios) {
              // Buscar el país
              const { data: country } = await supabase
                .from('countries')
                .select('id')
                .eq('code', precio.pais)
                .single();

              if (country) {
                // Verificar si ya existe precio para este país
                const { data: existingPrice } = await supabase
                  .from('ingredient_prices')
                  .select('id')
                  .eq('ingredient_id', ingredientId)
                  .eq('country_id', country.id)
                  .single();

                if (!existingPrice) {
                  await supabase
                    .from('ingredient_prices')
                    .insert({
                      ingredient_id: ingredientId,
                      country_id: country.id,
                      price: precio.precio,
                      unit: precio.unidad || 'kg'
                    });
                }
              }
            }
          }

          // Agregar usos nutricionales si no existen
          if (completedIngredient.usos_nutritivos && Array.isArray(completedIngredient.usos_nutritivos)) {
            const { data: existingUses } = await supabase
              .from('ingredient_uses')
              .select('id')
              .eq('ingredient_id', ingredientId);

            if (!existingUses || existingUses.length === 0) {
              const usesToInsert = completedIngredient.usos_nutritivos.slice(0, 3).map((uso: string) => ({
                ingredient_id: ingredientId,
                use_description: uso
              }));

              await supabase
                .from('ingredient_uses')
                .insert(usesToInsert);
            }
          }

          // Agregar recetas si no existen
          if (completedIngredient.recetas && Array.isArray(completedIngredient.recetas)) {
            const { data: existingRecipes } = await supabase
              .from('ingredient_recipes')
              .select('id')
              .eq('ingredient_id', ingredientId);

            if (!existingRecipes || existingRecipes.length === 0) {
              const recipesToInsert = completedIngredient.recetas.slice(0, 3).map((receta: any) => ({
                ingredient_id: ingredientId,
                name: receta.nombre || receta.name,
                type: receta.tipo || receta.type || 'principal',
                difficulty: receta.dificultad || receta.difficulty || 'media',
                time: receta.tiempo || receta.time || '30 min'
              }));

              await supabase
                .from('ingredient_recipes')
                .insert(recipesToInsert);
            }
          }

          // Agregar información nutricional si no existe
          if (completedIngredient.informacion_nutricional) {
            const { data: existingNutrition } = await supabase
              .from('nutritional_info')
              .select('id')
              .eq('ingredient_id', ingredientId);

            if (!existingNutrition || existingNutrition.length === 0) {
              await supabase
                .from('nutritional_info')
                .insert({
                  ingredient_id: ingredientId,
                  calories: completedIngredient.informacion_nutricional.calorias || 0,
                  protein: completedIngredient.informacion_nutricional.proteinas || 0,
                  carbs: completedIngredient.informacion_nutricional.carbohidratos || 0,
                  fat: completedIngredient.informacion_nutricional.grasas || 0,
                  fiber: completedIngredient.informacion_nutricional.fibra || 0,
                  vitamin_c: completedIngredient.informacion_nutricional.vitamina_c || 0
                });
            }
          }

          completedCount++;
          console.log(`✅ Completado: ${ingredient.name} (${completedCount}/${ingredientIds.length})`);

        } catch (error) {
          console.error(`❌ Error procesando ingrediente ${ingredientId}:`, error);
          errorCount++;
          errors.push(`Error procesando ingrediente ${ingredientId}: ${error}`);
        }
      }

      return { completedCount, errorCount, total: ingredientIds.length, errors };
    },
    onSuccess: (result) => {
      // Invalidar queries para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['data-status'] });
      
      if (result.completedCount > 0) {
        toast({
          title: "✅ Recuperación completada",
          description: `${result.completedCount} ingredientes completados exitosamente${result.errorCount > 0 ? `, ${result.errorCount} errores` : ''}`,
        });
      } else {
        toast({
          title: "⚠️ Recuperación terminada",
          description: `No se pudieron completar ingredientes. ${result.errorCount} errores.`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('❌ Error en recuperación de datos:', error);
      toast({
        title: "❌ Error en recuperación",
        description: error.message || "Error desconocido durante la recuperación",
        variant: "destructive",
      });
    },
  });
};
