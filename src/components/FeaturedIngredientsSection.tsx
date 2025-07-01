
import { Clock, Camera, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLatestIngredients } from "@/hooks/useLatestIngredients";
import LazyImage from "@/components/LazyImage";

const FeaturedIngredientsSection = () => {
  // Get the 8 most recent ingredients
  const { data: latestIngredients = [], isLoading } = useLatestIngredients(8);

  const getIngredientImage = (ingredient: any) => {
    // Use real image if available, then AI image, then fallback
    if (ingredient.real_image_url) {
      return ingredient.real_image_url;
    }
    if (ingredient.image_url) {
      return ingredient.image_url;
    }
    return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop';
  };

  const getImageBadge = (ingredient: any) => {
    if (ingredient.real_image_url) {
      return (
        <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs">
          <Camera className="w-3 h-3 mr-1" />
          Real
        </Badge>
      );
    } else if (ingredient.image_url) {
      return (
        <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-xs">
          <Sparkles className="w-3 h-3 mr-1" />
          IA
        </Badge>
      );
    }
    return null;
  };

  const getIngredientPrice = (ingredient: any) => {
    if (ingredient.ingredient_prices && ingredient.ingredient_prices.length > 0) {
      const price = ingredient.ingredient_prices[0];
      const symbol = price.countries?.currency_symbol || "€";
      return `${symbol}${price.price}/${price.unit}`;
    }
    return "Precio no disponible";
  };

  if (isLoading || !latestIngredients.length) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-xl font-medium text-foreground mb-2 flex items-center justify-center gap-2">
            <Clock className="h-5 w-5" />
            Últimos Ingredientes
          </h3>
          <p className="text-sm text-muted-foreground">
            Los ingredientes más recientes añadidos al directorio
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {latestIngredients.map((ingredient) => (
            <Link key={ingredient.id} to={`/ingrediente/${ingredient.slug}`}>
              <Card className="border border-border bg-background hover:bg-muted/30 transition-colors group overflow-hidden h-full">
                <div className="aspect-square overflow-hidden relative">
                  <LazyImage
                    src={getIngredientImage(ingredient)}
                    alt={ingredient.name}
                    className="group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.log('Image failed to load for latest ingredient:', ingredient.name);
                    }}
                  />
                  {getImageBadge(ingredient)}
                </div>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm text-foreground mb-1">
                    {ingredient.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {ingredient.categories?.name || 'Sin categoría'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary">
                      {getIngredientPrice(ingredient)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {ingredient.popularity || 0}% popular
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedIngredientsSection;
