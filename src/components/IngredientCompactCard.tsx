
import { TrendingUp, Camera, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useResponsive } from "@/hooks/useResponsive";
import LazyImage from "@/components/LazyImage";
import { memo } from "react";

interface IngredientCompactCardProps {
  ingredient: {
    id: string;
    name: string;
    name_en: string;
    slug: string;
    image_url?: string;
    real_image_url?: string;
    popularity: number;
    categories?: {
      name: string;
    };
  };
  animationDelay?: number;
}

const IngredientCompactCard = memo(({ ingredient, animationDelay = 0 }: IngredientCompactCardProps) => {
  const { isMobile } = useResponsive();

  const getIngredientImage = () => {
    if (ingredient.real_image_url) return ingredient.real_image_url;
    if (ingredient.image_url) return ingredient.image_url;
    return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop';
  };

  const getImageBadge = () => {
    const badgeClass = "absolute top-1 left-1 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1 transition-all duration-300 group-hover:scale-105";
    
    if (ingredient.real_image_url) {
      return (
        <div className={`${badgeClass} bg-green-500/90 group-hover:bg-green-600/95`}>
          <Camera className="h-2 w-2" />
          {!isMobile && <span className="text-xs">Real</span>}
        </div>
      );
    } else if (ingredient.image_url) {
      return (
        <div className={`${badgeClass} bg-blue-500/90 group-hover:bg-blue-600/95`}>
          <Sparkles className="h-2 w-2" />
          {!isMobile && <span className="text-xs">IA</span>}
        </div>
      );
    }
    return null;
  };

  const getIngredientUrl = () => {
    return `/ingrediente/${ingredient.slug || ingredient.id}`;
  };

  return (
    <Link to={getIngredientUrl()}>
      <Card className="clean-card group overflow-hidden hover:shadow-lg transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-0.5 hover:border-primary/20">
        <CardContent className="p-2">
          <div className="flex gap-2">
            <div className={`flex-shrink-0 relative overflow-hidden rounded-md ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`}>
              <LazyImage
                src={getIngredientImage()}
                alt={ingredient.name}
                className="group-hover:scale-110 transition-transform duration-500 ease-out"
                animationDelay={animationDelay}
              />
              {getImageBadge()}
            </div>
            
            <div className="flex-1 min-w-0 space-y-1">
              <h4 className={`font-medium text-foreground line-clamp-1 transition-colors duration-200 group-hover:text-primary ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {ingredient.name}
              </h4>
              <p className={`text-muted-foreground line-clamp-1 transition-colors duration-200 group-hover:text-foreground/80 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                {ingredient.name_en}
              </p>
              <div className="flex items-center justify-between">
                <span className={`text-muted-foreground transition-colors duration-200 group-hover:text-foreground/60 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  {ingredient.categories?.name}
                </span>
                <div className="flex items-center space-x-1 transition-all duration-300 group-hover:scale-105">
                  <TrendingUp className={`text-primary transition-colors duration-200 group-hover:text-primary/80 ${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
                  <span className={`font-medium text-foreground transition-colors duration-200 group-hover:text-primary ${isMobile ? 'text-xs' : 'text-xs'}`}>
                    {ingredient.popularity}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

IngredientCompactCard.displayName = 'IngredientCompactCard';

export default IngredientCompactCard;
