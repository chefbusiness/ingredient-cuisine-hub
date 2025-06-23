
import { TrendingUp, Camera, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePopularIngredients } from "@/hooks/usePopularIngredients";
import { useIngredients } from "@/hooks/useIngredients";

const FeaturedIngredientsSection = () => {
  // Get both popular ingredients from views and general ingredients sorted by popularity
  const { anonymousViews, registeredViews, loading: popularLoading } = usePopularIngredients();
  const { data: allIngredients = [], isLoading: ingredientsLoading } = useIngredients(undefined, undefined, 'popularidad');

  // Combine and deduplicate ingredients, prioritizing those with recent views
  const getFeaturedIngredients = () => {
    const recentlyViewed = [...anonymousViews, ...registeredViews];
    const viewedIds = new Set(recentlyViewed.map(ing => ing.id));
    
    // Get full ingredient data for recently viewed items
    const recentlyViewedWithData = recentlyViewed
      .map(viewedItem => allIngredients.find(ing => ing.id === viewedItem.id))
      .filter(Boolean);
    
    // Add popular ingredients that haven't been recently viewed
    const additionalIngredients = allIngredients
      .filter(ing => !viewedIds.has(ing.id))
      .slice(0, 8 - recentlyViewedWithData.length);

    return [...recentlyViewedWithData, ...additionalIngredients].slice(0, 8);
  };

  const featuredIngredients = getFeaturedIngredients();

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

  const isRecentlyViewed = (ingredientId: string) => {
    return [...anonymousViews, ...registeredViews].some(ing => ing.id === ingredientId);
  };

  if (popularLoading || ingredientsLoading || !featuredIngredients.length) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-xl font-medium text-foreground mb-2">
            Ingredientes Más Populares
          </h3>
          <p className="text-sm text-muted-foreground">
            Los ingredientes más consultados por profesionales
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredIngredients.map((ingredient) => (
            <Link key={ingredient.id} to={`/ingrediente/${ingredient.id}`}>
              <Card className="border border-border bg-background hover:bg-muted/30 transition-colors group overflow-hidden h-full">
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={getIngredientImage(ingredient)}
                    alt={ingredient.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop';
                    }}
                  />
                  {getImageBadge(ingredient)}
                  {isRecentlyViewed(ingredient.id) && (
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
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
