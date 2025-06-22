import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUpdateIngredient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      console.log('🔥 === MUTATION FUNCTION STARTED ===');
      console.log('📋 Ingredient ID:', id);
      console.log('📋 Raw updates received:', updates);
      
      if (!id) {
        console.error('❌ No ID provided to mutation');
        throw new Error('ID del ingrediente es requerido');
      }

      // Verificar que el ingrediente existe antes de actualizar
      console.log('🔍 Checking if ingredient exists...');
      const { data: existing, error: checkError } = await supabase
        .from('ingredients')
        .select('*')
        .eq('id', id)
        .single();

      if (checkError) {
        console.error('❌ Error checking existing ingredient:', checkError);
        throw new Error(`No se pudo verificar el ingrediente: ${checkError.message}`);
      }

      if (!existing) {
        console.error('❌ Ingredient not found with ID:', id);
        throw new Error('Ingrediente no encontrado');
      }

      console.log('📋 Current values in DB:', existing);

      // Preparar datos de actualización, excluyendo campos que no deben cambiarse
      const updateData = {
        name: updates.name,
        name_en: updates.name_en,
        name_la: updates.name_la,
        name_fr: updates.name_fr,
        name_it: updates.name_it,
        name_pt: updates.name_pt,
        name_zh: updates.name_zh,
        description: updates.description,
        category_id: updates.category_id,
        temporada: updates.temporada,
        origen: updates.origen,
        merma: parseFloat(updates.merma) || 0,
        rendimiento: parseFloat(updates.rendimiento) || 100,
        popularity: parseInt(updates.popularity) || 0,
        image_url: updates.image_url,
        real_image_url: updates.real_image_url,
        updated_at: new Date().toISOString()
      };

      console.log('💾 === EXECUTING SUPABASE UPDATE ===');
      console.log('Update data to send:', updateData);

      // Ejecutar la actualización
      const { data, error } = await supabase
        .from('ingredients')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      console.log('📤 Supabase update response:', {
        hasError: !!error,
        hasData: !!data,
        errorDetails: error
      });

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw new Error(`Error actualizando ingrediente: ${error.message}`);
      }

      if (!data) {
        console.error('❌ No data returned from update');
        throw new Error('No se recibieron datos después de la actualización');
      }

      console.log('✅ Database update successful:', data);

      return { 
        id, 
        updates: updateData, 
        data: data
      };
    },
    onSuccess: (result) => {
      console.log('🎉 === MUTATION SUCCESS ===');
      console.log('Result:', result);
      
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['ingredient', result.id] });
      
      toast({
        title: "✅ Ingrediente actualizado",
        description: "Los cambios se han guardado correctamente en la base de datos",
      });
    },
    onError: (error) => {
      console.error('❌ === MUTATION ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
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
