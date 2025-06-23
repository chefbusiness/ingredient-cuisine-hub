
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ingredient } from "./useIngredients";
import { applyAccentInsensitiveSearch } from "@/utils/textNormalization";

interface AdvancedFilters {
  searchQuery: string;
  category: string;
  sortBy: string;
  priceRange: [number, number];
  popularityRange: [number, number];
  season?: string;
  origin?: string;
}

export const useAdvancedIngredients = (filters: AdvancedFilters) => {
  return useQuery({
    queryKey: ['advanced-ingredients', filters],
    queryFn: async () => {
      console.log('=== ADVANCED FETCH INGREDIENTS ===');
      console.log('Filtros avanzados:', filters);

      let query = supabase
        .from('ingredients')
        .select(`
          *,
          categories!inner(name, name_en),
          ingredient_prices!left(
            price,
            unit,
            countries!left(name, currency_symbol, code)
          )
        `);

      // Aplicar filtro de búsqueda con soporte para acentos usando la nueva función
      if (filters.searchQuery) {
        console.log('Aplicando búsqueda para:', filters.searchQuery);
        query = applyAccentInsensitiveSearch(query, filters.searchQuery);
      }

      // Aplicar filtro de categoría
      if (filters.category && filters.category !== 'todos') {
        query = query.eq('categories.name', filters.category);
      }

      // Aplicar filtro de popularidad
      query = query.gte('popularity', filters.popularityRange[0])
                   .lte('popularity', filters.popularityRange[1]);

      // Aplicar filtro de temporada - solo si no es "todas" y no está vacío
      if (filters.season && filters.season !== "todas") {
        query = query.eq('temporada', filters.season);
      }

      // Aplicar filtro de origen
      if (filters.origin) {
        query = query.ilike('origen', `%${filters.origin}%`);
      }

      // Aplicar ordenamiento
      if (filters.sortBy === 'popularidad') {
        query = query.order('popularity', { ascending: false });
      } else if (filters.sortBy === 'nombre') {
        query = query.order('name', { ascending: true });
      } else if (filters.sortBy === 'categoria') {
        query = query.order('categories.name', { ascending: true });
      } else if (filters.sortBy === 'precio') {
        query = query.order('ingredient_prices.price', { ascending: true });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching advanced ingredients:', error);
        throw error;
      }

      console.log(`✅ Encontrados ${data?.length || 0} ingredientes con filtros avanzados`);
      
      // Procesar precios como antes
      const processedData = data?.map(ingredient => {
        if (ingredient.ingredient_prices && ingredient.ingredient_prices.length > 0) {
          const spanishPrices = ingredient.ingredient_prices.filter(
            price => price.countries?.code === 'ES'
          );
          
          if (spanishPrices.length > 0) {
            return {
              ...ingredient,
              ingredient_prices: spanishPrices
            };
          }
        }
        
        return ingredient;
      }) || [];

      return processedData as Ingredient[];
    },
  });
};
