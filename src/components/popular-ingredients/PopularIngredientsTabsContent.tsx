
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Eye } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";
import PopularIngredientCard from "./PopularIngredientCard";

interface PopularIngredientsTabsContentProps {
  mostViewed: any[];
  trending: any[];
  hasAnimated: boolean;
  onTabSwitch: (value: 'trending' | 'most_viewed') => void;
  onIngredientClick: (ingredientId: string, type: 'most_viewed' | 'trending') => void;
}

const PopularIngredientsTabsContent = ({
  mostViewed,
  trending,
  hasAnimated,
  onTabSwitch,
  onIngredientClick
}: PopularIngredientsTabsContentProps) => {
  const { isMobile, isTablet } = useResponsive();

  const renderIngredientGrid = (ingredients: any[], type: 'viewed' | 'trending') => {
    if (!ingredients || ingredients.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {type === 'viewed' ? 'No hay datos de visualizaciones' : 'No hay ingredientes trending'}
          </p>
        </div>
      );
    }

    const gridClasses = isMobile 
      ? "grid grid-cols-2 gap-3" 
      : isTablet 
      ? "grid grid-cols-3 gap-4" 
      : "grid grid-cols-4 gap-4";

    return (
      <div className={gridClasses}>
        {ingredients.map((ingredient, index) => (
          <PopularIngredientCard
            key={ingredient.id}
            ingredient={ingredient}
            type={type}
            index={index}
            hasAnimated={hasAnimated}
            onIngredientClick={onIngredientClick}
          />
        ))}
      </div>
    );
  };

  return (
    <Tabs 
      defaultValue="trending" 
      className="w-full"
      onValueChange={(value) => onTabSwitch(value as 'trending' | 'most_viewed')}
    >
      <div className="flex justify-center mb-6">
        <TabsList className={`${isMobile ? 'h-8' : 'h-10'}`}>
          <TabsTrigger 
            value="trending" 
            className={`flex items-center gap-2 transition-all duration-200 ${isMobile ? 'text-xs px-3' : 'text-sm px-4'}`}
          >
            <Flame className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            {isMobile ? 'Trending' : 'Trending'}
          </TabsTrigger>
          <TabsTrigger 
            value="viewed" 
            className={`flex items-center gap-2 transition-all duration-200 ${isMobile ? 'text-xs px-3' : 'text-sm px-4'}`}
          >
            <Eye className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            {isMobile ? 'Vistos' : 'Más Vistos'}
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="trending" className="mt-0">
        {renderIngredientGrid(trending, 'trending')}
      </TabsContent>
      
      <TabsContent value="viewed" className="mt-0">
        {renderIngredientGrid(mostViewed, 'viewed')}
      </TabsContent>
    </Tabs>
  );
};

export default PopularIngredientsTabsContent;
