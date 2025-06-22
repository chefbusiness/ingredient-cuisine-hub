
import { TrendingUp, Camera, Sparkles, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";

interface Ingredient {
  id: number | string;
  name: string;
  nameEN: string;
  nameLA: string;
  category: string;
  popularity: number;
  price: string;
  priceUS: string;
  description: string;
  image: string;
  merma: number;
  rendimiento: number;
  temporada: string;
  hasAIImage?: boolean;
  hasRealImage?: boolean;
}

interface DirectorioListProps {
  ingredients: Ingredient[];
}

const DirectorioList = ({ ingredients }: DirectorioListProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();

  const getIngredientImage = (ingredient: Ingredient) => {
    if (ingredient.image) {
      return ingredient.image;
    }
    return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop';
  };

  const getImageBadge = (ingredient: Ingredient) => {
    if (ingredient.hasRealImage) {
      return (
        <div className="bg-green-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Camera className="h-3 w-3" />
          Real
        </div>
      );
    } else if (ingredient.hasAIImage) {
      return (
        <div className="bg-blue-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          IA
        </div>
      );
    } else {
      return (
        <div className="bg-orange-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Camera className="h-3 w-3" />
          Sin imagen
        </div>
      );
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent, ingredientId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(ingredientId);
  };

  return (
    <div className="space-y-4">
      {ingredients.map((ingredient) => (
        <div key={ingredient.id} className="relative">
          <Link to={`/ingrediente/${ingredient.id}`}>
            <Card className="clean-card group overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Imagen */}
                  <div className="w-24 h-24 flex-shrink-0 relative overflow-hidden rounded-md">
                    <img
                      src={getIngredientImage(ingredient)}
                      alt={ingredient.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop';
                      }}
                    />
                  </div>

                  {/* Contenido principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-lg text-foreground mb-1">
                          {ingredient.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{ingredient.nameEN}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 bg-background/90 rounded-md px-2 py-1">
                          <TrendingUp className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium text-foreground">
                            {ingredient.popularity}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {ingredient.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{ingredient.temporada}</span>
                      {getImageBadge(ingredient)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {ingredient.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Precio España:</span>
                        <span className="font-medium text-primary">{ingredient.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Rendimiento:</span>
                        <Badge variant="outline" className="text-xs">
                          {ingredient.rendimiento}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* Botón de favorito flotante */}
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-4 right-4 z-10 h-8 w-8 p-0 bg-background/90 hover:bg-background ${
              isFavorite(String(ingredient.id)) ? 'text-red-500' : 'text-muted-foreground'
            }`}
            onClick={(e) => handleFavoriteClick(e, String(ingredient.id))}
          >
            <Heart 
              className={`h-4 w-4 ${
                isFavorite(String(ingredient.id)) ? 'fill-current' : ''
              }`} 
            />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default DirectorioList;
