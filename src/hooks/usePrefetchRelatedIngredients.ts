
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const usePrefetchRelatedIngredients = (
  categoryId: string, 
  currentIngredientId: string,
  enabled: boolean = true
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !categoryId || !currentIngredientId) return;

    const prefetchTimeout = setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey: ['related-ingredients', categoryId, currentIngredientId, 8],
        queryFn: async () => {
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
            .limit(8);

          if (error) throw error;
          return data || [];
        },
        staleTime: 5 * 60 * 1000,
      });
    }, 1000); // Prefetch después de 1 segundo

    return () => clearTimeout(prefetchTimeout);
  }, [queryClient, categoryId, currentIngredientId, enabled]);
};
