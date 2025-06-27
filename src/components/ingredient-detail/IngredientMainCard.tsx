
import { Camera, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ingredient } from "@/hooks/useIngredients";
import StructuredDescription from "./StructuredDescription";
import QualityValidator from "@/components/admin/QualityValidator";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";

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
  const { isSuperAdmin } = useSuperAdmin();

  return (
    <Card className="bg-white/90">
      <CardContent className="p-6">
        {isSuperAdmin && (
          <div className="mb-4">
            <QualityValidator ingredient={ingredient} />
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 h-64 flex-shrink-0">
            {primaryImage ? (
              <div className="relative w-full h-full">
                <img
                  src={primaryImage}
                  alt={ingredient.name}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={onGenerateImage}
                  disabled={isGeneratingImage}
                  className="absolute bottom-2 right-2 text-xs"
                >
                  {isGeneratingImage ? 'Generando...' : 'Regenerar'}
                </Button>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-4">Sin imagen generada</p>
                  <Button 
                    onClick={onGenerateImage}
                    disabled={isGeneratingImage}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isGeneratingImage ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Generando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Generar con Flux 1.1 Pro
                      </div>
                    )}
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
            
            <StructuredDescription 
              description={ingredient.description || ""}
              className="mb-4"
            />

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
