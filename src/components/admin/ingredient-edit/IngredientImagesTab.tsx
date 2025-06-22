
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UseFormWatch } from "react-hook-form";
import { IngredientFormData } from "./types";
import ImageUploadSection from "@/components/admin/ImageUploadSection";
import RealImagesGallery from "@/components/RealImagesGallery";

interface IngredientImagesTabProps {
  watch: UseFormWatch<IngredientFormData>;
  ingredientId?: string;
  onImagesUpdated?: () => void;
}

const IngredientImagesTab = ({ watch, ingredientId, onImagesUpdated }: IngredientImagesTabProps) => {
  const currentImageUrl = watch('image_url');
  const realImageUrl = watch('real_image_url');
  const ingredientName = watch('name');

  const handleImageUploaded = () => {
    console.log('📸 Images updated, refreshing gallery...');
    if (onImagesUpdated) {
      onImagesUpdated();
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Images Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Imagen Principal (Generada por IA)</CardTitle>
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
                  Imagen generada automáticamente con Flux 1.1 Pro
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
            <CardTitle className="text-sm">Imagen Principal Actual</CardTitle>
          </CardHeader>
          <CardContent>
            {realImageUrl ? (
              <div className="space-y-2">
                <img 
                  src={realImageUrl} 
                  alt={`${ingredientName} principal`}
                  className="w-full h-48 object-cover rounded border"
                  onError={(e) => {
                    console.error('❌ Main Image failed to load:', realImageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Imagen principal real seleccionada
                </p>
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded border flex items-center justify-center">
                <p className="text-gray-500">Usando imagen AI como principal</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Real Images Gallery */}
      {ingredientId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Galería de Imágenes Reales</CardTitle>
          </CardHeader>
          <CardContent>
            <RealImagesGallery 
              ingredientId={ingredientId}
              isAdmin={true}
              maxImages={6}
              onSetAsMain={(imageUrl) => {
                console.log('🖼️ Setting new main image:', imageUrl);
                if (onImagesUpdated) {
                  onImagesUpdated();
                }
              }}
            />
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Image Upload Section */}
      {ingredientId && (
        <ImageUploadSection
          ingredientId={ingredientId}
          ingredientName={ingredientName}
          onImageUploaded={handleImageUploaded}
        />
      )}
    </div>
  );
};

export default IngredientImagesTab;
