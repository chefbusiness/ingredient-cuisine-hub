
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUpdateIngredient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error, count } = await supabase
        .from('ingredients')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating ingredient:', error);
        throw error;
      }

      if (count === 0) {
        console.error('No records were updated');
        throw new Error('No se pudo actualizar el ingrediente - no se encontró el registro');
      }

      return { id, updates, count };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      toast({
        title: "Ingrediente actualizado",
        description: "Los cambios se han guardado correctamente",
      });
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: "Error al actualizar",
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

      // Ejecutamos todas las eliminaciones de dependencias
      for (const deletion of deletions) {
        const { error } = await deletion;
        if (error) {
          console.error('Error deleting related data:', error);
          // Continuamos aunque falle alguna dependencia
        }
      }

      // Finalmente eliminamos el ingrediente
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
