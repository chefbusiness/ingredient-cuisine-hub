
import { TrendingUp } from "lucide-react";
import { usePopularIngredients } from "@/hooks/usePopularIngredients";
import { usePopularIngredientsAnalytics } from "@/hooks/usePopularIngredientsAnalytics";
import { useResponsive } from "@/hooks/useResponsive";
import { useOptimizedIntersectionObserver } from "@/hooks/useOptimizedIntersectionObserver";
import { useEffect } from "react";
import PopularIngredientsSkeleton from "./popular-ingredients/PopularIngredientsSkeleton";
import PopularIngredientsTabsContent from "./popular-ingredients/PopularIngredientsTabsContent";

const PopularIngredientsHomepageSection = () => {
  const { isMobile, isTablet } = useResponsive();
  const { targetRef, isIntersecting, hasAnimated } = useOptimizedIntersectionObserver({
    rootMargin: '100px',
    triggerOnce: true,
    animationDelay: 200
  });

  // Aumentamos el límite para la homepage
  const limit = isMobile ? 4 : isTablet ? 6 : 8;
  const { mostViewed, trending, loading, error } = usePopularIngredients(limit);
  const { trackSectionView, trackTabSwitch, trackPopularIngredientClick } = usePopularIngredientsAnalytics();

  // Trackear vista de la sección cuando se hace visible
  useEffect(() => {
    if (isIntersecting && hasAnimated) {
      trackSectionView();
    }
  }, [isIntersecting, hasAnimated, trackSectionView]);

  if (error) {
    return null; // No mostrar la sección si hay error
  }

  return (
    <section 
      ref={targetRef}
      className={`${isMobile ? 'py-8' : 'py-12'} bg-background`}
    >
      <div className={`container mx-auto ${isMobile ? 'px-3' : 'px-4'}`}>
        <div 
          className={`transition-all duration-700 ease-out ${
            hasAnimated 
              ? 'opacity-100 transform translate-y-0' 
              : 'opacity-0 transform translate-y-4'
          }`}
        >
          {/* Header */}
          <div className={`text-center ${isMobile ? 'mb-6' : 'mb-8'}`}>
            <h3 className={`font-medium text-foreground mb-2 flex items-center justify-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              <TrendingUp className={`transition-transform duration-300 hover:rotate-12 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              Más Populares
            </h3>
            <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Descubre los ingredientes más vistos y trending del momento
            </p>
          </div>

          {/* Tabs Content */}
          {!isIntersecting ? (
            <PopularIngredientsSkeleton limit={limit} />
          ) : loading ? (
            <PopularIngredientsSkeleton limit={limit} />
          ) : (
            <PopularIngredientsTabsContent
              mostViewed={mostViewed}
              trending={trending}
              hasAnimated={hasAnimated}
              onTabSwitch={trackTabSwitch}
              onIngredientClick={trackPopularIngredientClick}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularIngredientsHomepageSection;
