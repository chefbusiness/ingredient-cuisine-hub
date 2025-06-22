
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGenerateImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ingredientName, description, ingredientId }: { 
      ingredientName: string; 
      description?: string;
      ingredientId?: string;
    }) => {
      console.log('🖼️ === STARTING IMAGE GENERATION ===');
      console.log('📋 Parameters:', { ingredientName, ingredientId });
      
      if (!ingredientId) {
        console.error('❌ No ingredient ID provided');
        throw new Error('ID del ingrediente es requerido para generar imagen');
      }

      // Verificar que el ingrediente existe
      console.log('🔍 Verifying ingredient exists...');
      const { data: existingIngredient, error: checkError } = await supabase
        .from('ingredients')
        .select('id, name, image_url')
        .eq('id', ingredientId)
        .single();
      
      if (checkError || !existingIngredient) {
        console.error('❌ Ingredient not found:', checkError);
        throw new Error('Ingrediente no encontrado en la base de datos');
      }
      
      console.log('✅ Ingredient found:', { id: existingIngredient.id, name: existingIngredient.name });
      
      // Llamar a la función de generación de imagen
      console.log('📤 Calling generate-image function...');
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          ingredientName: ingredientName,
          name: ingredientName,
          description: description 
        }
      });

      console.log('📥 Generate-image response:', { 
        success: data?.success, 
        hasImageUrl: !!data?.imageUrl,
        error 
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(`Error de función: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error('❌ Function reported error:', data?.error);
        throw new Error(data?.error || 'Error generating image');
      }

      if (!data.imageUrl) {
        console.error('❌ No image URL received');
        throw new Error('No se recibió URL de imagen');
      }
      
      console.log('✅ Image URL received:', data.imageUrl.substring(0, 50) + '...');
      
      // Actualizar ingrediente con la nueva imagen (simplificado)
      console.log('💾 Updating ingredient with new image...');
      const { error: updateError, count } = await supabase
        .from('ingredients')
        .update({ 
          image_url: data.imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', ingredientId);

      if (updateError) {
        console.error('❌ Error updating ingredient:', updateError);
        throw new Error(`Error guardando imagen: ${updateError.message}`);
      }

      // Verificar que se actualizó al menos un registro
      if (count === 0) {
        console.error('❌ No records were updated');
        throw new Error('No se pudo actualizar el ingrediente - no se encontró el registro');
      }

      console.log('✅ Ingredient updated successfully:', {
        ingredientId,
        count,
        imageUrl: data.imageUrl.substring(0, 50) + '...'
      });

      return {
        success: true,
        imageUrl: data.imageUrl,
        ingredientId: ingredientId,
        ingredientName: ingredientName
      };
    },
    onSuccess: (data) => {
      console.log('🎉 Image generation mutation success');
      
      // Invalidar queries para refrescar la UI
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['ingredient'] });
      
      if (data.ingredientId) {
        queryClient.refetchQueries({ queryKey: ['ingredient', data.ingredientId] });
      }
      
      toast({
        title: "🎉 Imagen generada exitosamente",
        description: `Imagen creada para ${data.ingredientName}`,
      });
    },
    onError: (error) => {
      console.error('❌ Image generation mutation error:', error);
      toast({
        title: "❌ Error al generar imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
