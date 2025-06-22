
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUpdateIngredient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      console.log('🔄 === STARTING INGREDIENT UPDATE MUTATION ===');
      console.log('📋 Ingredient ID:', id);
      console.log('📋 Updates to apply:', {
        name: updates.name,
        image_url: updates.image_url ? updates.image_url.substring(0, 50) + '...' : 'No change',
        real_image_url: updates.real_image_url ? updates.real_image_url.substring(0, 50) + '...' : 'No change',
        description: updates.description ? updates.description.substring(0, 100) + '...' : 'No change',
        category_id: updates.category_id,
        popularity: updates.popularity,
        merma: updates.merma,
        rendimiento: updates.rendimiento
      });

      // Verificar que el ingrediente existe antes de actualizar
      const { data: existing, error: checkError } = await supabase
        .from('ingredients')
        .select('id, name, image_url')
        .eq('id', id)
        .single();

      if (checkError) {
        console.error('❌ Error checking existing ingredient:', checkError);
        throw new Error('No se pudo verificar el ingrediente existente');
      }

      console.log('📋 Current values in DB:', {
        name: existing.name,
        image_url: existing.image_url ? existing.image_url.substring(0, 50) + '...' : 'NULL'
      });

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      console.log('💾 Final update data:', updateData);

      const { data, error, count } = await supabase
        .from('ingredients')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Database update error:', error);
        throw new Error(`Error actualizando ingrediente: ${error.message}`);
      }

      if (count === 0) {
        console.error('❌ No records were updated');
        throw new Error('No se pudo actualizar el ingrediente - no se encontró el registro');
      }

      console.log('✅ Database update successful:', {
        count,
        updatedData: data?.[0] ? {
          id: data[0].id,
          name: data[0].name,
          imageUrl: data[0].image_url ? data[0].image_url.substring(0, 50) + '...' : 'NULL'
        } : null
      });

      // Verificar que los cambios se aplicaron realmente
      const { data: verification } = await supabase
        .from('ingredients')
        .select('id, name, image_url, updated_at')
        .eq('id', id)
        .single();

      console.log('🔍 Verification check - actual values in DB:', {
        name: verification?.name,
        image_url: verification?.image_url ? verification.image_url.substring(0, 50) + '...' : 'NULL',
        updated_at: verification?.updated_at
      });

      return { id, updates: updateData, count, data, verification };
    },
    onSuccess: (result) => {
      console.log('🎉 Update mutation success - invalidating queries');
      
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['ingredient', result.id] });
      
      toast({
        title: "✅ Ingrediente actualizado",
        description: "Los cambios se han guardado correctamente en la base de datos",
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
