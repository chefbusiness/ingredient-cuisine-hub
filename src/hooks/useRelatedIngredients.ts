
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseRelatedIngredientsOptions {
  enabled?: boolean;
}

export const useRelatedIngredients = (
  categoryId: string, 
  currentIngredientId: string, 
  limit: number = 4,
  options: UseRelatedIngredientsOptions = {}
) => {
  return useQuery({
    queryKey: ['related-ingredients', categoryId, currentIngredientId, limit],
    queryFn: async () => {
      if (!categoryId) return [];

      const { data, error } = await supabase
        .from('ingredients')
        .select(`
          id,
          name,
          name_en,
          slug,
          image_url,
          real_image_url,
          popularity,
          categories(name)
        `)
        .eq('category_id', categoryId)
        .neq('id', currentIngredientId)
        .order('popularity', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching related ingredients:', error);
        throw error;
      }

      return data || [];
    },
    enabled: (options.enabled !== false) && !!categoryId && !!currentIngredientId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};
