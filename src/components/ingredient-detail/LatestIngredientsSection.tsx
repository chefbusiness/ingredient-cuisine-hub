
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLatestIngredients } from "@/hooks/useLatestIngredients";
import { useResponsive } from "@/hooks/useResponsive";
import { useOptimizedIntersectionObserver } from "@/hooks/useOptimizedIntersectionObserver";
import IngredientCompactCard from "@/components/IngredientCompactCard";
import { Skeleton } from "@/components/ui/skeleton";

const LatestIngredientsSection = () => {
  const { isMobile } = useResponsive();
  const { targetRef, isIntersecting } = useOptimizedIntersectionObserver({
    rootMargin: '100px',
    triggerOnce: true
  });

  // Solo cargar datos cuando el componente es visible
  const { data: latestIngredients, isLoading } = useLatestIngredients(4, {
    enabled: isIntersecting
  });

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-2">
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
    <div ref={targetRef}>
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
            <Clock className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
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
              {latestIngredients.map((ingredient) => (
                <IngredientCompactCard key={ingredient.id} ingredient={ingredient} />
              ))}
            </div>
          ) : (
            <p className={`text-muted-foreground text-center py-4 ${isMobile ? 'text-sm' : 'text-base'}`}>
              No hay ingredientes recientes disponibles
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LatestIngredientsSection;
