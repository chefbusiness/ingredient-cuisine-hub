
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader, Wand2, Save, Eye, Image, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { useGenerateContent, useGenerateImage, useSaveContent } from "@/hooks/useContentGeneration";
import { useCategories } from "@/hooks/useCategories";
import { Progress } from "@/components/ui/progress";

const AdminContentGenerator = () => {
  const [contentType, setContentType] = useState<'ingredient' | 'category' | 'price_update'>('ingredient');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [region, setRegion] = useState('España');
  const [count, setCount] = useState(5);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [imageGenerationProgress, setImageGenerationProgress] = useState({ current: 0, total: 0, isGenerating: false });

  const { data: categories = [] } = useCategories();
  const generateContent = useGenerateContent();
  const generateImage = useGenerateImage();
  const saveContent = useSaveContent();

  const handleGenerateContent = async () => {
    try {
      const result = await generateContent.mutateAsync({
        type: contentType,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        region: region,
        count: count
      });

      let processedData = result;
      if (contentType === 'ingredient' && selectedCategory !== 'all') {
        processedData = result.map((item: any) => ({
          ...item,
          category: selectedCategory
        }));
      }
      
      setGeneratedContent(processedData);
      setPreviewMode(true);
    } catch (error) {
      console.error('❌ Error generating content:', error);
    }
  };

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
        setImageGenerationProgress({ 
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
            
            setImageGenerationProgress(prev => ({ ...prev, current: i + 1 }));
            
            const originalContent = generatedContent.find(item => item.name === savedIngredient.name);
            
            const result = await generateImage.mutateAsync({
              ingredientName: savedIngredient.name,
              description: originalContent?.description,
              ingredientId: savedIngredient.id
            });

            if (result.success) {
              console.log(`✅ Image generated for: ${savedIngredient.name}`);
              
              // Actualizar vista previa con la imagen
              setGeneratedContent(prev => 
                prev.map(item => 
                  item.name === savedIngredient.name 
                    ? { ...item, image_url: result.imageUrl, id: savedIngredient.id }
                    : item
                )
              );
              successCount++;
            }
          } catch (error) {
            console.error(`❌ Error generating image for ${savedIngredient.name}:`, error);
            errorCount++;
          }
        }
        
        setImageGenerationProgress({ current: 0, total: 0, isGenerating: false });
        console.log(`🎉 Image generation completed. Success: ${successCount}, Errors: ${errorCount}`);
      }
      
      // Limpiar vista previa
      setGeneratedContent([]);
      setPreviewMode(false);
      
    } catch (error) {
      console.error('❌ Error in complete process:', error);
      setImageGenerationProgress({ current: 0, total: 0, isGenerating: false });
    }
  };

  const checkLanguageCompleteness = (item: any) => {
    const requiredLanguages = ['name_en', 'name_fr', 'name_it', 'name_pt', 'name_zh'];
    const missing = requiredLanguages.filter(lang => !item[lang]);
    return {
      isComplete: missing.length === 0,
      missing: missing,
      present: requiredLanguages.filter(lang => item[lang])
    };
  };

  const renderContentPreview = () => {
    if (!previewMode || generatedContent.length === 0) return null;

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
        
        {imageGenerationProgress.isGenerating && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Generando imágenes con Flux 1.1 Pro</span>
                <span>{imageGenerationProgress.current}/{imageGenerationProgress.total}</span>
              </div>
              <Progress 
                value={(imageGenerationProgress.current / imageGenerationProgress.total) * 100} 
                className="w-full" 
              />
            </div>
          </CardContent>
        )}
        
        <CardContent>
          <div className="space-y-4">
            {generatedContent.map((item, index) => {
              const languageStatus = contentType === 'ingredient' ? checkLanguageCompleteness(item) : null;
              
              return (
                <Card key={index} className="p-4">
                  {contentType === 'ingredient' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        
                        {/* Estado de idiomas */}
                        {languageStatus?.isComplete ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            5 idiomas completos
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Faltan {languageStatus?.missing.length} idiomas
                          </Badge>
                        )}
                        
                        {item.image_url && (
                          <Badge className="bg-green-100 text-green-800">
                            <Zap className="h-3 w-3 mr-1" />
                            Flux 1.1 Pro
                          </Badge>
                        )}
                        
                        {item.category && (
                          <Badge className="bg-purple-100 text-purple-800">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      
                      {item.image_url && (
                        <div className="flex justify-center">
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            className="w-48 h-48 object-cover rounded-lg border shadow-sm" 
                          />
                        </div>
                      )}
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm bg-gray-50 p-3 rounded-lg">
                        <div><strong>Temporada:</strong> {item.temporada}</div>
                        <div><strong>Origen:</strong> {item.origen}</div>
                        <div><strong>Merma:</strong> {item.merma}%</div>
                        <div><strong>Rendimiento:</strong> {item.rendimiento}%</div>
                      </div>
                    </div>
                  )}
                  
                  {contentType === 'category' && (
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <Badge variant="secondary" className="mt-1">{item.name_en}</Badge>
                      <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                    </div>
                  )}

                  {contentType === 'price_update' && (
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.ingredient_name}</h3>
                        <Badge>€{item.price}/kg</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.season_variation}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Generador de Contenido AI
            <Badge className="bg-green-100 text-green-800 ml-2">
              <Zap className="h-3 w-3 mr-1" />
              Flux 1.1 Pro + DeepSeek
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="contentType">Tipo de Contenido</Label>
              <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingredient">Ingredientes</SelectItem>
                  <SelectItem value="category">Categorías</SelectItem>
                  <SelectItem value="price_update">Actualización de Precios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {contentType !== 'category' && (
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="region">Región</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="España">España</SelectItem>
                  <SelectItem value="Francia">Francia</SelectItem>
                  <SelectItem value="Italia">Italia</SelectItem>
                  <SelectItem value="México">México</SelectItem>
                  <SelectItem value="Argentina">Argentina</SelectItem>
                  <SelectItem value="Colombia">Colombia</SelectItem>
                  <SelectItem value="Perú">Perú</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="count">Cantidad</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <Button 
            onClick={handleGenerateContent}
            disabled={generateContent.isPending}
            className="w-full"
          >
            {generateContent.isPending ? (
              <Loader className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Wand2 className="h-4 w-4 mr-2" />
            )}
            Generar Contenido con DeepSeek AI
          </Button>

          {contentType === 'ingredient' && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Zap className="h-4 w-4" />
                <span><strong>FLUJO OPTIMIZADO:</strong> Genera contenido → Guarda en DB → Genera imágenes automáticamente con Flux 1.1 Pro</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {renderContentPreview()}
    </div>
  );
};

export default AdminContentGenerator;
