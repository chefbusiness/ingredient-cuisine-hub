
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, Users, Star } from "lucide-react";

interface DirectorioStatsProps {
  totalIngredients: number;
  totalCategories: number;
  searchResults: number;
  popularIngredient?: string;
}

const DirectorioStats = ({ 
  totalIngredients, 
  totalCategories, 
  searchResults, 
  popularIngredient 
}: DirectorioStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="clean-card">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{totalIngredients}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="clean-card">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Categorías</p>
              <p className="text-lg font-bold">{totalCategories}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="clean-card">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Resultados</p>
              <p className="text-lg font-bold">{searchResults}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="clean-card">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">Popular</p>
              <p className="text-sm font-medium truncate">{popularIngredient || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectorioStats;
