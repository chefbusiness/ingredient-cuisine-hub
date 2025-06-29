
import { TrendingUp, Camera, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useResponsive } from "@/hooks/useResponsive";
import LazyImage from "@/components/LazyImage";

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
}

const IngredientCompactCard = ({ ingredient }: IngredientCompactCardProps) => {
  const { isMobile } = useResponsive();

  const getIngredientImage = () => {
    if (ingredient.real_image_url) return ingredient.real_image_url;
    if (ingredient.image_url) return ingredient.image_url;
    return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop';
  };

  const getImageBadge = () => {
    const badgeClass = "absolute top-1 left-1 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1";
    
    if (ingredient.real_image_url) {
      return (
        <div className={`${badgeClass} bg-green-500/90`}>
          <Camera className="h-2 w-2" />
          {!isMobile && <span className="text-xs">Real</span>}
        </div>
      );
    } else if (ingredient.image_url) {
      return (
        <div className={`${badgeClass} bg-blue-500/90`}>
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
      <Card className="clean-card group overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-2">
          <div className="flex gap-2">
            <div className={`flex-shrink-0 relative overflow-hidden rounded ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`}>
              <LazyImage
                src={getIngredientImage()}
                alt={ingredient.name}
                className="group-hover:scale-105 transition-transform duration-300"
              />
              {getImageBadge()}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium text-foreground line-clamp-1 ${isMobile ? 'text-xs mb-0.5' : 'text-sm mb-1'}`}>
                {ingredient.name}
              </h4>
              <p className={`text-muted-foreground line-clamp-1 ${isMobile ? 'text-xs mb-1' : 'text-xs mb-2'}`}>
                {ingredient.name_en}
              </p>
              <div className="flex items-center justify-between">
                <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  {ingredient.categories?.name}
                </span>
                <div className="flex items-center space-x-1">
                  <TrendingUp className={`text-primary ${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
                  <span className={`font-medium text-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
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
};

export default IngredientCompactCard;
