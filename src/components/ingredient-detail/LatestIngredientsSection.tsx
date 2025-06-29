
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLatestIngredients } from "@/hooks/useLatestIngredients";
import { useResponsive } from "@/hooks/useResponsive";
import IngredientCompactCard from "@/components/IngredientCompactCard";

const LatestIngredientsSection = () => {
  const { data: latestIngredients, isLoading } = useLatestIngredients(4);
  const { isMobile } = useResponsive();

  if (isLoading) {
    return (
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
            <Clock className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
            Últimos Agregados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className={`bg-gray-200 rounded ${isMobile ? 'h-12' : 'h-16'}`}></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestIngredients || latestIngredients.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/90">
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
          <Clock className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
          Últimos Agregados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {latestIngredients.map((ingredient) => (
          <IngredientCompactCard key={ingredient.id} ingredient={ingredient} />
        ))}
      </CardContent>
    </Card>
  );
};

export default LatestIngredientsSection;
