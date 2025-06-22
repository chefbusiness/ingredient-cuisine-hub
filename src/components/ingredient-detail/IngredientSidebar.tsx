
import { Heart, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Ingredient } from "@/hooks/useIngredients";

interface IngredientSidebarProps {
  ingredient: Ingredient;
  primaryImage?: string;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
}

const IngredientSidebar = ({ 
  ingredient, 
  primaryImage, 
  onGenerateImage, 
  isGeneratingImage 
}: IngredientSidebarProps) => {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <Heart className="h-4 w-4 mr-2" />
            Añadir a Favoritos
          </Button>
          <Button variant="outline" className="w-full">
            Comparar Precios
          </Button>
          <Button variant="outline" className="w-full">
            Ver Recetas
          </Button>
          {!primaryImage && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onGenerateImage}
              disabled={isGeneratingImage}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isGeneratingImage ? 'Generando imagen...' : 'Generar imagen AI'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className="text-lg">Datos Clave</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{ingredient.popularity}%</p>
              <p className="text-sm text-gray-600">Popularidad</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{ingredient.rendimiento.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Rendimiento</p>
            </div>
          </div>
          <Separator />
          <div className="space-y-2 text-sm">
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
    </div>
  );
};

export default IngredientSidebar;
