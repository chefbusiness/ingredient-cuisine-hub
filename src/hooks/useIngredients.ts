
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Ingredient {
  id: string;
  name: string;
  name_en: string;
  name_la?: string;
  name_fr?: string;
  name_it?: string;
  name_pt?: string;
  name_zh?: string;
  description: string;
  category_id: string;
  popularity: number;
  image_url?: string;
  real_image_url?: string;
  temporada?: string;
  origen?: string;
  merma: number;
  rendimiento: number;
  slug: string;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    name_en: string;
  };
  ingredient_prices?: Array<{
    id: string;
    price: number;
    unit: string;
    season_variation?: string;
    country_id: string;
    countries?: {
      name: string;
      currency_symbol: string;
      code: string;
    };
  }>;
  ingredient_uses?: Array<{
    use_description: string;
  }>;
  ingredient_recipes?: Array<{
    name: string;
    type: string;
    difficulty: string;
    time: string;
  }>;
  nutritional_info?: Array<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    vitamin_c: number;
  }>;
  ingredient_varieties?: Array<{
    variety_name: string;
  }>;
}

export const useIngredients = (searchQuery?: string, categoryFilter?: string, sortBy?: string) => {
  return useQuery({
    queryKey: ['ingredients', searchQuery, categoryFilter, sortBy],
    queryFn: async () => {
      console.log('=== FETCH INGREDIENTS ===');
      console.log('Parámetros:', { searchQuery, categoryFilter, sortBy });

      let query = supabase
        .from('ingredients')
        .select(`
          *,
          categories!inner(name, name_en),
          ingredient_prices!left(
            id,
            price,
            unit,
            season_variation,
            country_id,
            countries!left(name, currency_symbol, code)
          )
        `);

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
      } else {
        // Orden por defecto: popularidad descendente
        query = query.order('popularity', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching ingredients:', error);
        throw error;
      }

      console.log(`✅ Encontrados ${data?.length || 0} ingredientes`);
      
      // Para la vista general, filtrar precios de España como preferencia
      const processedData = data?.map(ingredient => {
        if (ingredient.ingredient_prices && ingredient.ingredient_prices.length > 0) {
          // Buscar precios de España primero
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
        
        // Si no hay precios de España, mantener los precios existentes (si los hay)
        return ingredient;
      }) || [];

      return processedData;
    },
  });
};

export const useIngredientById = (id: string) => {
  return useQuery({
    queryKey: ['ingredient', id],
    queryFn: async () => {
      console.log('🔍 Fetching ingredient by ID:', id);
      
      const { data, error } = await supabase
        .from('ingredients')
        .select(`
          *,
          categories(name, name_en),
          ingredient_prices(
            id,
            price,
            unit,
            season_variation,
            country_id,
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
        console.error('❌ Error fetching ingredient:', error);
        throw error;
      }

      console.log('✅ Ingredient data loaded (ALL PRICES):', data);
      console.log('📊 All prices data:', data.ingredient_prices);

      // IMPORTANTE: Para el editor, devolver TODOS los precios sin filtrar
      // Esto permite editar precios de todos los países
      return data;
    },
    enabled: !!id,
  });
};

// Nuevo hook para buscar por slug
export const useIngredientBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['ingredient-slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select(`
          *,
          categories(name, name_en),
          ingredient_prices(
            id,
            price,
            unit,
            season_variation,
            country_id,
            countries(name, currency_symbol, code)
          ),
          nutritional_info(*),
          ingredient_uses(*),
          ingredient_recipes(*),
          ingredient_varieties(*)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching ingredient by slug:', error);
        throw error;
      }

      // Para las páginas de detalle públicas, también devolver todos los precios
      // pero se pueden filtrar en el componente si es necesario
      return data;
    },
    enabled: !!slug,
  });
};
