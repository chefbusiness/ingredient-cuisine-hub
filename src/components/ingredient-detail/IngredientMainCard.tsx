
import { Camera, TrendingUp, Zap, Sparkles, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ingredient } from "@/hooks/useIngredients";
import StructuredDescription from "./StructuredDescription";
import AIChefProBanner from "@/components/AIChefProBanner";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";

interface IngredientMainCardProps {
  ingredient: Ingredient;
  primaryImage?: string;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  isToggleFavoriteLoading?: boolean;
}

const IngredientMainCard = ({ 
  ingredient, 
  primaryImage, 
  onGenerateImage, 
  isGeneratingImage,
  onToggleFavorite,
  isFavorite,
  isToggleFavoriteLoading
}: IngredientMainCardProps) => {
  const { isSuperAdmin } = useSuperAdmin();

  const getImageBadge = () => {
    const badgeClass = "absolute top-1.5 left-1.5 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1";
    
    if (ingredient.real_image_url) {
      return (
        <div className={`${badgeClass} bg-green-500/90`}>
          <Camera className="h-2.5 w-2.5" />
          <span>Real</span>
        </div>
      );
    } else if (ingredient.image_url) {
      return (
        <div className={`${badgeClass} bg-blue-500/90`}>
          <Sparkles className="h-2.5 w-2.5" />
          <span>IA</span>
        </div>
      );
    } else {
      return (
        <div className={`${badgeClass} bg-orange-500/90`}>
          <Camera className="h-2.5 w-2.5" />
          <span>Sin imagen</span>
        </div>
      );
    }
  };

  return (
    <Card className="bg-white/90">
      <CardContent className="p-6">
        {/* AI Chef Pro Banner - visible for all users */}
        <div className="mb-4">
          <AIChefProBanner />
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 h-64 flex-shrink-0 relative">
            {primaryImage ? (
              <div className="relative w-full h-full">
                <img
                  src={primaryImage}
                  alt={ingredient.name}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
                
                {/* Image type badge */}
                {getImageBadge()}
                
                {/* Popularity badge */}
                <div className="absolute top-1.5 right-12 flex items-center space-x-1 bg-background/90 rounded-md px-1.5 py-0.5 text-xs">
                  <TrendingUp className="h-2.5 w-2.5 text-primary" />
                  <span className="font-medium text-foreground">
                    {ingredient.popularity}%
                  </span>
                </div>

                {/* Favorite button */}
                {onToggleFavorite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`absolute top-1.5 right-1.5 z-10 bg-background/90 hover:bg-background h-6 w-6 p-0 ${
                      isFavorite ? 'text-red-500' : 'text-muted-foreground'
                    }`}
                    onClick={onToggleFavorite}
                    disabled={isToggleFavoriteLoading}
                  >
                    <Heart 
                      className={`h-3 w-3 ${isFavorite ? 'fill-current' : ''}`} 
                    />
                  </Button>
                )}

                {/* Super admin regenerate button */}
                {isSuperAdmin && (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={onGenerateImage}
                    disabled={isGeneratingImage}
                    className="absolute bottom-2 right-2 text-xs"
                  >
                    {isGeneratingImage ? 'Generando...' : 'Regenerar'}
                  </Button>
                )}
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-lg flex items-center justify-center relative">
                {/* Image type badge for no image */}
                {getImageBadge()}
                
                {/* Popularity badge */}
                <div className="absolute top-1.5 right-12 flex items-center space-x-1 bg-background/90 rounded-md px-1.5 py-0.5 text-xs">
                  <TrendingUp className="h-2.5 w-2.5 text-primary" />
                  <span className="font-medium text-foreground">
                    {ingredient.popularity}%
                  </span>
                </div>

                {/* Favorite button */}
                {onToggleFavorite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`absolute top-1.5 right-1.5 z-10 bg-background/90 hover:bg-background h-6 w-6 p-0 ${
                      isFavorite ? 'text-red-500' : 'text-muted-foreground'
                    }`}
                    onClick={onToggleFavorite}
                    disabled={isToggleFavoriteLoading}
                  >
                    <Heart 
                      className={`h-3 w-3 ${isFavorite ? 'fill-current' : ''}`} 
                    />
                  </Button>
                )}

                {isSuperAdmin ? (
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
                ) : (
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Imagen no disponible</p>
                  </div>
                )}
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
