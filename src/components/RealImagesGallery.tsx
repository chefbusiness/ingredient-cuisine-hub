
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, User } from "lucide-react";
import { useRealImages } from "@/hooks/useRealImages";

interface RealImagesGalleryProps {
  ingredientId: string;
  isAdmin?: boolean;
  onSetAsMain?: (imageUrl: string) => void;
}

const RealImagesGallery = ({ 
  ingredientId, 
  isAdmin = false, 
  onSetAsMain 
}: RealImagesGalleryProps) => {
  const { data: realImages = [], isLoading } = useRealImages(ingredientId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (realImages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No hay imágenes reales disponibles aún</p>
        <p className="text-sm">¡Sé el primero en contribuir!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {realImages.map((image) => (
          <Card 
            key={image.id} 
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedImage(image.image_url)}
          >
            <CardContent className="p-0">
              <div className="aspect-square relative">
                <img
                  src={image.image_url}
                  alt={image.caption || "Imagen real del ingrediente"}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay con información */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="flex items-center justify-between text-white text-sm">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{image.votes_count}</span>
                    </div>
                    {image.uploaded_by && (
                      <Badge variant="secondary" className="text-xs">
                        {image.uploaded_by}
                      </Badge>
                    )}
                  </div>
                  
                  {isAdmin && onSetAsMain && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2 w-full text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetAsMain(image.image_url);
                      }}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Establecer como Principal
                    </Button>
                  )}
                </div>
              </div>
              
              {image.caption && (
                <div className="p-3">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {image.caption}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal para imagen ampliada */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Imagen ampliada"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4"
            onClick={() => setSelectedImage(null)}
          >
            Cerrar
          </Button>
        </div>
      )}
    </div>
  );
};

export default RealImagesGallery;
