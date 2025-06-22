
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Check, Search, Plus, Trash2, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUploadRealImage } from "@/hooks/useRealImages";
import { useResearchRealImages } from "@/hooks/useResearchRealImages";

interface ImageUploadSectionProps {
  ingredientId: string;
  ingredientName?: string;
  onImageUploaded: () => void;
}

interface ImageEntry {
  id: string;
  url: string;
  caption: string;
  category: string;
}

const ImageUploadSection = ({ ingredientId, ingredientName = "", onImageUploaded }: ImageUploadSectionProps) => {
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>([
    { id: '1', url: '', caption: '', category: 'general' }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const uploadRealImage = useUploadRealImage();
  const researchMutation = useResearchRealImages();

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'crudo', label: 'Crudo' },
    { value: 'cocinado', label: 'Cocinado' },
    { value: 'cortado', label: 'Cortado' },
    { value: 'entero', label: 'Entero' },
    { value: 'variedad', label: 'Variedad' }
  ];

  const addImageEntry = () => {
    if (imageEntries.length < 6) {
      setImageEntries([
        ...imageEntries,
        { id: Date.now().toString(), url: '', caption: '', category: 'general' }
      ]);
    }
  };

  const removeImageEntry = (id: string) => {
    if (imageEntries.length > 1) {
      setImageEntries(imageEntries.filter(entry => entry.id !== id));
    }
  };

  const updateImageEntry = (id: string, field: keyof ImageEntry, value: string) => {
    setImageEntries(imageEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleManualUpload = async () => {
    const validEntries = imageEntries.filter(entry => entry.url.trim());
    
    if (validEntries.length === 0) {
      toast({
        title: "Error",
        description: "Por favor ingresa al menos una URL de imagen",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      let successCount = 0;
      
      for (const entry of validEntries) {
        try {
          await uploadRealImage.mutateAsync({
            ingredient_id: ingredientId,
            image_url: entry.url.trim(),
            caption: entry.caption.trim() || `${ingredientName} - ${entry.category}`,
            uploaded_by: 'admin_manual',
            is_approved: true,
          });
          successCount++;
        } catch (error) {
          console.error('Error uploading image:', entry.url, error);
        }
      }

      if (successCount > 0) {
        toast({
          title: "Imágenes subidas",
          description: `${successCount}/${validEntries.length} imágenes agregadas exitosamente`,
        });
        
        // Reset form
        setImageEntries([{ id: '1', url: '', caption: '', category: 'general' }]);
        onImageUploaded();
      } else {
        toast({
          title: "Error",
          description: "No se pudo subir ninguna imagen",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al subir las imágenes",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAIResearch = async () => {
    try {
      await researchMutation.mutateAsync({
        ingredientIds: ingredientId,
        mode: 'single'
      });
      onImageUploaded();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Research Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Investigación AI de Imágenes Reales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Usa DeepSeek AI para buscar automáticamente 4-6 imágenes reales de <strong>{ingredientName}</strong> en internet.
            </p>
            <Button 
              onClick={handleAIResearch}
              disabled={researchMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {researchMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Investigando imágenes...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar Imágenes Reales con AI
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-green-600" />
            Upload Manual de Imágenes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {imageEntries.map((entry, index) => (
              <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    <span className="font-medium">Imagen {index + 1}</span>
                  </div>
                  {imageEntries.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeImageEntry(entry.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`url-${entry.id}`}>URL de la Imagen</Label>
                    <Input
                      id={`url-${entry.id}`}
                      value={entry.url}
                      onChange={(e) => updateImageEntry(entry.id, 'url', e.target.value)}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`category-${entry.id}`}>Categoría</Label>
                    <select
                      id={`category-${entry.id}`}
                      value={entry.category}
                      onChange={(e) => updateImageEntry(entry.id, 'category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`caption-${entry.id}`}>Descripción (opcional)</Label>
                  <Input
                    id={`caption-${entry.id}`}
                    value={entry.caption}
                    onChange={(e) => updateImageEntry(entry.id, 'caption', e.target.value)}
                    placeholder="Descripción de la imagen..."
                  />
                </div>

                {/* Image Preview */}
                {entry.url && (
                  <div className="mt-3">
                    <Label>Vista previa:</Label>
                    <div className="mt-2">
                      <img
                        src={entry.url}
                        alt="Vista previa"
                        className="w-full h-32 object-cover rounded-md border"
                        onError={() => {
                          toast({
                            title: "Error",
                            description: "No se pudo cargar la imagen desde esa URL",
                            variant: "destructive",
                          });
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {imageEntries.length < 6 && (
              <Button
                type="button"
                variant="outline"
                onClick={addImageEntry}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Añadir Imagen ({imageEntries.length}/6)
              </Button>
            )}
          </div>

          <Button 
            onClick={handleManualUpload}
            disabled={isUploading || !imageEntries.some(entry => entry.url.trim())}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Subiendo imágenes...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Subir {imageEntries.filter(e => e.url.trim()).length} Imagen(es)
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUploadSection;
