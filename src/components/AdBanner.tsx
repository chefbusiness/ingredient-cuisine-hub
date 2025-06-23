
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdBannerProps {
  title: string;
  description: string;
  url: string;
  ctaText: string;
  variant?: "primary" | "secondary";
  size?: "default" | "compact";
}

const AdBanner = ({ 
  title, 
  description, 
  url, 
  ctaText, 
  variant = "primary",
  size = "default" 
}: AdBannerProps) => {
  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-green-50 to-green-100 border-green-200",
    secondary: "bg-gradient-to-r from-blue-50 to-purple-100 border-blue-200"
  };

  const sizeStyles = {
    default: "p-6",
    compact: "p-4"
  };

  return (
    <Card className={`${variantStyles[variant]} cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]`}>
      <CardContent className={`${sizeStyles[size]} space-y-3`} onClick={handleClick}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`font-bold text-gray-900 ${size === "compact" ? "text-base" : "text-lg"}`}>
              {title}
            </h3>
            <p className={`text-gray-700 mt-2 ${size === "compact" ? "text-sm" : "text-base"}`}>
              {description}
            </p>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-500 ml-3 flex-shrink-0" />
        </div>
        
        <div className="flex justify-start">
          <Button 
            variant={variant === "primary" ? "default" : "outline"}
            size="sm"
            className={`${variant === "primary" ? "bg-green-600 hover:bg-green-700" : "border-blue-600 text-blue-600 hover:bg-blue-50"}`}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            {ctaText}
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 border-t pt-2 mt-3">
          Contenido promocional
        </div>
      </CardContent>
    </Card>
  );
};

export default AdBanner;
