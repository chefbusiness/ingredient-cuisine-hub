
import { Heart, Upload, DollarSign, ChefHat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Ingredient } from "@/hooks/useIngredients";
import { useResponsive } from "@/hooks/useResponsive";
import AdBanner from "@/components/AdBanner";
import LatestIngredientsSection from "./LatestIngredientsSection";
import RelatedIngredientsSection from "./RelatedIngredientsSection";

interface IngredientSidebarProps {
  ingredient: Ingredient;
  primaryImage?: string;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  isToggleFavoriteLoading: boolean;
  onNavigateToTab: (tabName: string) => void;
}

const IngredientSidebar = ({ 
  ingredient, 
  primaryImage, 
  onGenerateImage, 
  isGeneratingImage,
  onToggleFavorite,
  isFavorite,
  isToggleFavoriteLoading,
  onNavigateToTab
}: IngredientSidebarProps) => {
  const { isMobile } = useResponsive();

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className={isMobile ? 'text-base' : 'text-lg'}>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            className={`w-full transition-colors ${isMobile ? 'h-8 text-sm' : ''} ${
              isFavorite 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
            onClick={onToggleFavorite}
            disabled={isToggleFavoriteLoading}
          >
            <Heart className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2 ${isFavorite ? 'fill-current' : ''}`} />
            {isToggleFavoriteLoading 
              ? 'Actualizando...' 
              : isFavorite 
                ? 'Eliminar de Favoritos' 
                : 'Añadir a Favoritos'
            }
          </Button>
          
          <Button 
            variant="outline" 
            className={`w-full ${isMobile ? 'h-8 text-sm' : ''}`}
            onClick={() => onNavigateToTab('precios')}
          >
            <DollarSign className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
            Comparar Precios
          </Button>
          
          <Button 
            variant="outline" 
            className={`w-full ${isMobile ? 'h-8 text-sm' : ''}`}
            onClick={() => onNavigateToTab('usos')}
          >
            <ChefHat className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
            Ver Recetas
          </Button>
          
          {!primaryImage && (
            <Button 
              variant="outline" 
              className={`w-full ${isMobile ? 'h-8 text-sm' : ''}`}
              onClick={onGenerateImage}
              disabled={isGeneratingImage}
            >
              <Upload className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
              {isGeneratingImage ? 'Generando imagen...' : 'Generar imagen AI'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className={isMobile ? 'text-base' : 'text-lg'}>Datos Clave</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className={`p-3 bg-green-50 rounded-lg ${isMobile ? 'p-2' : ''}`}>
              <p className={`font-bold text-green-600 ${isMobile ? 'text-lg' : 'text-2xl'}`}>{ingredient.popularity}%</p>
              <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Popularidad</p>
            </div>
            <div className={`p-3 bg-blue-50 rounded-lg ${isMobile ? 'p-2' : ''}`}>
              <p className={`font-bold text-blue-600 ${isMobile ? 'text-lg' : 'text-2xl'}`}>{ingredient.rendimiento.toFixed(1)}%</p>
              <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Rendimiento</p>
            </div>
          </div>
          <Separator />
          <div className={`space-y-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {ingredient.ingredient_prices && ingredient.ingredient_prices.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Precio promedio:</span>
                <span className="font-medium">
                  {ingredient.ingredient_prices[0].countries?.currency_symbol || '€'}
                  {ingredient.ingredient_prices[0].price.toFixed(2)}/{ingredient.ingredient_prices[0].unit}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Categoría:</span>
              <span className="font-medium">{ingredient.categories?.name || 'Sin categoría'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latest Ingredients */}
      <LatestIngredientsSection />

      {/* Related Ingredients */}
      {ingredient.category_id && (
        <RelatedIngredientsSection 
          categoryId={ingredient.category_id}
          currentIngredientId={ingredient.id}
          categoryName={ingredient.categories?.name}
        />
      )}

      {/* AI Chef Pro Suite Banner */}
      <AdBanner
        title="AI Chef Pro Suite"
        description="Suite de Herramientas y Aplicaciones de IA para Chefs y profesionales de la hostelería."
        url="https://aichef.pro/"
        ctaText="Descubrir Herramientas"
        variant="secondary"
        size="compact"
      />
    </div>
  );
};

export default IngredientSidebar;
