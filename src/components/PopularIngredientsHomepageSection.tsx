
import { TrendingUp, Flame, Eye, Camera, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePopularIngredients } from "@/hooks/usePopularIngredients";
import { usePopularIngredientsAnalytics } from "@/hooks/usePopularIngredientsAnalytics";
import { useResponsive } from "@/hooks/useResponsive";
import { useOptimizedIntersectionObserver } from "@/hooks/useOptimizedIntersectionObserver";
import LazyImage from "@/components/LazyImage";
import { useEffect } from "react";

const PopularIngredientsHomepageSection = () => {
  const { isMobile, isTablet } = useResponsive();
  const { targetRef, isIntersecting, hasAnimated } = useOptimizedIntersectionObserver({
    rootMargin: '100px',
    triggerOnce: true,
    animationDelay: 200
  });

  // Aumentamos el límite para la homepage
  const limit = isMobile ? 4 : isTablet ? 6 : 8;
  const { mostViewed, trending, loading, error } = usePopularIngredients(limit);
  const { trackSectionView, trackTabSwitch, trackPopularIngredientClick } = usePopularIngredientsAnalytics();

  // Trackear vista de la sección cuando se hace visible
  useEffect(() => {
    if (isIntersecting && hasAnimated) {
      trackSectionView();
    }
  }, [isIntersecting, hasAnimated, trackSectionView]);

  const LoadingSkeleton = () => {
    const gridClasses = isMobile 
      ? "grid grid-cols-2 gap-3" 
      : isTablet 
      ? "grid grid-cols-3 gap-4" 
      : "grid grid-cols-4 gap-4";

    return (
      <div className={gridClasses}>
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
            <Card className="border border-border bg-background">
              <CardContent className={isMobile ? 'p-3' : 'p-4'}>
                <div className="space-y-2">
                  <Skeleton className={`w-full rounded ${isMobile ? 'h-16' : 'h-20'}`} />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  };

  const getIngredientImage = (ingredient: any) => {
    if (ingredient.real_image_url) return ingredient.real_image_url;
    if (ingredient.image_url) return ingredient.image_url;
    return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop';
  };

  const getImageBadge = (ingredient: any) => {
    const badgeClass = "absolute top-2 left-2 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1 transition-all duration-300 group-hover:scale-105";
    
    if (ingredient.real_image_url) {
      return (
        <div className={`${badgeClass} bg-green-500/90 group-hover:bg-green-600/95`}>
          <Camera className="h-2.5 w-2.5" />
          {!isMobile && <span>Real</span>}
        </div>
      );
    } else if (ingredient.image_url) {
      return (
        <div className={`${badgeClass} bg-blue-500/90 group-hover:bg-blue-600/95`}>
          <Sparkles className="h-2.5 w-2.5" />
          {!isMobile && <span>IA</span>}
        </div>
      );
    }
    return null;
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const renderIngredientGrid = (ingredients: any[], type: 'viewed' | 'trending') => {
    if (!ingredients || ingredients.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {type === 'viewed' ? 'No hay datos de visualizaciones' : 'No hay ingredientes trending'}
          </p>
        </div>
      );
    }

    const gridClasses = isMobile 
      ? "grid grid-cols-2 gap-3" 
      : isTablet 
      ? "grid grid-cols-3 gap-4" 
      : "grid grid-cols-4 gap-4";

    return (
      <div className={gridClasses}>
        {ingredients.map((ingredient, index) => {
          const ingredientUrl = `/ingrediente/${ingredient.slug || ingredient.id}`;
          
          return (
            <div
              key={ingredient.id}
              className={`transition-all duration-500 ease-out ${
                hasAnimated 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-4'
              }`}
              style={{ transitionDelay: `${index * 75}ms` }}
            >
              <Link 
                to={ingredientUrl}
                onClick={() => trackPopularIngredientClick(ingredient.id, type === 'viewed' ? 'most_viewed' : 'trending')}
              >
                <Card className="border border-border bg-background hover:bg-muted/50 hover:shadow-md transition-all group h-full cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5">
                  <CardContent className={isMobile ? 'p-3' : 'p-4'}>
                    <div className="space-y-2">
                      {/* Imagen del ingrediente - Altura reducida para mostrar imagen completa */}
                      <div className={`relative overflow-hidden rounded-md bg-muted/20 ${isMobile ? 'h-16' : 'h-20'}`}>
                        <img
                          src={getIngredientImage(ingredient)}
                          alt={ingredient.name}
                          className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop';
                          }}
                        />
                        {getImageBadge(ingredient)}
                        
                        {/* Badge de estadísticas */}
                        <div className={`absolute top-2 right-2 flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all duration-300 backdrop-blur-sm ${
                          type === 'viewed' 
                            ? 'bg-blue-500/90 hover:bg-blue-600/95 text-white' 
                            : 'bg-orange-500/90 hover:bg-orange-600/95 text-white'
                        }`}>
                          {type === 'viewed' ? (
                            <>
                              <Eye className="h-2.5 w-2.5" />
                              <span className="font-medium">{formatViewCount(ingredient.viewCount)}</span>
                            </>
                          ) : (
                            <>
                              <Flame className="h-2.5 w-2.5" />
                              <span className="font-medium">{ingredient.popularity}%</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Información del ingrediente */}
                      <div className="space-y-2">
                        <h4 className={`font-medium text-foreground line-clamp-1 transition-colors duration-200 group-hover:text-primary ${isMobile ? 'text-sm' : 'text-base'}`}>
                          {ingredient.name}
                        </h4>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className={`transition-colors duration-200 group-hover:bg-green-100 group-hover:text-green-700 ${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'}`}>
                            {ingredient.categories?.name || 'Sin categoría'}
                          </Badge>
                          <div className="flex items-center space-x-1 transition-all duration-300 group-hover:scale-105">
                            <TrendingUp className={`text-primary transition-colors duration-200 group-hover:text-primary/80 ${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                            <span className={`font-medium text-foreground transition-colors duration-200 group-hover:text-primary ${isMobile ? 'text-xs' : 'text-sm'}`}>
                              {ingredient.popularity}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

  if (error) {
    return null; // No mostrar la sección si hay error
  }

  return (
    <section 
      ref={targetRef}
      className={`${isMobile ? 'py-8' : 'py-12'} bg-background`}
    >
      <div className={`container mx-auto ${isMobile ? 'px-3' : 'px-4'}`}>
        <div 
          className={`transition-all duration-700 ease-out ${
            hasAnimated 
              ? 'opacity-100 transform translate-y-0' 
              : 'opacity-0 transform translate-y-4'
          }`}
        >
          {/* Header */}
          <div className={`text-center ${isMobile ? 'mb-6' : 'mb-8'}`}>
            <h3 className={`font-medium text-foreground mb-2 flex items-center justify-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              <TrendingUp className={`transition-transform duration-300 hover:rotate-12 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              Más Populares
            </h3>
            <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Descubre los ingredientes más vistos y trending del momento
            </p>
          </div>

          {/* Tabs Content */}
          {!isIntersecting ? (
            <LoadingSkeleton />
          ) : loading ? (
            <LoadingSkeleton />
          ) : (
            <Tabs 
              defaultValue="trending" 
              className="w-full"
              onValueChange={(value) => trackTabSwitch(value as 'trending' | 'most_viewed')}
            >
              <div className="flex justify-center mb-6">
                <TabsList className={`${isMobile ? 'h-8' : 'h-10'}`}>
                  <TabsTrigger 
                    value="trending" 
                    className={`flex items-center gap-2 transition-all duration-200 ${isMobile ? 'text-xs px-3' : 'text-sm px-4'}`}
                  >
                    <Flame className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    {isMobile ? 'Trending' : 'Trending'}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="viewed" 
                    className={`flex items-center gap-2 transition-all duration-200 ${isMobile ? 'text-xs px-3' : 'text-sm px-4'}`}
                  >
                    <Eye className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    {isMobile ? 'Vistos' : 'Más Vistos'}
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="trending" className="mt-0">
                {renderIngredientGrid(trending, 'trending')}
              </TabsContent>
              
              <TabsContent value="viewed" className="mt-0">
                {renderIngredientGrid(mostViewed, 'viewed')}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularIngredientsHomepageSection;
