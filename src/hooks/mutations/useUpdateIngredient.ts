
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
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error checking existing ingredient:', checkError);
        throw new Error(`No se pudo verificar el ingrediente: ${checkError.message}`);
      }

      if (!existing) {
        console.error('❌ Ingredient not found with ID:', id);
        throw new Error('Ingrediente no encontrado');
      }

      console.log('📋 Current values in DB:', existing);

      // Preparar datos de actualización
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

      // Ejecutar la actualización SIN .single() para evitar el error JSON
      const { data, error } = await supabase
        .from('ingredients')
        .update(updateData)
        .eq('id', id)
        .select('*');

      console.log('📤 Supabase update response:', {
        hasError: !!error,
        hasData: !!data,
        dataLength: data?.length || 0,
        errorDetails: error
      });

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw new Error(`Error actualizando ingrediente: ${error.message}`);
      }

      // Verificar que se actualizó al menos una fila
      if (!data || data.length === 0) {
        console.log('⚠️ No rows updated - possibly no changes detected');
        // En lugar de error, retornar los datos existentes
        return { 
          id, 
          updates: updateData, 
          data: existing,
          noChanges: true
        };
      }

      const updatedRow = data[0];
      console.log('✅ Database update successful:', updatedRow);

      return { 
        id, 
        updates: updateData, 
        data: updatedRow,
        noChanges: false
      };
    },
    onSuccess: (result) => {
      console.log('🎉 === MUTATION SUCCESS ===');
      console.log('Result:', result);
      
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['ingredient', result.id] });
      
      if (result.noChanges) {
        toast({
          title: "ℹ️ Sin cambios",
          description: "No se detectaron cambios en los datos del ingrediente",
        });
      } else {
        toast({
          title: "✅ Ingrediente actualizado",
          description: "Los cambios se han guardado correctamente en la base de datos",
        });
      }
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
