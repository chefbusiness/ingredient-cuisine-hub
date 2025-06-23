import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";

export interface RealImage {
  id: string;
  ingredient_id: string;
  image_url: string;
  caption?: string;
  uploaded_by?: string;
  is_approved: boolean;
  votes_count: number;
  created_at: string;
}

export const useRealImages = (ingredientId: string) => {
  const { isSuperAdmin } = useSuperAdmin();

  return useQuery({
    queryKey: ['real-images', ingredientId, isSuperAdmin],
    queryFn: async () => {
      // For super admins, show all images. For regular users, only approved ones
      const query = supabase
        .from('ingredient_real_images')
        .select('*')
        .eq('ingredient_id', ingredientId)
        .order('votes_count', { ascending: false });

      // Only filter by approval for non-admin users
      if (!isSuperAdmin) {
        query.eq('is_approved', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching real images:', error);
        throw error;
      }

      console.log(`📸 Loaded ${data?.length || 0} real images for ingredient ${ingredientId} (admin: ${isSuperAdmin})`);
      return data || [];
    },
    enabled: !!ingredientId,
  });
};

export const useUploadRealImage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageData: {
      ingredient_id: string;
      image_url: string;
      caption?: string;
      uploaded_by?: string;
      is_approved?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('ingredient_real_images')
        .insert(imageData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Imagen subida",
        description: "La imagen real ha sido agregada exitosamente",
      });
      queryClient.invalidateQueries({ 
        queryKey: ['real-images', data.ingredient_id] 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al subir imagen",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateIngredientRealImage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, real_image_url }: { id: string; real_image_url: string }) => {
      const { data, error } = await supabase
        .from('ingredients')
        .update({ real_image_url })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Imagen principal actualizada",
        description: "Se ha establecido la nueva imagen principal",
      });
      queryClient.invalidateQueries({ 
        queryKey: ['ingredient', data.id] 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar imagen principal",
        variant: "destructive",
      });
    },
  });
};
