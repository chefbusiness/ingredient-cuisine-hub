
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSuperAdmin } from './useSuperAdmin';

const PAGE_VIEW_LIMIT = 20;
const SESSION_STORAGE_KEY = 'ingredients_session_id';
const VIEWED_PAGES_KEY = 'viewed_ingredient_pages';

export const usePageViewLimit = () => {
  const { user } = useAuth();
  const { isSuperAdmin, loading: superAdminLoading } = useSuperAdmin();
  const [viewedPagesCount, setViewedPagesCount] = useState(0);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Super admins have unlimited access
    if (isSuperAdmin) {
      setViewedPagesCount(0);
      setHasReachedLimit(false);
      return;
    }

    // Generate or get session ID for non-authenticated users
    if (!user) {
      let storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!storedSessionId) {
        storedSessionId = crypto.randomUUID();
        localStorage.setItem(SESSION_STORAGE_KEY, storedSessionId);
      }
      setSessionId(storedSessionId);

      // Get viewed pages count from localStorage for non-authenticated users
      const viewedPages = JSON.parse(localStorage.getItem(VIEWED_PAGES_KEY) || '[]');
      setViewedPagesCount(viewedPages.length);
      setHasReachedLimit(viewedPages.length >= PAGE_VIEW_LIMIT);
    } else {
      // Clear session tracking for authenticated users (but not super admins)
      setViewedPagesCount(0);
      setHasReachedLimit(false);
    }
  }, [user, isSuperAdmin]);

  const recordPageView = async (ingredientId: string) => {
    // Super admins have unlimited access
    if (isSuperAdmin) {
      await supabase.from('user_history').insert({
        user_id: user!.id,
        ingredient_id: ingredientId
      });
      return true;
    }

    if (user) {
      // For authenticated users (non super admin), record in user_history
      await supabase.from('user_history').insert({
        user_id: user.id,
        ingredient_id: ingredientId
      });
      return true;
    } else {
      // For non-authenticated users, check limit
      const viewedPages = JSON.parse(localStorage.getItem(VIEWED_PAGES_KEY) || '[]');
      
      if (viewedPages.length >= PAGE_VIEW_LIMIT) {
        setHasReachedLimit(true);
        return false;
      }

      // Add to viewed pages if not already viewed
      if (!viewedPages.includes(ingredientId)) {
        const updatedPages = [...viewedPages, ingredientId];
        localStorage.setItem(VIEWED_PAGES_KEY, JSON.stringify(updatedPages));
        setViewedPagesCount(updatedPages.length);

        // Record in database for analytics
        await supabase.from('page_views').insert({
          session_id: sessionId,
          ingredient_id: ingredientId,
          user_agent: navigator.userAgent
        });

        if (updatedPages.length >= PAGE_VIEW_LIMIT) {
          setHasReachedLimit(true);
          return false;
        }
      }
      return true;
    }
  };

  const getRemainingViews = () => {
    if (user || isSuperAdmin) return null; // Unlimited for authenticated users and super admins
    return Math.max(0, PAGE_VIEW_LIMIT - viewedPagesCount);
  };

  return {
    viewedPagesCount,
    hasReachedLimit: hasReachedLimit && !isSuperAdmin, // Never reached limit for super admins
    recordPageView,
    getRemainingViews,
    pageViewLimit: PAGE_VIEW_LIMIT,
    isSuperAdmin
  };
};
