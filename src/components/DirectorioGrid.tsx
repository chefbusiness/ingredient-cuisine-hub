
import { TrendingUp, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Ingredient {
  id: number | string; // Permitir tanto número como string para UUIDs
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
}

interface DirectorioGridProps {
  ingredients: Ingredient[];
}

const DirectorioGrid = ({ ingredients }: DirectorioGridProps) => {
  const getIngredientImage = (ingredient: Ingredient) => {
    // Si tiene imagen, usarla
    if (ingredient.image) {
      return ingredient.image;
    }
    
    // Fallbacks específicos por categoría en lugar de solo tomates
    const categoryFallbacks: { [key: string]: string } = {
      'verduras': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop',
      'frutas': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop',
      'especias': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop',
      'carnes': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=400&fit=crop',
      'pescados': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=400&fit=crop',
      'lacteos': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=400&fit=crop',
      'cereales': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop'
    };
    
    return categoryFallbacks[ingredient.category.toLowerCase()] || 
           'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {ingredients.map((ingredient) => (
        <Link key={ingredient.id} to={`/ingrediente/${ingredient.id}`}>
          <Card className="clean-card group h-full overflow-hidden">
            <div className="aspect-square overflow-hidden relative">
              <img
                src={getIngredientImage(ingredient)}
                alt={ingredient.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = getIngredientImage(ingredient);
                }}
              />
              {!ingredient.image && (
                <div className="absolute top-2 left-2 bg-orange-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  Sin imagen IA
                </div>
              )}
              <div className="absolute top-2 right-2 flex items-center space-x-1 bg-background/90 rounded-md px-2 py-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-foreground">
                  {ingredient.popularity}%
                </span>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium text-base text-foreground mb-1">
                {ingredient.name}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-2">{ingredient.nameEN}</p>
              
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className="text-xs capitalize">
                  {ingredient.category}
                </Badge>
                <span className="text-xs text-muted-foreground">{ingredient.temporada}</span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {ingredient.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Precio España:</span>
                  <span className="font-medium text-primary">{ingredient.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Rendimiento:</span>
                  <Badge variant="outline" className="text-xs">
                    {ingredient.rendimiento}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default DirectorioGrid;
