
import { ChefHat, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Recipe {
  name: string;
  type: string;
  difficulty: string;
  time: string;
}

interface RecipesListProps {
  recipes: Recipe[];
}

const getRecipeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'entrante': return '🥗';
    case 'principal': return '🍽️';
    case 'guarnición': return '🥕';
    case 'postre': return '🍰';
    case 'salsa': return '🥄';
    case 'especialidad': return '⭐';
    default: return '🍴';
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'fácil': return 'bg-green-100 text-green-800';
    case 'medio': return 'bg-yellow-100 text-yellow-800';
    case 'difícil': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const RecipesList = ({ recipes }: RecipesListProps) => {
  return (
    <Card className="bg-white/90">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ChefHat className="h-5 w-5" />
          <span>Recetas Destacadas ({recipes.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe, index) => (
            <div key={index} className="p-4 border border-green-200 rounded-lg bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-gray-800 text-sm leading-tight flex-1">
                  {recipe.name}
                </h4>
                <span className="text-lg ml-2 flex-shrink-0">
                  {getRecipeIcon(recipe.type)}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs capitalize">
                    {recipe.type}
                  </Badge>
                  <Badge className={`text-xs ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-1 text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">{recipe.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {recipes.length === 6 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 text-center flex items-center justify-center gap-2">
              <ChefHat className="h-4 w-4" />
              Colección completa de 6 recetas profesionales para este ingrediente
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecipesList;
