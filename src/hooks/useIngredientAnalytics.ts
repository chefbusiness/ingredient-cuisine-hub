
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface IngredientAnalytics {
  totalIngredients: number;
  categoriesCount: number;
  mostPopularIngredient: string;
  averagePopularity: number;
  categoriesBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  seasonalDistribution: Array<{
    season: string;
    count: number;
  }>;
}

export const useIngredientAnalytics = () => {
  return useQuery({
    queryKey: ['ingredient-analytics'],
    queryFn: async (): Promise<IngredientAnalytics> => {
      console.log('=== FETCHING ANALYTICS ===');

      // Obtener datos básicos
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('ingredients')
        .select(`
          id,
          name,
          popularity,
          temporada,
          categories(name)
        `);

      if (ingredientsError) {
        console.error('Error fetching ingredients for analytics:', ingredientsError);
        throw ingredientsError;
      }

      // Obtener conteo de categorías
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id');

      if (categoriesError) {
        console.error('Error fetching categories count:', categoriesError);
        throw categoriesError;
      }

      // Calcular analytics
      const totalIngredients = ingredients?.length || 0;
      const categoriesCount = categories?.length || 0;
      
      const mostPopular = ingredients?.reduce((prev, current) => 
        (prev.popularity > current.popularity) ? prev : current
      );
      
      const averagePopularity = ingredients?.length 
        ? ingredients.reduce((sum, ing) => sum + ing.popularity, 0) / ingredients.length 
        : 0;

      // Distribución por categorías
      const categoryMap = new Map();
      ingredients?.forEach(ingredient => {
        const category = ingredient.categories?.name || 'Sin categoría';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });

      const categoriesBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count: count as number,
        percentage: totalIngredients > 0 ? ((count as number) / totalIngredients) * 100 : 0
      }));

      // Distribución por temporada
      const seasonMap = new Map();
      ingredients?.forEach(ingredient => {
        const season = ingredient.temporada || 'Todo el año';
        seasonMap.set(season, (seasonMap.get(season) || 0) + 1);
      });

      const seasonalDistribution = Array.from(seasonMap.entries()).map(([season, count]) => ({
        season,
        count: count as number
      }));

      console.log('✅ Analytics calculados:', {
        totalIngredients,
        categoriesCount,
        mostPopular: mostPopular?.name,
        averagePopularity: averagePopularity.toFixed(1)
      });

      return {
        totalIngredients,
        categoriesCount,
        mostPopularIngredient: mostPopular?.name || 'N/A',
        averagePopularity,
        categoriesBreakdown,
        seasonalDistribution
      };
    },
  });
};
