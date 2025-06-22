
import { Globe, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RealImagesGallery from "@/components/RealImagesGallery";
import { Ingredient } from "@/hooks/useIngredients";

interface NamesTabProps {
  ingredient: Ingredient;
  realImagesCount: number;
}

const NamesTab = ({ ingredient, realImagesCount }: NamesTabProps) => {
  return (
    <div className="space-y-4">
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Nombres en Diferentes Idiomas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Español (España)</span>
                <p className="font-medium">{ingredient.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Inglés</span>
                <p className="font-medium">{ingredient.name_en}</p>
              </div>
              {ingredient.name_fr && (
                <div>
                  <span className="text-sm text-gray-600">Francés</span>
                  <p className="font-medium">{ingredient.name_fr}</p>
                </div>
              )}
              {ingredient.name_it && (
                <div>
                  <span className="text-sm text-gray-600">Italiano</span>
                  <p className="font-medium">{ingredient.name_it}</p>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {ingredient.name_la && (
                <div>
                  <span className="text-sm text-gray-600">Latinoamérica</span>
                  <p className="font-medium">{ingredient.name_la}</p>
                </div>
              )}
              {ingredient.name_pt && (
                <div>
                  <span className="text-sm text-gray-600">Portugués</span>
                  <p className="font-medium">{ingredient.name_pt}</p>
                </div>
              )}
              {ingredient.name_zh && (
                <div>
                  <span className="text-sm text-gray-600">Chino</span>
                  <p className="font-medium">{ingredient.name_zh}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {realImagesCount > 0 && (
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Imágenes Reales</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RealImagesGallery ingredientId={ingredient.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NamesTab;
