
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

      // PASO 1: Aplicar filtro de búsqueda PRIMERO (esto es lo más importante)
      if (filters.searchQuery && filters.searchQuery.trim()) {
        console.log('🔍 APLICANDO BÚSQUEDA PARA:', filters.searchQuery);
        
        try {
          query = applyAccentInsensitiveSearch(query, filters.searchQuery);
          console.log('🔍 Búsqueda aplicada exitosamente');
        } catch (error) {
          console.error('❌ Error en búsqueda:', error);
          // En caso de error, aplicar búsqueda simple
          query = query.ilike('name', `%${filters.searchQuery}%`);
        }
      }

      // PASO 2: Aplicar filtro de categoría
      if (filters.category && filters.category !== 'todos') {
        console.log('📂 Aplicando filtro de categoría:', filters.category);
        query = query.eq('categories.name', filters.category);
      }

      // PASO 3: Aplicar filtros de rango (popularidad)
      if (filters.popularityRange) {
        query = query.gte('popularity', filters.popularityRange[0])
                     .lte('popularity', filters.popularityRange[1]);
      }

      // PASO 4: Aplicar filtro de temporada
      if (filters.season && filters.season !== "todas" && filters.season !== "") {
        query = query.eq('temporada', filters.season);
      }

      // PASO 5: Aplicar filtro de origen
      if (filters.origin && filters.origin.trim()) {
        query = query.ilike('origen', `%${filters.origin}%`);
      }

      // PASO 6: Aplicar ordenamiento (SIN filtros de precio para evitar errores SQL)
      try {
        if (filters.sortBy === 'popularidad') {
          query = query.order('popularity', { ascending: false });
        } else if (filters.sortBy === 'nombre') {
          query = query.order('name', { ascending: true });
        } else if (filters.sortBy === 'categoria') {
          query = query.order('categories.name', { ascending: true });
        }
        // REMOVER ordenamiento por precio para evitar errores SQL
        // else if (filters.sortBy === 'precio') {
        //   query = query.order('ingredient_prices.price', { ascending: true });
        // }
      } catch (error) {
        console.warn('⚠️ Error en ordenamiento, usando orden por defecto:', error);
        query = query.order('name', { ascending: true });
      }

      console.log('🚀 Ejecutando query en Supabase...');
      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching advanced ingredients:', error);
        throw error;
      }

      console.log(`✅ Encontrados ${data?.length || 0} ingredientes con filtros avanzados`);
      
      // LOGGING ESPECÍFICO para búsquedas
      if (filters.searchQuery && filters.searchQuery.trim()) {
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
