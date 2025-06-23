
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
          categories!left(name, name_en),
          ingredient_prices!left(
            price,
            unit,
            countries!left(name, currency_symbol, code)
          )
        `);

      // NUEVA IMPLEMENTACIÓN: Aplicar filtro de búsqueda PRIMERO y con logging detallado
      if (filters.searchQuery) {
        console.log('🔍 APLICANDO BÚSQUEDA PARA:', filters.searchQuery);
        console.log('🔍 Término de búsqueda sin procesar:', JSON.stringify(filters.searchQuery));
        
        // Aplicar la búsqueda con la función mejorada
        query = applyAccentInsensitiveSearch(query, filters.searchQuery);
        
        console.log('🔍 Búsqueda aplicada correctamente');
      }

      // Aplicar filtro de categoría SOLO si se especifica una categoría específica
      if (filters.category && filters.category !== 'todos') {
        console.log('📂 Aplicando filtro de categoría:', filters.category);
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

      console.log('🚀 Ejecutando query en Supabase...');
      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching advanced ingredients:', error);
        throw error;
      }

      console.log(`✅ Encontrados ${data?.length || 0} ingredientes con filtros avanzados`);
      
      // LOGGING DETALLADO para debugging
      if (filters.searchQuery) {
        console.log('🔍 RESULTADOS DE BÚSQUEDA DETALLADOS:');
        console.log('Total de ingredientes encontrados:', data?.length);
        console.log('Nombres de ingredientes encontrados:', data?.map(i => i.name));
        
        // Verificar específicamente si "Azafrán" está en los resultados
        const azafranFound = data?.find(i => 
          i.name.toLowerCase().includes('azafr') || 
          i.name_en?.toLowerCase().includes('saffr')
        );
        console.log('¿Se encontró Azafrán?:', azafranFound ? 'SÍ' : 'NO');
        if (azafranFound) {
          console.log('Datos de Azafrán encontrado:', azafranFound);
        }
      }
      
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
