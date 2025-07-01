
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AIChefProBannerProps {
  className?: string;
}

const AIChefProBanner = ({ className = "" }: AIChefProBannerProps) => {
  return (
    <Card className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 ${className}`}>
      <CardContent className="p-4">
        <a
          href="https://aichef.pro"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 text-decoration-none group"
        >
          <div className="text-2xl mt-0.5">🤖</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-blue-900 group-hover:text-blue-700 transition-colors">
              <span className="font-semibold">AI Chef Pro:</span> Prueba Gratis la Suite de Aplicaciones de Inteligencia Artificial para Chefs y profesionales de la hostelería aquí.
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </a>
      </CardContent>
    </Card>
  );
};

export default AIChefProBanner;
