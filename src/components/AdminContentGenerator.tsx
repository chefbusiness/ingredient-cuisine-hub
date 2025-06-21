
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader, Wand2, Save, Eye, Image } from "lucide-react";
import { useGenerateContent, useGenerateImage, useSaveGeneratedContent } from "@/hooks/useContentGeneration";
import { useCategories } from "@/hooks/useCategories";

const AdminContentGenerator = () => {
  const [contentType, setContentType] = useState<'ingredient' | 'category' | 'price_update'>('ingredient');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [region, setRegion] = useState('España');
  const [count, setCount] = useState(1);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [imageGenerationQueue, setImageGenerationQueue] = useState<string[]>([]);

  const { data: categories = [] } = useCategories();
  const generateContent = useGenerateContent();
  const generateImage = useGenerateImage();
  const saveContent = useSaveGeneratedContent();

  const handleGenerateContent = async () => {
    try {
      const result = await generateContent.mutateAsync({
        type: contentType,
        category: selectedCategory,
        region: region,
        count: count
      });

      if (result.success) {
        setGeneratedContent(result.data);
        setPreviewMode(true);
        
        // Si son ingredientes, agregar a cola de generación de imágenes
        if (contentType === 'ingredient') {
          const ingredientNames = result.data.map((item: any) => item.name);
          setImageGenerationQueue(ingredientNames);
        }
      }
    } catch (error) {
      console.error('Error generando contenido:', error);
    }
  };

  const handleGenerateImages = async () => {
    for (const ingredientName of imageGenerationQueue) {
      try {
        const ingredient = generatedContent.find(item => item.name === ingredientName);
        const result = await generateImage.mutateAsync({
          ingredientName: ingredientName,
          description: ingredient?.description
        });

        if (result.success) {
          // Actualizar el contenido generado con la URL de la imagen
          setGeneratedContent(prev => 
            prev.map(item => 
              item.name === ingredientName 
                ? { ...item, image_url: result.image_url }
                : item
            )
          );
        }
      } catch (error) {
        console.error(`Error generando imagen para ${ingredientName}:`, error);
      }
    }
    setImageGenerationQueue([]);
  };

  const handleSaveContent = async () => {
    try {
      await saveContent.mutateAsync({
        type: contentType,
        data: generatedContent
      });
      
      setGeneratedContent([]);
      setPreviewMode(false);
    } catch (error) {
      console.error('Error guardando contenido:', error);
    }
  };

  const renderContentPreview = () => {
    if (!previewMode || generatedContent.length === 0) return null;

    return (
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vista Previa del Contenido Generado
          </CardTitle>
          <div className="flex gap-2">
            {contentType === 'ingredient' && imageGenerationQueue.length > 0 && (
              <Button 
                onClick={handleGenerateImages}
                disabled={generateImage.isPending}
                variant="outline"
                size="sm"
              >
                {generateImage.isPending ? (
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Image className="h-4 w-4 mr-2" />
                )}
                Generar Imágenes
              </Button>
            )}
            <Button 
              onClick={handleSaveContent}
              disabled={saveContent.isPending}
              size="sm"
            >
              {saveContent.isPending ? (
                <Loader className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar Todo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {generatedContent.map((item, index) => (
              <Card key={index} className="p-4">
                {contentType === 'ingredient' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <Badge variant="secondary">{item.name_en}</Badge>
                      {item.popularity && (
                        <Badge variant="outline">Popularidad: {item.popularity}%</Badge>
                      )}
                    </div>
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-32 h-32 object-cover rounded" />
                    )}
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>Temporada: {item.temporada}</div>
                      <div>Origen: {item.origen}</div>
                      <div>Merma: {item.merma}%</div>
                      <div>Rendimiento: {item.rendimiento}%</div>
                    </div>
                    {item.uses && (
                      <div>
                        <strong>Usos:</strong> {item.uses.join(', ')}
                      </div>
                    )}
                  </div>
                )}
                
                {contentType === 'category' && (
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                )}
              </Card>
            ))}
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
                    <SelectItem value="">Todas las categorías</SelectItem>
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
            Generar Contenido con DeepSeek
          </Button>
        </CardContent>
      </Card>

      {renderContentPreview()}
    </div>
  );
};

export default AdminContentGenerator;
