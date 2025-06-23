
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, User, Filter, X, Trash2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useRealImages, useUpdateIngredientRealImage } from "@/hooks/useRealImages";
import { useDeleteRealImage } from "@/hooks/useDeleteRealImage";
import { useApproveRealImage } from "@/hooks/useApproveRealImage";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RealImagesGalleryProps {
  ingredientId: string;
  isAdmin?: boolean;
  onSetAsMain?: (imageUrl: string) => void;
  maxImages?: number;
}

const RealImagesGallery = ({ 
  ingredientId, 
  isAdmin = false, 
  onSetAsMain,
  maxImages = 6
}: RealImagesGalleryProps) => {
  const { data: realImages = [], isLoading } = useRealImages(ingredientId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const updateMainImage = useUpdateIngredientRealImage();
  const deleteImage = useDeleteRealImage();
  const approveImage = useApproveRealImage();
  const { isSuperAdmin } = useSuperAdmin();

  const categories = [
    { value: 'all', label: 'Todas', count: realImages.length },
    { value: 'approved', label: 'Aprobadas', count: realImages.filter(img => img.is_approved).length },
    { value: 'pending', label: 'Pendientes', count: realImages.filter(img => !img.is_approved).length },
    { value: 'general', label: 'General', count: realImages.filter(img => img.caption?.includes('general')).length },
    { value: 'crudo', label: 'Crudo', count: realImages.filter(img => img.caption?.includes('crudo')).length },
    { value: 'cocinado', label: 'Cocinado', count: realImages.filter(img => img.caption?.includes('cocinado')).length },
    { value: 'cortado', label: 'Cortado', count: realImages.filter(img => img.caption?.includes('cortado')).length },
    { value: 'entero', label: 'Entero', count: realImages.filter(img => img.caption?.includes('entero')).length },
    { value: 'variedad', label: 'Variedad', count: realImages.filter(img => img.caption?.includes('variedad')).length },
  ].filter(cat => cat.value === 'all' || cat.count > 0);

  const getFilteredImages = () => {
    let filtered = realImages;
    
    if (selectedCategory === 'approved') {
      filtered = realImages.filter(img => img.is_approved);
    } else if (selectedCategory === 'pending') {
      filtered = realImages.filter(img => !img.is_approved);
    } else if (selectedCategory !== 'all') {
      filtered = realImages.filter(img => img.caption?.includes(selectedCategory));
    }
    
    return filtered.slice(0, maxImages);
  };

  const filteredImages = getFilteredImages();

  const getCategoryFromCaption = (caption: string = '') => {
    const categories = ['crudo', 'cocinado', 'cortado', 'entero', 'variedad'];
    const found = categories.find(cat => caption.toLowerCase().includes(cat));
    return found || 'general';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      crudo: 'bg-green-100 text-green-800',
      cocinado: 'bg-orange-100 text-orange-800',
      cortado: 'bg-blue-100 text-blue-800',
      entero: 'bg-purple-100 text-purple-800',
      variedad: 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getSourceInfo = (uploadedBy: string = '') => {
    const aiSources = ['ai_research', 'perplexity_research', 'ai_generated', 'perplexity_sonar'];
    const isAI = aiSources.some(source => uploadedBy.toLowerCase().includes(source));
    
    return {
      isAI,
      label: isAI ? 'AI' : 'Manual',
      color: isAI ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
    };
  };

  const handleSetAsMain = async (imageUrl: string) => {
    if (!onSetAsMain) return;
    
    try {
      await updateMainImage.mutateAsync({
        id: ingredientId,
        real_image_url: imageUrl
      });
      onSetAsMain(imageUrl);
    } catch (error) {
      console.error('Error setting main image:', error);
    }
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;
    
    try {
      await deleteImage.mutateAsync(imageToDelete);
      setImageToDelete(null);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleApproveImage = async (imageId: string, approved: boolean) => {
    try {
      await approveImage.mutateAsync({ imageId, approved });
    } catch (error) {
      console.error('Error updating approval:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (realImages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="font-medium">No hay imágenes reales disponibles</p>
        <p className="text-sm">¡Sé el primero en contribuir con imágenes reales!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Filter className="h-3 w-3" />
            Filtrar:
          </div>
          {categories.map((category) => (
            <Badge
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label} ({category.count})
            </Badge>
          ))}
        </div>
      )}

      {/* Images Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredImages.map((image) => {
          const category = getCategoryFromCaption(image.caption);
          const sourceInfo = getSourceInfo(image.uploaded_by);
          
          return (
            <Card 
              key={image.id} 
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => setSelectedImage(image.image_url)}
            >
              <CardContent className="p-0">
                <div className="aspect-square relative group">
                  <img
                    src={image.image_url}
                    alt={image.caption || "Imagen real del ingrediente"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn('❌ Image failed to load:', image.image_url);
                      e.currentTarget.style.opacity = '0.5';
                      e.currentTarget.style.filter = 'grayscale(100%)';
                    }}
                  />
                  
                  {/* Status Indicators */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {!image.is_approved && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-2 w-2 mr-1" />
                        Pendiente
                      </Badge>
                    )}
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${sourceInfo.color}`}
                    >
                      {sourceInfo.label}
                    </Badge>
                  </div>
                  
                  {/* Admin Controls Overlay */}
                  {isAdmin && isSuperAdmin && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1 text-white">
                            <Heart className="h-3 w-3" />
                            <span className="text-xs">{image.votes_count}</span>
                          </div>
                          
                          <Badge className={`text-xs ${getCategoryColor(category)}`}>
                            {category}
                          </Badge>
                        </div>
                        
                        {/* Management Buttons */}
                        <div className="grid grid-cols-2 gap-1">
                          {onSetAsMain && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetAsMain(image.image_url);
                              }}
                              disabled={updateMainImage.isPending}
                            >
                              <Star className="h-3 w-3 mr-1" />
                              Principal
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageToDelete(image.id);
                            }}
                            disabled={deleteImage.isPending}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                        
                        {/* Approval Buttons */}
                        <div className="grid grid-cols-2 gap-1">
                          <Button
                            size="sm"
                            variant={image.is_approved ? "default" : "outline"}
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveImage(image.id, true);
                            }}
                            disabled={approveImage.isPending}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Aprobar
                          </Button>
                          
                          <Button
                            size="sm"
                            variant={!image.is_approved ? "default" : "outline"}
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveImage(image.id, false);
                            }}
                            disabled={approveImage.isPending}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
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
          );
        })}
      </div>

      {/* Show more images indicator */}
      {realImages.length > maxImages && filteredImages.length === maxImages && (
        <div className="text-center py-4">
          <Badge variant="outline">
            +{realImages.length - maxImages} imágenes más disponibles
          </Badge>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!imageToDelete} onOpenChange={() => setImageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la imagen de la base de datos. 
              Esta operación no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteImage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar imagen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal para imagen ampliada */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Imagen ampliada"
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                console.warn('❌ Modal image failed to load:', selectedImage);
                e.currentTarget.style.opacity = '0.5';
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealImagesGallery;
