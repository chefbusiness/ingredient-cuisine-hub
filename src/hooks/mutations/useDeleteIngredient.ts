
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeleteIngredientResult {
  success: boolean;
  ingredient_name: string;
  ingredient_id: string;
  deleted_counts: {
    prices: number;
    uses: number;
    recipes: number;
    varieties: number;
    nutritional_info: number;
    images: number;
  };
}

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
        .rpc('delete_ingredient_cascade', { ingredient_id: id }) as { 
          data: DeleteIngredientResult | null, 
          error: any 
        };

      if (deleteError) {
        console.error('❌ Error en eliminación RPC:', deleteError);
        throw new Error(`Error al eliminar el ingrediente: ${deleteError.message}`);
      }

      if (!result) {
        throw new Error('No se recibió respuesta de la eliminación');
      }

      console.log('✅ Eliminación completada exitosamente');
      console.log('📊 Estadísticas de eliminación:', result.deleted_counts);
      
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
