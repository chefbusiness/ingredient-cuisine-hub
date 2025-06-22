
import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ingredient } from "@/hooks/useIngredients";

interface TechnicalTabProps {
  ingredient: Ingredient;
}

const TechnicalTab = ({ ingredient }: TechnicalTabProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Merma y Rendimiento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-gray-700">Merma</span>
                <span className="text-2xl font-bold text-red-600">{ingredient.merma.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Rendimiento</span>
                <span className="text-2xl font-bold text-green-600">{ingredient.rendimiento.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {ingredient.nutritional_info && ingredient.nutritional_info.length > 0 && (
          <Card className="bg-white/90">
            <CardHeader>
              <CardTitle>Información Nutricional (por 100g)</CardTitle>
            </CardHeader>
            <CardContent>
              {ingredient.nutritional_info.map((nutrition, index) => (
                <div key={index} className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Calorías</span>
                    <span className="font-medium">{nutrition.calories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Proteínas</span>
                    <span className="font-medium">{nutrition.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbohidratos</span>
                    <span className="font-medium">{nutrition.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grasas</span>
                    <span className="font-medium">{nutrition.fat}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fibra</span>
                    <span className="font-medium">{nutrition.fiber}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vitamina C</span>
                    <span className="font-medium">{nutrition.vitamin_c}mg</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {ingredient.ingredient_varieties && ingredient.ingredient_varieties.length > 0 && (
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Variedades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ingredient.ingredient_varieties.map((variety, index) => (
                <Badge key={index} variant="secondary">
                  {variety.variety_name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TechnicalTab;
