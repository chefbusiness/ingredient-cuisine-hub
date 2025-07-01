
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  action: 'click_popular_ingredient' | 'view_popular_section' | 'switch_popular_tab';
  section: 'trending' | 'most_viewed' | 'popular_section';
  ingredient_id?: string;
  additional_data?: Record<string, any>;
}

export const usePopularIngredientsAnalytics = () => {
  
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      // Solo trackear si tenemos un usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Para usuarios registrados, usar user_history si es click en ingrediente
        if (event.action === 'click_popular_ingredient' && event.ingredient_id) {
          await supabase
            .from('user_history')
            .insert({
              user_id: user.id,
              ingredient_id: event.ingredient_id,
              viewed_at: new Date().toISOString()
            });
        }
      } else {
        // Para usuarios anónimos, usar page_views
        if (event.action === 'click_popular_ingredient' && event.ingredient_id) {
          // Generar un session_id único basado en timestamp y random
          const sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          await supabase
            .from('page_views')
            .insert({
              session_id: sessionId,
              ingredient_id: event.ingredient_id,
              viewed_at: new Date().toISOString()
            });
        }
      }

      // Log del evento para debugging (solo en desarrollo)
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics Event:', event);
      }

    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }, []);

  const trackPopularIngredientClick = useCallback((ingredientId: string, section: 'trending' | 'most_viewed') => {
    trackEvent({
      action: 'click_popular_ingredient',
      section,
      ingredient_id: ingredientId
    });
  }, [trackEvent]);

  const trackSectionView = useCallback(() => {
    trackEvent({
      action: 'view_popular_section',
      section: 'popular_section'
    });
  }, [trackEvent]);

  const trackTabSwitch = useCallback((tabName: 'trending' | 'most_viewed') => {
    trackEvent({
      action: 'switch_popular_tab',
      section: tabName
    });
  }, [trackEvent]);

  return {
    trackPopularIngredientClick,
    trackSectionView,
    trackTabSwitch
  };
};
