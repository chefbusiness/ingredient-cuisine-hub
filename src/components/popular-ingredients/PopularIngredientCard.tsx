
import { TrendingUp, Flame, Eye, Camera, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useResponsive } from "@/hooks/useResponsive";
import LazyImage from "@/components/LazyImage";

interface PopularIngredientCardProps {
  ingredient: any;
  type: 'viewed' | 'trending';
  index: number;
  hasAnimated: boolean;
  onIngredientClick: (ingredientId: string, type: 'most_viewed' | 'trending') => void;
}

const PopularIngredientCard = ({ 
  ingredient, 
  type, 
  index, 
  hasAnimated, 
  onIngredientClick 
}: PopularIngredientCardProps) => {
  const { isMobile } = useResponsive();

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

  const ingredientUrl = `/ingrediente/${ingredient.slug || ingredient.id}`;
  
  return (
    <div
      className={`transition-all duration-500 ease-out ${
        hasAnimated 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-4'
      }`}
      style={{ transitionDelay: `${index * 75}ms` }}
    >
      <Link 
        to={ingredientUrl}
        onClick={() => onIngredientClick(ingredient.id, type === 'viewed' ? 'most_viewed' : 'trending')}
      >
        <Card className="border border-border bg-background hover:bg-muted/50 hover:shadow-md transition-all group h-full cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5">
          <CardContent className={isMobile ? 'p-3' : 'p-4'}>
            <div className="space-y-3">
              {/* Imagen del ingrediente */}
              <div className={`relative overflow-hidden rounded-md ${isMobile ? 'h-20' : 'h-24'}`}>
                <LazyImage
                  src={getIngredientImage(ingredient)}
                  alt={ingredient.name}
                  className="group-hover:scale-110 transition-transform duration-500 ease-out"
                  animationDelay={index * 50}
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
                <p className={`text-muted-foreground line-clamp-1 transition-colors duration-200 group-hover:text-foreground/80 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {ingredient.name_en}
                </p>
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
};

export default PopularIngredientCard;
