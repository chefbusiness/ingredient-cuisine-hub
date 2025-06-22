
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader, Save, Eye, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
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

  const handleSaveContentOnly = async () => {
    try {
      console.log('💾 === SAVE CONTENT ONLY (NO IMAGES) ===');
      
      await saveContent.mutateAsync({
        type: contentType,
        data: generatedContent
      });
      
      onContentCleared();
      console.log('✅ Content saved successfully without images');
      
    } catch (error) {
      console.error('❌ Error saving content:', error);
    }
  };

  const handleSaveContentAndGenerateImages = async () => {
    try {
      console.log('🔄 === ENHANCED SAVE + GENERATE PROCESS ===');
      
      // PASO 1: Guardar contenido con verificación mejorada
      console.log('💾 Step 1: Enhanced content saving...');
      const saveResult = await saveContent.mutateAsync({
        type: contentType,
        data: generatedContent
      });
      
      console.log('✅ Save result analysis:', {
        success: saveResult.success,
        hasData: !!saveResult.data,
        dataCount: saveResult.data?.length || 0,
        dataType: Array.isArray(saveResult.data) ? 'array' : typeof saveResult.data
      });

      // PASO 2: Validar datos para generación de imágenes
      if (contentType === 'ingredient') {
        if (!saveResult.data || !Array.isArray(saveResult.data) || saveResult.data.length === 0) {
          console.error('❌ No valid ingredient data for image generation:', saveResult);
          throw new Error('No se encontraron ingredientes válidos para generar imágenes');
        }

        const savedIngredients = saveResult.data;
        console.log('🔍 Saved ingredients analysis:', {
          count: savedIngredients.length,
          sampleIds: savedIngredients.slice(0, 3).map(i => ({ id: i.id, name: i.name })),
          allHaveIds: savedIngredients.every(i => !!i.id),
          allHaveNames: savedIngredients.every(i => !!i.name)
        });

        // PASO 3: Validación adicional de ingredientes
        const invalidIngredients = savedIngredients.filter(i => !i.id || !i.name);
        if (invalidIngredients.length > 0) {
          console.error('❌ Found invalid ingredients:', invalidIngredients);
          throw new Error(`${invalidIngredients.length} ingredientes no tienen ID o nombre válido`);
        }

        // PASO 4: Iniciar generación de imágenes con mejor coordinación
        console.log('🖼️ Step 4: Starting coordinated image generation...');
        
        onImageProgressUpdate({ 
          current: 0, 
          total: savedIngredients.length, 
          isGenerating: true 
        });
        
        let successCount = 0;
        let errorCount = 0;
        const imageErrors: string[] = [];
        
        for (let i = 0; i < savedIngredients.length; i++) {
          const savedIngredient = savedIngredients[i];
          
          try {
            console.log(`\n🔄 [${i + 1}/${savedIngredients.length}] Processing: ${savedIngredient.name}`);
            console.log(`📋 Ingredient data:`, {
              id: savedIngredient.id,
              name: savedIngredient.name,
              hasCreatedAt: !!savedIngredient.created_at
            });
            
            // Actualizar progreso antes de procesar
            onImageProgressUpdate({ 
              current: i, 
              total: savedIngredients.length, 
              isGenerating: true 
            });
            
            // Buscar descripción del contenido original
            const originalContent = generatedContent.find(item => 
              item.name.toLowerCase().trim() === savedIngredient.name.toLowerCase().trim()
            );
            
            console.log(`📝 Original content match:`, {
              found: !!originalContent,
              hasDescription: !!originalContent?.description
            });

            // Generar imagen con datos mejorados
            const result = await generateImage.mutateAsync({
              ingredientName: savedIngredient.name,
              description: originalContent?.description,
              ingredientId: savedIngredient.id
            });

            if (result.success) {
              console.log(`✅ [${i + 1}/${savedIngredients.length}] Image generated successfully for: ${savedIngredient.name}`);
              
              // Actualizar vista previa con la nueva imagen
              const updatedContent = generatedContent.map(item => 
                item.name.toLowerCase().trim() === savedIngredient.name.toLowerCase().trim()
                  ? { ...item, image_url: result.imageUrl, id: savedIngredient.id }
                  : item
              );
              onContentUpdated(updatedContent);
              successCount++;
            } else {
              console.error(`❌ [${i + 1}/${savedIngredients.length}] Generation failed for ${savedIngredient.name}`);
              errorCount++;
              imageErrors.push(`${savedIngredient.name}: Generation failed`);
            }
          } catch (error) {
            console.error(`❌ [${i + 1}/${savedIngredients.length}] Exception for ${savedIngredient.name}:`, error);
            errorCount++;
            imageErrors.push(`${savedIngredient.name}: ${error.message}`);
          }
          
          // Pausa coordinada entre generaciones
          if (i < savedIngredients.length - 1) {
            console.log(`⏸️ [${i + 1}/${savedIngredients.length}] Coordinated pause before next generation...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        
        // PASO 5: Finalizar proceso
        onImageProgressUpdate({ current: savedIngredients.length, total: savedIngredients.length, isGenerating: false });
        
        console.log('🎉 === ENHANCED BATCH PROCESS COMPLETED ===');
        console.log(`📊 Final results:`, {
          total: savedIngredients.length,
          successful: successCount,
          failed: errorCount,
          successRate: savedIngredients.length > 0 ? Math.round((successCount / savedIngredients.length) * 100) : 0
        });
        
        if (imageErrors.length > 0) {
          console.error('📋 Image generation errors:', imageErrors);
        }
      }
      
      // Limpiar vista previa
      onContentCleared();
      
    } catch (error) {
      console.error('❌ === CRITICAL ERROR IN ENHANCED BATCH PROCESS ===', error);
      onImageProgressUpdate({ current: 0, total: 0, isGenerating: false });
    }
  };

  const handleGenerateImageManually = async (ingredientName: string, ingredientId: string) => {
    try {
      console.log(`🔄 Generación manual de imagen para: ${ingredientName}`);
      
      const originalContent = generatedContent.find(item => item.name === ingredientName);
      
      const result = await generateImage.mutateAsync({
        ingredientName: ingredientName,
        description: originalContent?.description,
        ingredientId: ingredientId
      });

      if (result.success) {
        console.log(`✅ Imagen manual generada para: ${ingredientName}`);
        
        const updatedContent = generatedContent.map(item => 
          item.name === ingredientName 
            ? { ...item, image_url: result.imageUrl, id: ingredientId }
            : item
        );
        onContentUpdated(updatedContent);
      }
    } catch (error) {
      console.error(`❌ Error en generación manual para ${ingredientName}:`, error);
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
            onClick={handleSaveContentOnly}
            disabled={saveContent.isPending || imageGenerationProgress.isGenerating}
            variant="outline"
            size="sm"
          >
            {saveContent.isPending ? (
              <Loader className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Solo Guardar
          </Button>
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
            Guardar + Generar Imágenes
          </Button>
        </div>
      </CardHeader>
      
      <AdminImageGenerationProgress {...imageGenerationProgress} />
      
      <CardContent>
        {contentType === 'ingredient' && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <AlertTriangle className="h-4 w-4" />
              <span><strong>FLUJO MEJORADO:</strong> Puedes guardar solo el contenido o guardar + generar imágenes automáticamente</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {generatedContent.map((item, index) => {
            if (contentType === 'ingredient') {
              return (
                <div key={index} className="relative">
                  <AdminIngredientPreviewCard 
                    ingredient={item}
                    index={index}
                  />
                  {item.id && (
                    <div className="mt-2 flex justify-end">
                      <Button
                        onClick={() => handleGenerateImageManually(item.name, item.id)}
                        disabled={generateImage.isPending}
                        variant="outline"
                        size="sm"
                      >
                        {generateImage.isPending ? (
                          <Loader className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        Generar Imagen
                      </Button>
                    </div>
                  )}
                </div>
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
