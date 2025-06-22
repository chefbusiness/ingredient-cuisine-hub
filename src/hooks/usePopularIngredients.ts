
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PopularIngredient {
  id: string;
  name: string;
  viewCount: number;
}

interface PopularIngredientsData {
  anonymousViews: PopularIngredient[];
  registeredViews: PopularIngredient[];
  loading: boolean;
}

export const usePopularIngredients = () => {
  const [data, setData] = useState<PopularIngredientsData>({
    anonymousViews: [],
    registeredViews: [],
    loading: true
  });

  useEffect(() => {
    const fetchPopularIngredients = async () => {
      try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // Top ingredientes vistos por usuarios anónimos (últimas 24h)
        const { data: anonymousData } = await supabase
          .from('page_views')
          .select(`
            ingredient_id,
            ingredients!inner(id, name)
          `)
          .gte('viewed_at', twentyFourHoursAgo);

        // Agrupar y contar vistas de usuarios anónimos
        const anonymousViewCounts = new Map<string, { name: string; count: number }>();
        anonymousData?.forEach(view => {
          if (view.ingredient_id && view.ingredients) {
            const key = view.ingredient_id;
            const current = anonymousViewCounts.get(key) || { 
              name: (view.ingredients as any).name, 
              count: 0 
            };
            anonymousViewCounts.set(key, { ...current, count: current.count + 1 });
          }
        });

        // Top ingredientes vistos por usuarios registrados (últimas 24h)
        const { data: registeredData } = await supabase
          .from('user_history')
          .select(`
            ingredient_id,
            ingredients!inner(id, name)
          `)
          .gte('viewed_at', twentyFourHoursAgo);

        // Agrupar y contar vistas de usuarios registrados
        const registeredViewCounts = new Map<string, { name: string; count: number }>();
        registeredData?.forEach(view => {
          const key = view.ingredient_id;
          const current = registeredViewCounts.get(key) || { 
            name: (view.ingredients as any).name, 
            count: 0 
          };
          registeredViewCounts.set(key, { ...current, count: current.count + 1 });
        });

        // Convertir a arrays y ordenar
        const topAnonymous = Array.from(anonymousViewCounts.entries())
          .map(([id, data]) => ({ id, name: data.name, viewCount: data.count }))
          .sort((a, b) => b.viewCount - a.viewCount)
          .slice(0, 5);

        const topRegistered = Array.from(registeredViewCounts.entries())
          .map(([id, data]) => ({ id, name: data.name, viewCount: data.count }))
          .sort((a, b) => b.viewCount - a.viewCount)
          .slice(0, 5);

        setData({
          anonymousViews: topAnonymous,
          registeredViews: topRegistered,
          loading: false
        });

      } catch (error) {
        console.error('Error fetching popular ingredients:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchPopularIngredients();
    
    // Actualizar cada 10 minutos
    const interval = setInterval(fetchPopularIngredients, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return data;
};
