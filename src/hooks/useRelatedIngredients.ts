
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRelatedIngredients = (categoryId: string, currentIngredientId: string, limit: number = 4) => {
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
    enabled: !!categoryId && !!currentIngredientId,
  });
};
