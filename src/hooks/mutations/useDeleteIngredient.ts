
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDeleteIngredient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Iniciando eliminación del ingrediente:', id);
      
      // Verificar que el ingrediente existe
      const { data: ingredient, error: fetchError } = await supabase
        .from('ingredients')
        .select('id, name')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('❌ Error al verificar ingrediente:', fetchError);
        throw new Error(`No se pudo encontrar el ingrediente: ${fetchError.message}`);
      }

      if (!ingredient) {
        throw new Error('El ingrediente no existe');
      }

      console.log('✅ Ingrediente encontrado:', ingredient.name);

      // Eliminar usando una función RPC para asegurar atomicidad
      const { data: result, error: deleteError } = await supabase
        .rpc('delete_ingredient_cascade', { ingredient_id: id });

      if (deleteError) {
        console.error('❌ Error en eliminación RPC:', deleteError);
        throw new Error(`Error al eliminar el ingrediente: ${deleteError.message}`);
      }

      console.log('✅ Eliminación completada exitosamente');
      return { id, name: ingredient.name };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      toast({
        title: "Ingrediente eliminado",
        description: `"${data.name}" y todos sus datos relacionados han sido eliminados correctamente`,
      });
    },
    onError: (error) => {
      console.error('💥 Error completo en eliminación:', error);
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
