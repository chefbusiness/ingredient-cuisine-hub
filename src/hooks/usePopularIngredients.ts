
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PopularIngredient {
  id: string;
  name: string;
  name_en: string;
  slug: string;
  image_url?: string;
  real_image_url?: string;
  popularity: number;
  viewCount: number;
  categories?: {
    name: string;
  };
}

interface PopularIngredientsData {
  mostViewed: PopularIngredient[];
  trending: PopularIngredient[];
  loading: boolean;
  error: string | null;
}

export const usePopularIngredients = (limit: number = 5) => {
  const [data, setData] = useState<PopularIngredientsData>({
    mostViewed: [],
    trending: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchPopularIngredients = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // Ingredientes más vistos en las últimas 24 horas (usuarios anónimos + registrados)
        const { data: recentViews } = await supabase
          .from('page_views')
          .select(`
            ingredient_id,
            ingredients!inner(
              id, name, name_en, slug, image_url, real_image_url, popularity,
              categories(name)
            )
          `)
          .gte('viewed_at', twentyFourHoursAgo)
          .not('ingredient_id', 'is', null);

        const { data: userViews } = await supabase
          .from('user_history')
          .select(`
            ingredient_id,
            ingredients!inner(
              id, name, name_en, slug, image_url, real_image_url, popularity,
              categories(name)
            )
          `)
          .gte('viewed_at', twentyFourHoursAgo);

        // Combinar vistas anónimas y de usuarios registrados
        const allViews = [...(recentViews || []), ...(userViews || [])];
        
        // Contar visualizaciones por ingrediente
        const viewCounts = new Map<string, { ingredient: any; count: number }>();
        
        allViews.forEach(view => {
          if (view.ingredient_id && view.ingredients) {
            const key = view.ingredient_id;
            const current = viewCounts.get(key) || { 
              ingredient: view.ingredients, 
              count: 0 
            };
            viewCounts.set(key, { ...current, count: current.count + 1 });
          }
        });

        // Convertir a array y ordenar por visualizaciones
        const mostViewed = Array.from(viewCounts.entries())
          .map(([id, data]) => ({
            id,
            name: data.ingredient.name,
            name_en: data.ingredient.name_en,
            slug: data.ingredient.slug,
            image_url: data.ingredient.image_url,
            real_image_url: data.ingredient.real_image_url,
            popularity: data.ingredient.popularity,
            viewCount: data.count,
            categories: data.ingredient.categories
          }))
          .sort((a, b) => b.viewCount - a.viewCount)
          .slice(0, limit);

        // Ingredientes trending (alta popularidad base + visualizaciones recientes)
        const { data: trendingData } = await supabase
          .from('ingredients')
          .select(`
            id, name, name_en, slug, image_url, real_image_url, popularity,
            categories(name)
          `)
          .gte('popularity', 70)
          .order('popularity', { ascending: false })
          .limit(limit * 2);

        // Calcular trending score (popularidad base + actividad reciente)
        const trending = (trendingData || [])
          .map(ingredient => {
            const recentActivity = viewCounts.get(ingredient.id)?.count || 0;
            const trendingScore = ingredient.popularity + (recentActivity * 10);
            
            return {
              id: ingredient.id,
              name: ingredient.name,
              name_en: ingredient.name_en,
              slug: ingredient.slug,
              image_url: ingredient.image_url,
              real_image_url: ingredient.real_image_url,
              popularity: ingredient.popularity,
              viewCount: recentActivity,
              categories: ingredient.categories,
              trendingScore
            };
          })
          .sort((a, b) => b.trendingScore - a.trendingScore)
          .slice(0, limit);

        setData({
          mostViewed,
          trending,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching popular ingredients:', error);
        setData(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Error al cargar ingredientes populares'
        }));
      }
    };

    fetchPopularIngredients();
    
    // Actualizar cada 15 minutos para datos frescos
    const interval = setInterval(fetchPopularIngredients, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [limit]);

  return data;
};
