
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
  country?: string;
}

interface PaginationParams {
  page: number;
  limit: number;
}

export const useAdvancedIngredients = (filters: AdvancedFilters, pagination: PaginationParams) => {
  return useQuery({
    queryKey: ['advanced-ingredients', filters, pagination],
    queryFn: async () => {
      console.log('=== BÚSQUEDA CON FILTRO DE PAÍS Y PAGINACIÓN ===');
      console.log('Filtros:', filters);
      console.log('Paginación:', pagination);

      const selectedCountry = filters.country || 'España';
      console.log('🌍 País seleccionado:', selectedCountry);

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
        `, { count: 'exact' });

      const hasSearchQuery = filters.searchQuery && filters.searchQuery.trim();
      const hasSpecificCategory = filters.category && filters.category !== 'todos';
      const hasCountryFilter = filters.country && filters.country.trim();

      // PASO 1: APLICAR BÚSQUEDA DE TEXTO (PRIORIDAD MÁXIMA)
      if (hasSearchQuery) {
        console.log('🔍 APLICANDO BÚSQUEDA:', filters.searchQuery);
        
        try {
          query = applyAccentInsensitiveSearch(query, filters.searchQuery);
          console.log('✅ Búsqueda aplicada exitosamente');
        } catch (error) {
          console.error('❌ Error crítico en búsqueda:', error);
          // Fallback absoluto si todo falla
          query = query.ilike('name', `%${filters.searchQuery}%`);
          console.log('🔄 Usando fallback simple');
        }
      }

      // PASO 2: Aplicar filtro de categoría SOLO si NO hay búsqueda
      if (hasSpecificCategory && !hasSearchQuery) {
        console.log('📂 Aplicando filtro de categoría:', filters.category);
        query = query.eq('categories.name', filters.category);
      }

      // PASO 3: APLICAR FILTRO DE PAÍS - NUEVA LÓGICA CORREGIDA
      if (hasCountryFilter) {
        console.log('🌍 APLICANDO FILTRO DE PAÍS:', selectedCountry);
        // SIEMPRE filtrar por el país seleccionado, sin excepciones
        query = query.eq('ingredient_prices.countries.name', selectedCountry);
      } else {
        // Si NO hay filtro de país en la URL, usar España por defecto
        console.log('🌍 Sin filtro de país específico - usando España por defecto');
        query = query.eq('ingredient_prices.countries.name', 'España');
      }

      // PASO 4: Aplicar otros filtros
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

      // PASO 5: Aplicar ordenamiento
      if (filters.sortBy === 'popularidad') {
        query = query.order('popularity', { ascending: false });
      } else if (filters.sortBy === 'nombre') {
        query = query.order('name', { ascending: true });
      } else if (filters.sortBy === 'categoria') {
        query = query.order('categories.name', { ascending: true });
      }

      // PASO 6: Aplicar paginación
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit - 1;
      query = query.range(startIndex, endIndex);

      console.log(`🚀 Ejecutando query con paginación (${startIndex}-${endIndex})...`);
      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error en query final:', error);
        throw error;
      }

      console.log(`✅ ÉXITO: ${data?.length || 0} ingredientes encontrados de ${count || 0} total`);
      
      // PASO 7: Procesar precios según el país seleccionado
      const processedData = data?.map(ingredient => {
        if (ingredient.ingredient_prices && ingredient.ingredient_prices.length > 0) {
          // Usar solo los precios del país seleccionado (ya filtrados por la query)
          console.log(`💰 Precios encontrados para ${ingredient.name} en ${selectedCountry}`);
          return {
            ...ingredient,
            ingredient_prices: ingredient.ingredient_prices
          };
        }
        
        return ingredient;
      }) || [];

      return {
        data: processedData as Ingredient[],
        count: count || 0
      };
    },
  });
};
