
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLatestIngredients } from "@/hooks/useLatestIngredients";
import { useResponsive } from "@/hooks/useResponsive";
import { useOptimizedIntersectionObserver } from "@/hooks/useOptimizedIntersectionObserver";
import IngredientCompactCard from "@/components/IngredientCompactCard";
import { Skeleton } from "@/components/ui/skeleton";

const LatestIngredientsSection = () => {
  const { isMobile } = useResponsive();
  const { targetRef, isIntersecting, hasAnimated } = useOptimizedIntersectionObserver({
    rootMargin: '100px',
    triggerOnce: true,
    animationDelay: 200
  });

  // Solo cargar datos cuando el componente es visible
  const { data: latestIngredients, isLoading } = useLatestIngredients(4, {
    enabled: isIntersecting
  });

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-2 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
          <Skeleton className={`flex-shrink-0 rounded ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`} />
          <div className="flex-1 space-y-1">
            <Skeleton className={`h-3 w-full ${isMobile ? 'max-w-24' : 'max-w-32'}`} />
            <Skeleton className={`h-2 w-full ${isMobile ? 'max-w-20' : 'max-w-28'}`} />
            <Skeleton className="h-2 w-16" />
          </div>
        </div>
      ))}
    </div>
  );

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
            <Clock className={`transition-transform duration-300 hover:rotate-12 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            Últimos Ingredientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isIntersecting ? (
            <LoadingSkeleton />
          ) : isLoading ? (
            <LoadingSkeleton />
          ) : latestIngredients && latestIngredients.length > 0 ? (
            <div className="space-y-3">
              {latestIngredients.map((ingredient, index) => (
                <div
                  key={ingredient.id}
                  className={`transition-all duration-500 ease-out ${
                    hasAnimated 
                      ? 'opacity-100 transform translate-x-0' 
                      : 'opacity-0 transform translate-x-4'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <IngredientCompactCard 
                    ingredient={ingredient} 
                    animationDelay={index * 50}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-muted-foreground text-center py-4 transition-colors duration-200 ${isMobile ? 'text-sm' : 'text-base'}`}>
              No hay ingredientes recientes disponibles
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LatestIngredientsSection;
