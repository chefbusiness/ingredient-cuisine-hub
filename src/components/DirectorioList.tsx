
import { TrendingUp, Camera, Sparkles, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { useResponsive } from "@/hooks/useResponsive";

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
  slug?: string;
}

interface DirectorioListProps {
  ingredients: Ingredient[];
}

const DirectorioList = ({ ingredients }: DirectorioListProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { isMobile } = useResponsive();

  const getIngredientImage = (ingredient: Ingredient) => {
    if (ingredient.image) {
      return ingredient.image;
    }
    return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop';
  };

  const getImageBadge = (ingredient: Ingredient) => {
    const badgeClass = "text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1";
    
    if (ingredient.hasRealImage) {
      return (
        <div className={`${badgeClass} bg-green-500/90`}>
          <Camera className="h-2.5 w-2.5" />
          {!isMobile && <span>Real</span>}
        </div>
      );
    } else if (ingredient.hasAIImage) {
      return (
        <div className={`${badgeClass} bg-blue-500/90`}>
          <Sparkles className="h-2.5 w-2.5" />
          {!isMobile && <span>IA</span>}
        </div>
      );
    } else {
      return (
        <div className={`${badgeClass} bg-orange-500/90`}>
          <Camera className="h-2.5 w-2.5" />
          {!isMobile && <span>Sin imagen</span>}
        </div>
      );
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent, ingredientId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(ingredientId);
  };

  const getIngredientUrl = (ingredient: Ingredient) => {
    return `/ingrediente/${ingredient.slug || ingredient.id}`;
  };

  return (
    <div className={`space-y-3 ${isMobile ? 'px-2' : 'space-y-4'}`}>
      {ingredients.map((ingredient) => (
        <div key={ingredient.id} className="relative">
          <Link to={getIngredientUrl(ingredient)}>
            <Card className="clean-card group overflow-hidden">
              <CardContent className={isMobile ? "p-3" : "p-4"}>
                <div className={`flex gap-3 ${isMobile ? 'gap-3' : 'gap-4'}`}>
                  <div className={`flex-shrink-0 relative overflow-hidden rounded-md ${isMobile ? 'w-16 h-16' : 'w-24 h-24'}`}>
                    <img
                      src={getIngredientImage(ingredient)}
                      alt={ingredient.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`flex items-start justify-between ${isMobile ? 'mb-1' : 'mb-2'}`}>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium text-foreground line-clamp-2 ${isMobile ? 'text-sm mb-0.5' : 'text-lg mb-1'}`}>
                          {ingredient.name}
                        </h3>
                        <p className={`text-muted-foreground line-clamp-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {ingredient.nameEN}
                        </p>
                      </div>
                      
                      {!isMobile && (
                        <div className="flex items-center space-x-1 bg-background/90 rounded-md px-2 py-1 ml-2">
                          <TrendingUp className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium text-foreground">
                            {ingredient.popularity}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className={`flex items-center gap-2 flex-wrap ${isMobile ? 'mb-1' : 'mb-3'}`}>
                      <Badge variant="secondary" className={`capitalize ${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'}`}>
                        {ingredient.category}
                      </Badge>
                      <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
                        {isMobile ? ingredient.temporada?.slice(0, 6) : ingredient.temporada}
                      </span>
                      {getImageBadge(ingredient)}
                      {isMobile && (
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-2.5 w-2.5 text-primary" />
                          <span className="text-xs font-medium text-foreground">
                            {ingredient.popularity}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {!isMobile && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {ingredient.description}
                      </p>
                    )}
                    
                    <div className={`grid gap-2 text-xs ${isMobile ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-4'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          {isMobile ? 'Precio:' : 'Precio España:'}
                        </span>
                        <span className="font-medium text-primary">{ingredient.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Rendimiento:</span>
                        <Badge variant="outline" className={isMobile ? 'text-xs px-1 py-0' : 'text-xs'}>
                          {ingredient.rendimiento}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            className={`absolute z-10 bg-background/90 hover:bg-background ${
              isFavorite(String(ingredient.id)) ? 'text-red-500' : 'text-muted-foreground'
            } ${isMobile ? 'top-2 right-2 h-6 w-6 p-0' : 'top-4 right-4 h-8 w-8 p-0'}`}
            onClick={(e) => handleFavoriteClick(e, String(ingredient.id))}
          >
            <Heart 
              className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${
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
