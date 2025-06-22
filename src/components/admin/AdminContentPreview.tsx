
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
      console.log('💾 === GUARDANDO CONTENIDO SIN GENERAR IMÁGENES ===');
      
      await saveContent.mutateAsync({
        type: contentType,
        data: generatedContent
      });
      
      onContentCleared();
      console.log('✅ Contenido guardado exitosamente');
      
    } catch (error) {
      console.error('❌ Error guardando contenido:', error);
    }
  };

  const handleSaveContentAndGenerateImages = async () => {
    try {
      console.log('🔄 === INICIANDO PROCESO COMPLETO: GUARDAR + GENERAR IMÁGENES ===');
      
      // Paso 1: Verificar configuración de Replicate
      console.log('🔍 Paso 1: Verificando configuración de Replicate...');
      
      // Paso 2: Guardar contenido primero
      console.log('💾 Paso 2: Guardando contenido en la base de datos...');
      const saveResult = await saveContent.mutateAsync({
        type: contentType,
        data: generatedContent
      });
      
      console.log('✅ Contenido guardado exitosamente:', {
        type: contentType,
        count: saveResult.data?.length || 0
      });

      // Paso 3: Si son ingredientes, proceder con generación de imágenes
      if (contentType === 'ingredient' && saveResult.data && saveResult.data.length > 0) {
        console.log('🖼️ Paso 3: Iniciando generación automática de imágenes...');
        
        const savedIngredients = saveResult.data;
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
            console.log(`🔄 Generando imagen ${i + 1}/${savedIngredients.length} para: ${savedIngredient.name}`);
            
            onImageProgressUpdate({ 
              current: i + 1, 
              total: savedIngredients.length, 
              isGenerating: true 
            });
            
            const originalContent = generatedContent.find(item => item.name === savedIngredient.name);
            
            console.log('📋 Datos para generación:', {
              ingredientName: savedIngredient.name,
              ingredientId: savedIngredient.id,
              hasDescription: !!originalContent?.description
            });

            const result = await generateImage.mutateAsync({
              ingredientName: savedIngredient.name,
              description: originalContent?.description,
              ingredientId: savedIngredient.id
            });

            if (result.success) {
              console.log(`✅ Imagen generada exitosamente para: ${savedIngredient.name}`);
              console.log(`🔗 URL de imagen: ${result.imageUrl?.substring(0, 50)}...`);
              
              // Actualizar vista previa con la imagen
              const updatedContent = generatedContent.map(item => 
                item.name === savedIngredient.name 
                  ? { ...item, image_url: result.imageUrl, id: savedIngredient.id }
                  : item
              );
              onContentUpdated(updatedContent);
              successCount++;
            } else {
              console.error(`❌ Generación falló para ${savedIngredient.name}: No success flag`);
              errorCount++;
              imageErrors.push(`${savedIngredient.name}: Sin éxito en generación`);
            }
          } catch (error) {
            console.error(`❌ Error crítico generando imagen para ${savedIngredient.name}:`, {
              message: error.message,
              stack: error.stack
            });
            errorCount++;
            imageErrors.push(`${savedIngredient.name}: ${error.message}`);
          }
          
          // Pequeña pausa entre generaciones para evitar rate limits
          if (i < savedIngredients.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        onImageProgressUpdate({ current: 0, total: 0, isGenerating: false });
        
        console.log('🎉 === PROCESO DE GENERACIÓN DE IMÁGENES COMPLETADO ===');
        console.log(`✅ Exitosas: ${successCount}`);
        console.log(`❌ Errores: ${errorCount}`);
        
        if (imageErrors.length > 0) {
          console.error('📋 Errores de imágenes:', imageErrors);
        }
      }
      
      // Limpiar vista previa al final
      onContentCleared();
      
    } catch (error) {
      console.error('❌ === ERROR CRÍTICO EN PROCESO COMPLETO ===', {
        message: error.message,
        stack: error.stack
      });
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
