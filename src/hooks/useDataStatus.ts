
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        // Verificar idiomas críticos: francés, italiano, portugués y chino
        const hasAllLanguages = !!(
          ingredient.name_fr && 
          ingredient.name_it && 
          ingredient.name_pt && 
          ingredient.name_zh
        );
        
        const hasPrices = ingredient.ingredient_prices && ingredient.ingredient_prices.length > 0;
        const hasUses = ingredient.ingredient_uses && ingredient.ingredient_uses.length > 0;
        const hasRecipes = ingredient.ingredient_recipes && ingredient.ingredient_recipes.length > 0;
        const hasNutrition = ingredient.nutritional_info && ingredient.nutritional_info.length > 0;
        const hasVarieties = ingredient.ingredient_varieties && ingredient.ingredient_varieties.length > 0;

        if (hasPrices) stats.withPrices++;
        if (hasAllLanguages) stats.withMultipleLanguages++;
        if (hasUses) stats.withUses++;
        if (hasRecipes) stats.withRecipes++;
        if (hasNutrition) stats.withNutrition++;
        if (hasVarieties) stats.withVarieties++;

        // Contabilizar faltantes
        if (!hasAllLanguages) stats.missingLanguages++;
        if (!hasPrices) stats.missingPrices++;
        if (!hasAllLanguages && !hasPrices && !hasUses && !hasRecipes) stats.missingAllData++;
      });

      console.log('📊 Estado de datos:', stats);
      return { stats, ingredients: ingredients || [] };
    },
  });
};
