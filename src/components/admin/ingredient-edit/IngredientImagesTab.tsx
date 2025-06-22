
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormWatch } from "react-hook-form";
import { IngredientFormData } from "./types";

interface IngredientImagesTabProps {
  watch: UseFormWatch<IngredientFormData>;
}

const IngredientImagesTab = ({ watch }: IngredientImagesTabProps) => {
  const currentImageUrl = watch('image_url');
  const realImageUrl = watch('real_image_url');
  const ingredientName = watch('name');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Imagen Generada por IA</CardTitle>
          </CardHeader>
          <CardContent>
            {currentImageUrl ? (
              <div className="space-y-2">
                <img 
                  src={currentImageUrl} 
                  alt={ingredientName || 'Ingredient'}
                  className="w-full h-48 object-cover rounded border"
                  onLoad={() => console.log('✅ AI Image loaded successfully')}
                  onError={(e) => {
                    console.error('❌ AI Image failed to load:', currentImageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Imagen generada automáticamente con IA
                </p>
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded border flex items-center justify-center">
                <p className="text-gray-500">No hay imagen generada</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Imagen Real</CardTitle>
          </CardHeader>
          <CardContent>
            {realImageUrl ? (
              <div className="space-y-2">
                <img 
                  src={realImageUrl} 
                  alt={`${ingredientName} real`}
                  className="w-full h-48 object-cover rounded border"
                  onError={(e) => {
                    console.error('❌ Real Image failed to load:', realImageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Imagen real del ingrediente
                </p>
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded border flex items-center justify-center">
                <p className="text-gray-500">No hay imagen real</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IngredientImagesTab;
