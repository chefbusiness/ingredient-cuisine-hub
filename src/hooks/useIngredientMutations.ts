
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

      // Log each field being updated
      Object.keys(updates).forEach(key => {
        const value = updates[key];
        if (key.includes('image_url')) {
          console.log(`📝 ${key}:`, value ? value.substring(0, 50) + '...' : 'EMPTY');
        } else if (key === 'description') {
          console.log(`📝 ${key}:`, value ? value.substring(0, 100) + '...' : 'EMPTY');
        } else {
          console.log(`📝 ${key}:`, value);
        }
      });

      // Verificar que el ingrediente existe antes de actualizar
      console.log('🔍 Checking if ingredient exists...');
      const { data: existing, error: checkError } = await supabase
        .from('ingredients')
        .select('id, name, image_url, description, category_id, popularity, merma, rendimiento')
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

      console.log('📋 Current values in DB:', {
        id: existing.id,
        name: existing.name,
        image_url: existing.image_url ? existing.image_url.substring(0, 50) + '...' : 'NULL',
        description: existing.description ? existing.description.substring(0, 100) + '...' : 'NULL',
        category_id: existing.category_id,
        popularity: existing.popularity,
        merma: existing.merma,
        rendimiento: existing.rendimiento
      });

      // Prepare final update data
      const finalUpdateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      console.log('💾 === EXECUTING SUPABASE UPDATE ===');
      console.log('Final update data:', {
        name: finalUpdateData.name,
        image_url: finalUpdateData.image_url ? finalUpdateData.image_url.substring(0, 50) + '...' : 'EMPTY',
        description: finalUpdateData.description ? finalUpdateData.description.substring(0, 100) + '...' : 'EMPTY',
        category_id: finalUpdateData.category_id,
        popularity: finalUpdateData.popularity,
        merma: finalUpdateData.merma,
        rendimiento: finalUpdateData.rendimiento,
        updated_at: finalUpdateData.updated_at
      });

      // FIX: Usar maybeSingle() en lugar de single() para manejar el caso de 0 filas
      const { data, error } = await supabase
        .from('ingredients')
        .update(finalUpdateData)
        .eq('id', id)
        .select()
        .maybeSingle();

      console.log('📤 Supabase update response:', {
        hasError: !!error,
        hasData: !!data,
        errorDetails: error
      });

      if (error) {
        console.error('❌ Supabase update error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Error actualizando ingrediente: ${error.message}`);
      }

      // Con maybeSingle(), data puede ser null si no se encontró registro
      if (!data) {
        console.error('❌ No data returned from update - no matching record found or no changes made');
        
        // Intentar verificar si el registro aún existe
        const { data: stillExists, error: existsError } = await supabase
          .from('ingredients')
          .select('id, name')
          .eq('id', id)
          .maybeSingle();
        
        if (existsError) {
          console.error('❌ Error checking if record still exists:', existsError);
        } else if (!stillExists) {
          console.error('❌ Record no longer exists in database');
          throw new Error('El ingrediente ya no existe en la base de datos');
        } else {
          console.log('✅ Record still exists, but update had no effect');
          console.log('📋 Record that still exists:', stillExists);
          throw new Error('La actualización no tuvo efecto. Es posible que no haya cambios o que haya un problema de permisos.');
        }
      }

      console.log('✅ Database update successful:', {
        id: data.id,
        name: data.name,
        image_url: data.image_url ? data.image_url.substring(0, 50) + '...' : 'NULL',
        description: data.description ? data.description.substring(0, 100) + '...' : 'NULL',
        category_id: data.category_id,
        popularity: data.popularity,
        merma: data.merma,
        rendimiento: data.rendimiento,
        updated_at: data.updated_at
      });

      return { 
        id, 
        updates: finalUpdateData, 
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
