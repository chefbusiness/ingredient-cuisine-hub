
import { Tags } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRelatedIngredients } from "@/hooks/useRelatedIngredients";
import { useResponsive } from "@/hooks/useResponsive";
import IngredientCompactCard from "@/components/IngredientCompactCard";

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
  const { data: relatedIngredients, isLoading } = useRelatedIngredients(categoryId, currentIngredientId, 8);
  const { isMobile, isTablet } = useResponsive();

  if (isLoading) {
    return (
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            <Tags className={isMobile ? 'h-5 w-5' : 'h-6 w-6'} />
            {categoryName ? `Más ${categoryName}` : 'Ingredientes Relacionados'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${
            isMobile 
              ? 'grid-cols-1' 
              : isTablet 
                ? 'grid-cols-2' 
                : 'grid-cols-4'
          }`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-24"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!relatedIngredients || relatedIngredients.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/90">
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
          <Tags className={isMobile ? 'h-5 w-5' : 'h-6 w-6'} />
          {categoryName ? `Más ${categoryName}` : 'Ingredientes Relacionados'}
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default RelatedIngredientsSectionBelowTabs;
