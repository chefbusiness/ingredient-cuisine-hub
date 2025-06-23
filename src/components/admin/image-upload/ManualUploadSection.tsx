
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUploadRealImage } from "@/hooks/useRealImages";
import ImageEntryForm, { ImageEntry } from "./ImageEntryForm";

interface ManualUploadSectionProps {
  ingredientId: string;
  ingredientName: string;
  onImageUploaded: () => void;
}

const ManualUploadSection = ({ ingredientId, ingredientName, onImageUploaded }: ManualUploadSectionProps) => {
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>([
    { id: '1', url: '', caption: '', category: 'general' }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const uploadRealImage = useUploadRealImage();

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

  return (
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
            <ImageEntryForm
              key={entry.id}
              entry={entry}
              index={index}
              canRemove={imageEntries.length > 1}
              onUpdate={updateImageEntry}
              onRemove={removeImageEntry}
            />
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
  );
};

export default ManualUploadSection;
