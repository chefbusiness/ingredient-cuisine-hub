
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

export const useAdvancedIngredients = (filters: AdvancedFilters) => {
  return useQuery({
    queryKey: ['advanced-ingredients', filters],
    queryFn: async () => {
      console.log('=== BÚSQUEDA CON FILTRO DE PAÍS ===');
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
      if (filters.sortBy === 'popularidad') {
        query = query.order('popularity', { ascending: false });
      } else if (filters.sortBy === 'nombre') {
        query = query.order('name', { ascending: true });
      } else if (filters.sortBy === 'categoria') {
        query = query.order('categories.name', { ascending: true });
      }

      console.log('🚀 Ejecutando query con filtro de país...');
      const { data, error } = await query;

      if (error) {
        console.error('❌ Error en query final:', error);
        throw error;
      }

      console.log(`✅ ÉXITO: ${data?.length || 0} ingredientes encontrados`);
      
      // NUEVO: Procesar precios según el país seleccionado
      const selectedCountry = filters.country || 'España';
      console.log('🌍 País seleccionado para precios:', selectedCountry);
      
      const processedData = data?.map(ingredient => {
        if (ingredient.ingredient_prices && ingredient.ingredient_prices.length > 0) {
          // Buscar precios del país seleccionado primero
          const countryPrices = ingredient.ingredient_prices.filter(
            price => price.countries?.name === selectedCountry
          );
          
          if (countryPrices.length > 0) {
            console.log(`💰 Precios encontrados para ${ingredient.name} en ${selectedCountry}`);
            return {
              ...ingredient,
              ingredient_prices: countryPrices
            };
          } else {
            // Fallback a España si no hay precios del país seleccionado
            const spanishPrices = ingredient.ingredient_prices.filter(
              price => price.countries?.name === 'España'
            );
            
            if (spanishPrices.length > 0) {
              console.log(`💰 Fallback a precios de España para ${ingredient.name}`);
              return {
                ...ingredient,
                ingredient_prices: spanishPrices
              };
            }
          }
        }
        
        return ingredient;
      }) || [];

      return processedData as Ingredient[];
    },
  });
};
