
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUpdateIngredient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      console.log('🔄 Starting ingredient update mutation:', {
        id,
        updates: Object.keys(updates),
        name: updates.name,
        imageUrl: updates.image_url?.substring(0, 50) + '...'
      });

      const { data, error, count } = await supabase
        .from('ingredients')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Error updating ingredient:', error);
        throw error;
      }

      console.log('✅ Database update result:', {
        count,
        updatedData: data?.[0] ? {
          id: data[0].id,
          name: data[0].name,
          imageUrl: data[0].image_url?.substring(0, 50) + '...'
        } : null
      });

      if (count === 0) {
        console.error('❌ No records were updated');
        throw new Error('No se pudo actualizar el ingrediente - no se encontró el registro');
      }

      return { id, updates, count, data };
    },
    onSuccess: (result) => {
      console.log('🎉 Update mutation success:', {
        id: result.id,
        count: result.count
      });
      
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      toast({
        title: "✅ Ingrediente actualizado",
        description: "Los cambios se han guardado correctamente",
      });
    },
    onError: (error) => {
      console.error('❌ Update mutation error:', error);
      toast({
        title: "❌ Error al actualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteIngredient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // Primero eliminamos las dependencias en orden
      const deletions = [
        supabase.from('ingredient_prices').delete().eq('ingredient_id', id),
        supabase.from('ingredient_uses').delete().eq('ingredient_id', id),
        supabase.from('ingredient_recipes').delete().eq('ingredient_id', id),
        supabase.from('ingredient_varieties').delete().eq('ingredient_id', id),
        supabase.from('nutritional_info').delete().eq('ingredient_id', id),
        supabase.from('ingredient_real_images').delete().eq('ingredient_id', id),
      ];

      for (const deletion of deletions) {
        const { error } = await deletion;
        if (error) {
          console.error('Error deleting related data:', error);
        }
      }

      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting ingredient:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      toast({
        title: "Ingrediente eliminado",
        description: "El ingrediente y todos sus datos relacionados han sido eliminados",
      });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
