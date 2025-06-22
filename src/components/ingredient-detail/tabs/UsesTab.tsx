
import { ChefHat, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ingredient } from "@/hooks/useIngredients";
import RecipesList from "./RecipesList";

interface UsesTabProps {
  ingredient: Ingredient;
}

const UsesTab = ({ ingredient }: UsesTabProps) => {
  return (
    <div className="space-y-4">
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChefHat className="h-5 w-5" />
            <span>Usos en Cocina Profesional</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ingredient.ingredient_uses && ingredient.ingredient_uses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ingredient.ingredient_uses.map((useItem, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <Star className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{useItem.use_description}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay usos registrados para este ingrediente</p>
          )}
        </CardContent>
      </Card>

      {ingredient.ingredient_recipes && ingredient.ingredient_recipes.length > 0 && (
        <RecipesList recipes={ingredient.ingredient_recipes} />
      )}
    </div>
  );
};

export default UsesTab;
