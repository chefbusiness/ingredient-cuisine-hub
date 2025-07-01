
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
  anonymousViews: PopularIngredient[]; // For backward compatibility
  registeredViews: PopularIngredient[]; // For backward compatibility
  loading: boolean;
  error: string | null;
}

export const usePopularIngredients = (limit: number = 5) => {
  const [data, setData] = useState<PopularIngredientsData>({
    mostViewed: [],
    trending: [],
    anonymousViews: [],
    registeredViews: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchPopularIngredients = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // Ingredientes más vistos en las últimas 24 horas (usuarios anónimos)
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

        // Ingredientes más vistos por usuarios registrados
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

        // Procesar vistas anónimas
        const anonymousViewCounts = new Map<string, { ingredient: any; count: number }>();
        
        (recentViews || []).forEach(view => {
          if (view.ingredient_id && view.ingredients) {
            const key = view.ingredient_id;
            const current = anonymousViewCounts.get(key) || { 
              ingredient: view.ingredients, 
              count: 0 
            };
            anonymousViewCounts.set(key, { ...current, count: current.count + 1 });
          }
        });

        // Procesar vistas de usuarios registrados
        const registeredViewCounts = new Map<string, { ingredient: any; count: number }>();
        
        (userViews || []).forEach(view => {
          if (view.ingredient_id && view.ingredients) {
            const key = view.ingredient_id;
            const current = registeredViewCounts.get(key) || { 
              ingredient: view.ingredients, 
              count: 0 
            };
            registeredViewCounts.set(key, { ...current, count: current.count + 1 });
          }
        });

        // Convertir a arrays para backward compatibility
        const anonymousViews = Array.from(anonymousViewCounts.entries())
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

        const registeredViews = Array.from(registeredViewCounts.entries())
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

        // Combinar todas las vistas para mostViewed
        const allViews = [...(recentViews || []), ...(userViews || [])];
        const allViewCounts = new Map<string, { ingredient: any; count: number }>();
        
        allViews.forEach(view => {
          if (view.ingredient_id && view.ingredients) {
            const key = view.ingredient_id;
            const current = allViewCounts.get(key) || { 
              ingredient: view.ingredients, 
              count: 0 
            };
            allViewCounts.set(key, { ...current, count: current.count + 1 });
          }
        });

        const mostViewed = Array.from(allViewCounts.entries())
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
            const recentActivity = allViewCounts.get(ingredient.id)?.count || 0;
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
          anonymousViews, // For backward compatibility
          registeredViews, // For backward compatibility
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
