
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useResponsive } from "@/hooks/useResponsive";

interface PopularIngredientsSkeletonProps {
  limit: number;
}

const PopularIngredientsSkeleton = ({ limit }: PopularIngredientsSkeletonProps) => {
  const { isMobile, isTablet } = useResponsive();
  
  const gridClasses = isMobile 
    ? "grid grid-cols-2 gap-3" 
    : isTablet 
    ? "grid grid-cols-3 gap-4" 
    : "grid grid-cols-4 gap-4";

  return (
    <div className={gridClasses}>
      {[...Array(limit)].map((_, i) => (
        <div key={i} className="animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
          <Card className="border border-border bg-background">
            <CardContent className={isMobile ? 'p-3' : 'p-4'}>
              <div className="space-y-3">
                <Skeleton className={`w-full rounded ${isMobile ? 'h-20' : 'h-24'}`} />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default PopularIngredientsSkeleton;
