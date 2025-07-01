
import { TrendingUp, Flame, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePopularIngredients } from "@/hooks/usePopularIngredients";
import { usePopularIngredientsAnalytics } from "@/hooks/usePopularIngredientsAnalytics";
import { useResponsive } from "@/hooks/useResponsive";
import { useOptimizedIntersectionObserver } from "@/hooks/useOptimizedIntersectionObserver";
import IngredientCompactCard from "@/components/IngredientCompactCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

interface PopularIngredientsSectionProps {
  limit?: number;
}

const PopularIngredientsSection = ({ limit = 5 }: PopularIngredientsSectionProps) => {
  const { isMobile } = useResponsive();
  const { targetRef, isIntersecting, hasAnimated } = useOptimizedIntersectionObserver({
    rootMargin: '100px',
    triggerOnce: true,
    animationDelay: 400
  });

  const { mostViewed, trending, loading, error } = usePopularIngredients(limit);
  const { trackSectionView, trackTabSwitch } = usePopularIngredientsAnalytics();

  // Trackear vista de la sección cuando se hace visible
  useEffect(() => {
    if (isIntersecting && hasAnimated) {
      trackSectionView();
    }
  }, [isIntersecting, hasAnimated, trackSectionView]);

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(limit)].map((_, i) => (
        <div key={i} className="flex gap-2 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
          <Skeleton className={`flex-shrink-0 rounded ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`} />
          <div className="flex-1 space-y-1">
            <Skeleton className={`h-3 w-full ${isMobile ? 'max-w-24' : 'max-w-32'}`} />
            <Skeleton className={`h-2 w-full ${isMobile ? 'max-w-20' : 'max-w-28'}`} />
            <div className="flex items-center justify-between">
              <Skeleton className="h-2 w-16" />
              <Skeleton className="h-2 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const formatViewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const renderIngredientList = (ingredients: any[], type: 'viewed' | 'trending') => {
    if (!ingredients || ingredients.length === 0) {
      return (
        <p className={`text-muted-foreground text-center py-4 transition-colors duration-200 ${isMobile ? 'text-sm' : 'text-base'}`}>
          {type === 'viewed' ? 'No hay datos de visualizaciones' : 'No hay ingredientes trending'}
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {ingredients.map((ingredient, index) => (
          <div
            key={ingredient.id}
            className={`relative transition-all duration-500 ease-out ${
              hasAnimated 
                ? 'opacity-100 transform translate-x-0' 
                : 'opacity-0 transform translate-x-4'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <IngredientCompactCard 
              ingredient={ingredient} 
              animationDelay={index * 75}
            />
            
            {/* Badge de estadísticas mejorado */}
            <div className={`absolute top-1 right-1 flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all duration-300 backdrop-blur-sm ${
              type === 'viewed' 
                ? 'bg-blue-500/90 hover:bg-blue-600/95 text-white shadow-lg' 
                : 'bg-orange-500/90 hover:bg-orange-600/95 text-white shadow-lg'
            }`}>
              {type === 'viewed' ? (
                <>
                  <Eye className="h-2.5 w-2.5" />
                  <span className="font-medium">{formatViewCount(ingredient.viewCount)}</span>
                </>
              ) : (
                <>
                  <Flame className="h-2.5 w-2.5" />
                  <span className="font-medium">{ingredient.popularity}%</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (error) {
    return null; // No mostrar la sección si hay error
  }

  return (
    <div 
      ref={targetRef}
      className={`transition-all duration-700 ease-out ${
        hasAnimated 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-4'
      }`}
    >
      <Card className="bg-white/90 border border-border/50 hover:border-border transition-all duration-300 hover:shadow-md">
        <CardHeader className="transition-colors duration-200 hover:bg-muted/20">
          <CardTitle className={`flex items-center gap-2 transition-colors duration-200 ${isMobile ? 'text-base' : 'text-lg'}`}>
            <TrendingUp className={`transition-transform duration-300 hover:rotate-12 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            Más Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isIntersecting ? (
            <LoadingSkeleton />
          ) : loading ? (
            <LoadingSkeleton />
          ) : (
            <Tabs 
              defaultValue="trending" 
              className="w-full"
              onValueChange={(value) => trackTabSwitch(value as 'trending' | 'most_viewed')}
            >
              <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'h-8' : 'h-10'}`}>
                <TabsTrigger 
                  value="trending" 
                  className={`flex items-center gap-2 transition-all duration-200 ${isMobile ? 'text-xs px-2' : 'text-sm'}`}
                >
                  <Flame className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  {isMobile ? 'Trend' : 'Trending'}
                </TabsTrigger>
                <TabsTrigger 
                  value="viewed" 
                  className={`flex items-center gap-2 transition-all duration-200 ${isMobile ? 'text-xs px-2' : 'text-sm'}`}
                >
                  <Eye className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  {isMobile ? 'Vistos' : 'Más Vistos'}
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-4">
                <TabsContent value="trending" className="mt-0">
                  {renderIngredientList(trending, 'trending')}
                </TabsContent>
                
                <TabsContent value="viewed" className="mt-0">
                  {renderIngredientList(mostViewed, 'viewed')}
                </TabsContent>
              </div>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PopularIngredientsSection;
