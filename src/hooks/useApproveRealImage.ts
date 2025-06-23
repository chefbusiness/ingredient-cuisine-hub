
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useApproveRealImage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageId, approved }: { imageId: string; approved: boolean }) => {
      console.log(`🔄 ${approved ? 'Approving' : 'Rejecting'} image: ${imageId}`);
      
      const { data, error } = await supabase.rpc('update_image_approval', {
        image_id: imageId,
        approved: approved
      });

      if (error) {
        console.error('❌ Error updating approval:', error);
        throw error;
      }

      console.log('✅ Image approval updated:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.approved ? "Imagen aprobada" : "Imagen rechazada",
        description: `La imagen ha sido ${variables.approved ? 'aprobada' : 'rechazada'} exitosamente`,
      });
      
      // Invalidate queries to refresh the gallery
      if (data?.updated_image?.ingredient_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['real-images', data.updated_image.ingredient_id] 
        });
      }
    },
    onError: (error: any) => {
      console.error('❌ Approve image error:', error);
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudo actualizar el estado de la imagen",
        variant: "destructive",
      });
    },
  });
};
