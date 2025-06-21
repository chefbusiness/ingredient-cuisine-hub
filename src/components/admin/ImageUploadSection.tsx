
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadSectionProps {
  ingredientId: string;
  onImageUploaded: () => void;
}

const ImageUploadSection = ({ ingredientId, onImageUploaded }: ImageUploadSectionProps) => {
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!imageUrl.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una URL de imagen",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Por ahora guardamos directamente en la base de datos
      // En el futuro se podría integrar con Supabase Storage
      const response = await fetch('/api/upload-real-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredientId,
          imageUrl: imageUrl.trim(),
          caption: caption.trim(),
          uploadedBy: 'admin', // Por ahora hardcodeado
          isApproved: true, // Admin uploads son automáticamente aprobadas
        }),
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      toast({
        title: "Imagen subida",
        description: "La imagen real ha sido agregada exitosamente",
      });

      setImageUrl("");
      setCaption("");
      onImageUploaded();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al subir imagen",
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
          <Upload className="h-5 w-5" />
          Subir Imagen Real
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="imageUrl">URL de la Imagen</Label>
          <Input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="caption">Descripción (opcional)</Label>
          <Textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Descripción de la imagen..."
            className="mt-1"
            rows={2}
          />
        </div>

        {imageUrl && (
          <div className="mt-4">
            <Label>Vista previa:</Label>
            <div className="mt-2 relative">
              <img
                src={imageUrl}
                alt="Vista previa"
                className="w-full h-48 object-cover rounded-md border"
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

        <Button 
          onClick={handleUpload}
          disabled={isUploading || !imageUrl.trim()}
          className="w-full"
        >
          {isUploading ? "Subiendo..." : "Subir Imagen Real"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImageUploadSection;
