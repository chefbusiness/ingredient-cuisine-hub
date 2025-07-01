
import { Tags } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRelatedIngredients } from "@/hooks/useRelatedIngredients";
import { useResponsive } from "@/hooks/useResponsive";
import { useOptimizedIntersectionObserver } from "@/hooks/useOptimizedIntersectionObserver";
import IngredientCompactCard from "@/components/IngredientCompactCard";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedIngredientsSectionBelowTabsProps {
  categoryId: string;
  currentIngredientId: string;
  categoryName?: string;
}

const RelatedIngredientsSectionBelowTabs = ({ 
  categoryId, 
  currentIngredientId, 
  categoryName 
}: RelatedIngredientsSectionBelowTabsProps) => {
  const { isMobile, isTablet } = useResponsive();
  const { targetRef, isIntersecting } = useOptimizedIntersectionObserver({
    rootMargin: '150px',
    triggerOnce: true
  });

  // Solo cargar datos cuando el componente es visible
  const { data: relatedIngredients, isLoading } = useRelatedIngredients(
    categoryId, 
    currentIngredientId, 
    8,
    { enabled: isIntersecting }
  );

  const LoadingSkeleton = () => (
    <div className={`grid gap-4 ${
      isMobile 
        ? 'grid-cols-1' 
        : isTablet 
          ? 'grid-cols-2' 
          : 'grid-cols-4'
    }`}>
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <Skeleton className="bg-gray-200 rounded-lg h-24" />
        </div>
      ))}
    </div>
  );

  return (
    <div ref={targetRef}>
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            <Tags className={isMobile ? 'h-5 w-5' : 'h-6 w-6'} />
            {categoryName ? `Más ${categoryName}` : 'Ingredientes Relacionados'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isIntersecting ? (
            <LoadingSkeleton />
          ) : isLoading ? (
            <LoadingSkeleton />
          ) : relatedIngredients && relatedIngredients.length > 0 ? (
            <div className={`grid gap-4 ${
              isMobile 
                ? 'grid-cols-1' 
                : isTablet 
                  ? 'grid-cols-2' 
                  : 'grid-cols-4'
            }`}>
              {relatedIngredients.map((ingredient) => (
                <IngredientCompactCard key={ingredient.id} ingredient={ingredient} />
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatedIngredientsSectionBelowTabs;
