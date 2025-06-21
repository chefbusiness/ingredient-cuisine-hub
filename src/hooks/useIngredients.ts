
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Ingredient {
  id: string;
  name: string;
  name_en: string;
  name_la?: string;
  description: string;
  category_id: string;
  popularity: number;
  image_url?: string;
  temporada?: string;
  origen?: string;
  merma: number;
  rendimiento: number;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    name_en: string;
  };
  ingredient_prices?: Array<{
    price: number;
    unit: string;
    countries?: {
      name: string;
      currency_symbol: string;
    };
  }>;
}

export const useIngredients = (searchQuery?: string, categoryFilter?: string, sortBy?: string) => {
  return useQuery({
    queryKey: ['ingredients', searchQuery, categoryFilter, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('ingredients')
        .select(`
          *,
          categories!inner(name, name_en),
          ingredient_prices!inner(
            price,
            unit,
            countries!inner(name, currency_symbol)
          )
        `)
        .eq('ingredient_prices.countries.code', 'ES'); // Filtrar precios de España por defecto

      // Aplicar filtro de búsqueda
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,name_en.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Aplicar filtro de categoría
      if (categoryFilter && categoryFilter !== 'todos') {
        query = query.eq('categories.name', categoryFilter);
      }

      // Aplicar ordenamiento
      if (sortBy === 'popularidad') {
        query = query.order('popularity', { ascending: false });
      } else if (sortBy === 'nombre') {
        query = query.order('name', { ascending: true });
      } else if (sortBy === 'precio') {
        query = query.order('ingredient_prices.price', { ascending: true });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching ingredients:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useIngredientById = (id: string) => {
  return useQuery({
    queryKey: ['ingredient', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select(`
          *,
          categories(name, name_en),
          ingredient_prices(
            price,
            unit,
            countries(name, currency_symbol, code)
          ),
          nutritional_info(*),
          ingredient_uses(*),
          ingredient_recipes(*),
          ingredient_varieties(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching ingredient:', error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};
