
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDeleteDuplicateIngredient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('🔍 Buscando duplicados de "Aceite de Oliva Virgen Extra"...');
      
      // Find duplicates of "Aceite de Oliva Virgen Extra"
      const { data: duplicates, error: fetchError } = await supabase
        .from('ingredients')
        .select('id, name, created_at')
        .eq('name', 'Aceite de Oliva Virgen Extra')
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('❌ Error al buscar duplicados:', fetchError);
        throw new Error(`Error al buscar duplicados: ${fetchError.message}`);
      }

      if (!duplicates || duplicates.length <= 1) {
        throw new Error('No se encontraron duplicados para eliminar');
      }

      console.log(`✅ Encontrados ${duplicates.length} duplicados`);
      
      // Delete the older one (first in the ordered list)
      const toDelete = duplicates[0];
      console.log('🗑️ Eliminando el más antiguo:', toDelete);

      const { data: result, error: deleteError } = await supabase
        .rpc('delete_ingredient_cascade', { ingredient_id: toDelete.id });

      if (deleteError) {
        console.error('❌ Error en eliminación:', deleteError);
        throw new Error(`Error al eliminar duplicado: ${deleteError.message}`);
      }

      console.log('✅ Duplicado eliminado exitosamente');
      return { deletedId: toDelete.id, deletedName: toDelete.name };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      toast({
        title: "Duplicado eliminado",
        description: `Se eliminó el duplicado más antiguo de "${data.deletedName}"`,
      });
    },
    onError: (error) => {
      console.error('💥 Error en eliminación de duplicado:', error);
      toast({
        title: "Error al eliminar duplicado",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
