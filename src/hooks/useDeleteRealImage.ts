
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeletedImageInfo {
  id: string;
  ingredient_id: string;
  image_url: string;
  caption: string;
  uploaded_by: string;
}

interface DeleteImageResponse {
  success: boolean;
  deleted_image: DeletedImageInfo;
}

export const useDeleteRealImage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: string) => {
      console.log(`🗑️ Deleting real image: ${imageId}`);
      
      const { data, error } = await supabase.rpc('delete_real_image_safe', {
        image_id: imageId
      });

      if (error) {
        console.error('❌ Error deleting image:', error);
        throw error;
      }

      console.log('✅ Image deleted successfully:', data);
      return data as unknown as DeleteImageResponse;
    },
    onSuccess: (data) => {
      toast({
        title: "Imagen eliminada",
        description: "La imagen ha sido eliminada exitosamente",
      });
      
      // Invalidate queries to refresh the gallery
      if (data?.deleted_image?.ingredient_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['real-images', data.deleted_image.ingredient_id] 
        });
      }
      
      // Also invalidate ingredient query to refresh main image if needed
      queryClient.invalidateQueries({ 
        queryKey: ['ingredient'] 
      });
    },
    onError: (error: any) => {
      console.error('❌ Delete image error:', error);
      toast({
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar la imagen",
        variant: "destructive",
      });
    },
  });
};
