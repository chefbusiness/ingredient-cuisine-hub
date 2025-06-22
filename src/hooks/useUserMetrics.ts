
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserMetrics {
  totalRegisteredUsers: number;
  anonymousSessionsLast24h: number;
  usersNearLimit: number;
  conversionRate: number;
  averageViewsBeforeRegistration: number;
  loading: boolean;
}

export const useUserMetrics = () => {
  const [metrics, setMetrics] = useState<UserMetrics>({
    totalRegisteredUsers: 0,
    anonymousSessionsLast24h: 0,
    usersNearLimit: 0,
    conversionRate: 0,
    averageViewsBeforeRegistration: 0,
    loading: true
  });

  useEffect(() => {
    const fetchUserMetrics = async () => {
      try {
        // Total usuarios registrados
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Sesiones anónimas únicas en las últimas 24h
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: anonymousSessions } = await supabase
          .from('page_views')
          .select('session_id')
          .gte('viewed_at', twentyFourHoursAgo);

        const uniqueAnonymousSessions = new Set(
          anonymousSessions?.map(pv => pv.session_id) || []
        ).size;

        // Calcular usuarios cerca del límite (15-19 vistas)
        // Esto requiere agrupar por session_id y contar vistas
        const { data: sessionViews } = await supabase
          .from('page_views')
          .select('session_id, ingredient_id')
          .gte('viewed_at', twentyFourHoursAgo);

        const sessionViewCounts = new Map<string, number>();
        sessionViews?.forEach(view => {
          const count = sessionViewCounts.get(view.session_id) || 0;
          sessionViewCounts.set(view.session_id, count + 1);
        });

        const usersNearLimit = Array.from(sessionViewCounts.values())
          .filter(count => count >= 15 && count < 20).length;

        // Calcular tasa de conversión aproximada
        // (usuarios registrados hoy / sesiones anónimas únicas) * 100
        const { count: usersRegisteredToday } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date().toISOString().split('T')[0]);

        const conversionRate = uniqueAnonymousSessions > 0 
          ? ((usersRegisteredToday || 0) / uniqueAnonymousSessions) * 100 
          : 0;

        setMetrics({
          totalRegisteredUsers: totalUsers || 0,
          anonymousSessionsLast24h: uniqueAnonymousSessions,
          usersNearLimit,
          conversionRate: Math.round(conversionRate * 100) / 100,
          averageViewsBeforeRegistration: 16.5, // Valor aproximado por ahora
          loading: false
        });

      } catch (error) {
        console.error('Error fetching user metrics:', error);
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    };

    fetchUserMetrics();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchUserMetrics, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return metrics;
};
