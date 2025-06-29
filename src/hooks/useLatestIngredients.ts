
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useLatestIngredients = (limit: number = 4) => {
  return useQuery({
    queryKey: ['latest-ingredients', limit],
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
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching latest ingredients:', error);
        throw error;
      }

      return data || [];
    },
  });
};
