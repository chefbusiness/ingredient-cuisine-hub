
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader, Save, Eye } from "lucide-react";
import { useSaveContent } from "@/hooks/useSaveContent";
import { useGenerateImage } from "@/hooks/useGenerateImage";
import AdminImageGenerationProgress from "./AdminImageGenerationProgress";
import AdminIngredientPreviewCard from "./AdminIngredientPreviewCard";

interface AdminContentPreviewProps {
  contentType: string;
  generatedContent: any[];
  imageGenerationProgress: {
    current: number;
    total: number;
    isGenerating: boolean;
  };
  onContentCleared: () => void;
  onContentUpdated: (updatedContent: any[]) => void;
  onImageProgressUpdate: (progress: { current: number; total: number; isGenerating: boolean }) => void;
}

const AdminContentPreview = ({
  contentType,
  generatedContent,
  imageGenerationProgress,
  onContentCleared,
  onContentUpdated,
  onImageProgressUpdate
}: AdminContentPreviewProps) => {
  const saveContent = useSaveContent();
  const generateImage = useGenerateImage();

  if (generatedContent.length === 0) return null;

  const handleSaveContentAndGenerateImages = async () => {
    try {
      console.log('🔄 Starting save and image generation process...');
      
      // Paso 1: Guardar contenido
      const saveResult = await saveContent.mutateAsync({
        type: contentType,
        data: generatedContent
      });
      
      // Paso 2: Si son ingredientes, generar imágenes
      if (contentType === 'ingredient' && saveResult.data && saveResult.data.length > 0) {
        console.log('🖼️ Starting automatic image generation...');
        
        const savedIngredients = saveResult.data;
        onImageProgressUpdate({ 
          current: 0, 
          total: savedIngredients.length, 
          isGenerating: true 
        });
        
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < savedIngredients.length; i++) {
          const savedIngredient = savedIngredients[i];
          
          try {
            console.log(`🔄 Generating image ${i + 1}/${savedIngredients.length} for: ${savedIngredient.name}`);
            
            onImageProgressUpdate({ 
              current: i + 1, 
              total: savedIngredients.length, 
              isGenerating: true 
            });
            
            const originalContent = generatedContent.find(item => item.name === savedIngredient.name);
            
            const result = await generateImage.mutateAsync({
              ingredientName: savedIngredient.name,
              description: originalContent?.description,
              ingredientId: savedIngredient.id
            });

            if (result.success) {
              console.log(`✅ Image generated for: ${savedIngredient.name}`);
              
              // Actualizar vista previa con la imagen
              const updatedContent = generatedContent.map(item => 
                item.name === savedIngredient.name 
                  ? { ...item, image_url: result.imageUrl, id: savedIngredient.id }
                  : item
              );
              onContentUpdated(updatedContent);
              successCount++;
            }
          } catch (error) {
            console.error(`❌ Error generating image for ${savedIngredient.name}:`, error);
            errorCount++;
          }
        }
        
        onImageProgressUpdate({ current: 0, total: 0, isGenerating: false });
        console.log(`🎉 Image generation completed. Success: ${successCount}, Errors: ${errorCount}`);
      }
      
      // Limpiar vista previa
      onContentCleared();
      
    } catch (error) {
      console.error('❌ Error in complete process:', error);
      onImageProgressUpdate({ current: 0, total: 0, isGenerating: false });
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Vista Previa del Contenido Generado
          {imageGenerationProgress.isGenerating && (
            <Badge variant="secondary" className="animate-pulse">
              <Loader className="h-3 w-3 mr-1 animate-spin" />
              Generando imágenes...
            </Badge>
          )}
        </CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={handleSaveContentAndGenerateImages}
            disabled={saveContent.isPending || imageGenerationProgress.isGenerating}
            size="sm"
          >
            {saveContent.isPending || imageGenerationProgress.isGenerating ? (
              <Loader className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {imageGenerationProgress.isGenerating ? 'Generando Imágenes...' : 'Guardar y Generar Imágenes'}
          </Button>
        </div>
      </CardHeader>
      
      <AdminImageGenerationProgress {...imageGenerationProgress} />
      
      <CardContent>
        <div className="space-y-4">
          {generatedContent.map((item, index) => {
            if (contentType === 'ingredient') {
              return (
                <AdminIngredientPreviewCard 
                  key={index}
                  ingredient={item}
                  index={index}
                />
              );
            }
            
            if (contentType === 'category') {
              return (
                <Card key={index} className="p-4">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <Badge variant="secondary" className="mt-1">{item.name_en}</Badge>
                    <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                  </div>
                </Card>
              );
            }

            if (contentType === 'price_update') {
              return (
                <Card key={index} className="p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{item.ingredient_name}</h3>
                      <Badge>€{item.price}/kg</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.season_variation}</p>
                  </div>
                </Card>
              );
            }

            return null;
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminContentPreview;
