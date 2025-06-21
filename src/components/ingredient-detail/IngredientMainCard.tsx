
import { Camera, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ingredient } from "@/hooks/useIngredients";

interface IngredientMainCardProps {
  ingredient: Ingredient;
  primaryImage?: string;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
}

const IngredientMainCard = ({ 
  ingredient, 
  primaryImage, 
  onGenerateImage, 
  isGeneratingImage 
}: IngredientMainCardProps) => {
  return (
    <Card className="bg-white/90">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 h-64 flex-shrink-0">
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={ingredient.name}
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-lg shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-3">Sin imagen</p>
                  <Button 
                    size="sm" 
                    onClick={onGenerateImage}
                    disabled={isGeneratingImage}
                  >
                    {isGeneratingImage ? 'Generando...' : 'Generar imagen'}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {ingredient.name}
                </h1>
                <p className="text-lg text-gray-600 mb-3">{ingredient.name_en}</p>
                <Badge variant="outline" className="mb-4">
                  {ingredient.categories?.name || 'Sin categoría'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-bold text-green-600">{ingredient.popularity}%</span>
                <span className="text-sm text-green-600">popular</span>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              {ingredient.description}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {ingredient.temporada && (
                <div>
                  <span className="text-gray-600">Temporada:</span>
                  <p className="font-medium">{ingredient.temporada}</p>
                </div>
              )}
              {ingredient.origen && (
                <div>
                  <span className="text-gray-600">Origen:</span>
                  <p className="font-medium">{ingredient.origen}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IngredientMainCard;
