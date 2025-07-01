
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
  const { targetRef, isIntersecting, hasAnimated } = useOptimizedIntersectionObserver({
    rootMargin: '150px',
    triggerOnce: true,
    animationDelay: 300
  });

  // Aumentar límite de 8 a 9 ingredientes para layout 3x3
  const { data: relatedIngredients, isLoading } = useRelatedIngredients(
    categoryId, 
    currentIngredientId, 
    9,
    { enabled: isIntersecting }
  );

  const LoadingSkeleton = () => (
    <div className={`grid gap-4 ${
      isMobile 
        ? 'grid-cols-1' 
        : isTablet 
          ? 'grid-cols-2' 
          : 'grid-cols-3'
    }`}>
      {[...Array(9)].map((_, i) => (
        <div 
          key={i} 
          className="animate-pulse"
          style={{ animationDelay: `${i * 75}ms` }}
        >
          <Skeleton className="bg-gray-200 rounded-lg h-24 transition-all duration-300 hover:bg-gray-300" />
        </div>
      ))}
    </div>
  );

  return (
    <div 
      ref={targetRef}
      className={`transition-all duration-800 ease-out ${
        hasAnimated 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-6'
      }`}
    >
      <Card className="bg-white/90 border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
        <CardHeader className="transition-colors duration-200 hover:bg-muted/20">
          <CardTitle className={`flex items-center gap-2 transition-colors duration-200 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            <Tags className={`transition-transform duration-300 hover:rotate-12 ${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
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
                  : 'grid-cols-3'
            }`}>
              {relatedIngredients.map((ingredient, index) => (
                <div
                  key={ingredient.id}
                  className={`transition-all duration-600 ease-out ${
                    hasAnimated 
                      ? 'opacity-100 transform translate-y-0 scale-100' 
                      : 'opacity-0 transform translate-y-4 scale-95'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <IngredientCompactCard 
                    ingredient={ingredient} 
                    animationDelay={index * 75}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatedIngredientsSectionBelowTabs;
