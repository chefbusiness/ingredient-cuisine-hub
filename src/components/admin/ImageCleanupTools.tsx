
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, CheckCircle, XCircle, AlertTriangle, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDeleteRealImage } from "@/hooks/useDeleteRealImage";
import { useApproveRealImage } from "@/hooks/useApproveRealImage";
import RealImagesGallery from "@/components/RealImagesGallery";

const ImageCleanupTools = () => {
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [showUnapproved, setShowUnapproved] = useState(true);
  
  const deleteImage = useDeleteRealImage();
  const approveImage = useApproveRealImage();

  // Get ingredients with unapproved images
  const { data: ingredientsWithImages = [], isLoading } = useQuery({
    queryKey: ['ingredients-with-unapproved-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select(`
          id,
          name,
          ingredient_real_images!inner(
            id,
            is_approved,
            created_at
          )
        `)
        .eq('ingredient_real_images.is_approved', false);

      if (error) throw error;

      // Group by ingredient and count unapproved images
      const grouped = data.reduce((acc: any[], item) => {
        const existing = acc.find(i => i.id === item.id);
        if (existing) {
          existing.unapproved_count++;
        } else {
          acc.push({
            id: item.id,
            name: item.name,
            unapproved_count: 1
          });
        }
        return acc;
      }, []);

      return grouped.sort((a, b) => b.unapproved_count - a.unapproved_count);
    },
  });

  const handleBulkApprove = async (ingredientId: string, approved: boolean) => {
    try {
      const { data: images } = await supabase
        .from('ingredient_real_images')
        .select('id')
        .eq('ingredient_id', ingredientId)
        .eq('is_approved', false);

      if (images) {
        for (const image of images) {
          await approveImage.mutateAsync({ imageId: image.id, approved });
        }
      }
    } catch (error) {
      console.error('Error in bulk approve:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Herramientas de Limpieza de Imágenes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Cargando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Herramientas de Limpieza de Imágenes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Gestiona imágenes no aprobadas y elimina contenido irrelevante de forma masiva.
          </div>

          {ingredientsWithImages.length === 0 ? (
            <div className="text-center py-8 text-green-600">
              <CheckCircle className="h-12 w-12 mx-auto mb-2" />
              <p className="font-medium">¡Todas las imágenes están revisadas!</p>
              <p className="text-sm">No hay imágenes pendientes de aprobación.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {ingredientsWithImages.length} ingredientes con imágenes pendientes
                </span>
              </div>

              <div className="grid gap-2 max-h-60 overflow-y-auto">
                {ingredientsWithImages.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${
                      selectedIngredient === ingredient.id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedIngredient(ingredient.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{ingredient.name}</span>
                      <Badge variant="destructive" className="text-xs">
                        {ingredient.unapproved_count} pendientes
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBulkApprove(ingredient.id, true);
                        }}
                        disabled={approveImage.isPending}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aprobar Todas
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBulkApprove(ingredient.id, false);
                        }}
                        disabled={approveImage.isPending}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Rechazar Todas
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Ingredient Gallery */}
      {selectedIngredient && (
        <Card>
          <CardHeader>
            <CardTitle>
              Revisar Imágenes: {ingredientsWithImages.find(i => i.id === selectedIngredient)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RealImagesGallery 
              ingredientId={selectedIngredient}
              isAdmin={true}
              maxImages={12}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageCleanupTools;
