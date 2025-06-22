
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSuperAdmin } from './useSuperAdmin';
import { rateLimit } from '@/utils/security';

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
      try {
        const viewedPages = JSON.parse(localStorage.getItem(VIEWED_PAGES_KEY) || '[]');
        if (Array.isArray(viewedPages)) {
          setViewedPagesCount(viewedPages.length);
          setHasReachedLimit(viewedPages.length >= PAGE_VIEW_LIMIT);
        }
      } catch (error) {
        console.error('Error parsing viewed pages from localStorage:', error);
        localStorage.removeItem(VIEWED_PAGES_KEY);
        setViewedPagesCount(0);
        setHasReachedLimit(false);
      }
    } else {
      // Clear session tracking for authenticated users (but not super admins)
      setViewedPagesCount(0);
      setHasReachedLimit(false);
    }
  }, [user, isSuperAdmin]);

  const recordPageView = async (ingredientId: string) => {
    // Validate ingredient ID format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(ingredientId)) {
      console.error('Invalid ingredient ID format');
      return false;
    }

    // Rate limiting check
    const identifier = user?.id || sessionId;
    if (!rateLimit.isAllowed(identifier, 30, 60000)) { // 30 requests per minute
      console.warn('Rate limit exceeded for page views');
      return false;
    }

    // Super admins have unlimited access
    if (isSuperAdmin) {
      try {
        await supabase.from('user_history').insert({
          user_id: user!.id,
          ingredient_id: ingredientId
        });
      } catch (error) {
        console.error('Error recording super admin page view:', error);
      }
      return true;
    }

    if (user) {
      // For authenticated users (non super admin), record in user_history
      try {
        await supabase.from('user_history').insert({
          user_id: user.id,
          ingredient_id: ingredientId
        });
      } catch (error) {
        console.error('Error recording authenticated user page view:', error);
      }
      return true;
    } else {
      // For non-authenticated users, check limit
      try {
        const viewedPages = JSON.parse(localStorage.getItem(VIEWED_PAGES_KEY) || '[]');
        
        if (!Array.isArray(viewedPages)) {
          localStorage.setItem(VIEWED_PAGES_KEY, JSON.stringify([]));
          return true;
        }
        
        if (viewedPages.length >= PAGE_VIEW_LIMIT) {
          setHasReachedLimit(true);
          return false;
        }

        // Add to viewed pages if not already viewed
        if (!viewedPages.includes(ingredientId)) {
          const updatedPages = [...viewedPages, ingredientId].slice(0, PAGE_VIEW_LIMIT + 5); // Safety limit
          localStorage.setItem(VIEWED_PAGES_KEY, JSON.stringify(updatedPages));
          setViewedPagesCount(updatedPages.length);

          // Record in database for analytics (with additional validation)
          try {
            await supabase.from('page_views').insert({
              session_id: sessionId,
              ingredient_id: ingredientId,
              user_agent: navigator.userAgent.slice(0, 255) // Limit user agent length
            });
          } catch (error) {
            console.error('Error recording anonymous page view:', error);
          }

          if (updatedPages.length >= PAGE_VIEW_LIMIT) {
            setHasReachedLimit(true);
            return false;
          }
        }
      } catch (error) {
        console.error('Error managing page view limit:', error);
        return false;
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
