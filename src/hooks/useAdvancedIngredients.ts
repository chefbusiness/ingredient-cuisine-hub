
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
      console.log('=== NUEVA IMPLEMENTACIÓN DE BÚSQUEDA ===');
      console.log('Filtros:', filters);

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

      const hasSearchQuery = filters.searchQuery && filters.searchQuery.trim();
      const hasSpecificCategory = filters.category && filters.category !== 'todos';

      // PASO 1: APLICAR BÚSQUEDA DE TEXTO (PRIORITARIO)
      if (hasSearchQuery) {
        console.log('🔍 APLICANDO BÚSQUEDA SIN ACENTOS MEJORADA:', filters.searchQuery);
        
        try {
          query = applyAccentInsensitiveSearch(query, filters.searchQuery);
          console.log('✅ Búsqueda aplicada correctamente');
        } catch (error) {
          console.error('❌ Error en búsqueda mejorada, usando fallback:', error);
          // Fallback simple si todo falla
          query = query.ilike('name', `%${filters.searchQuery}%`);
        }
      }

      // PASO 2: Aplicar filtro de categoría SOLO si NO hay búsqueda activa
      if (hasSpecificCategory && !hasSearchQuery) {
        console.log('📂 Aplicando filtro de categoría:', filters.category);
        query = query.eq('categories.name', filters.category);
      } else if (hasSearchQuery) {
        console.log('🔍 BÚSQUEDA ACTIVA: Ignorando categoría para resultados amplios');
      }

      // PASO 3: Aplicar otros filtros
      if (filters.popularityRange) {
        query = query.gte('popularity', filters.popularityRange[0])
                     .lte('popularity', filters.popularityRange[1]);
      }

      if (filters.season && filters.season !== "todas" && filters.season !== "") {
        query = query.eq('temporada', filters.season);
      }

      if (filters.origin && filters.origin.trim()) {
        query = query.ilike('origen', `%${filters.origin}%`);
      }

      // PASO 4: Aplicar ordenamiento
      try {
        if (filters.sortBy === 'popularidad') {
          query = query.order('popularity', { ascending: false });
        } else if (filters.sortBy === 'nombre') {
          query = query.order('name', { ascending: true });
        } else if (filters.sortBy === 'categoria') {
          query = query.order('categories.name', { ascending: true });
        }
      } catch (error) {
        console.warn('⚠️ Error en ordenamiento:', error);
        query = query.order('name', { ascending: true });
      }

      console.log('🚀 Ejecutando query mejorada...');
      const { data, error } = await query;

      if (error) {
        console.error('❌ Error en query:', error);
        throw error;
      }

      console.log(`✅ RESULTADOS: ${data?.length || 0} ingredientes encontrados`);
      
      // LOGGING DETALLADO para depuración
      if (hasSearchQuery) {
        console.log('🔍 ANÁLISIS DE RESULTADOS DE BÚSQUEDA:');
        console.log('- Término buscado:', filters.searchQuery);
        console.log('- Total encontrados:', data?.length);
        console.log('- Ingredientes:', data?.map(i => ({
          nombre: i.name,
          categoria: i.categories?.name
        })));
        
        // Verificar específicamente si encontramos azafrán
        const azafranResults = data?.filter(i => 
          i.name.toLowerCase().includes('azafr') || 
          i.name_en?.toLowerCase().includes('saffr')
        );
        console.log('🌸 Resultados relacionados con azafrán:', azafranResults?.length);
        if (azafranResults && azafranResults.length > 0) {
          console.log('🌸 Detalles azafrán encontrado:', azafranResults);
        }
      }
      
      // Procesar precios (mantener lógica existente)
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
