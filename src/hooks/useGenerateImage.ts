
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGenerateImage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ingredientName, description, ingredientId }: { 
      ingredientName: string; 
      description?: string;
      ingredientId?: string;
    }) => {
      console.log('🖼️ === STARTING IMAGE GENERATION AND AUTO-SAVE ===');
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
        .maybeSingle();
      
      if (checkError) {
        console.error('❌ Error checking ingredient:', checkError);
        throw new Error(`Error verificando ingrediente: ${checkError.message}`);
      }
      
      if (!existingIngredient) {
        console.error('❌ Ingredient not found with ID:', ingredientId);
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
        throw new Error(`Error en la función: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error('❌ Function reported error:', data?.error);
        throw new Error(data?.error || 'Error generando imagen');
      }

      if (!data.imageUrl) {
        console.error('❌ No image URL received');
        throw new Error('No se recibió URL de imagen');
      }
      
      console.log('✅ Image URL received, now saving to database...');
      
      // GUARDAR AUTOMÁTICAMENTE EN LA BASE DE DATOS - SIN .single()
      const { data: updateResult, error: updateError } = await supabase
        .from('ingredients')
        .update({ 
          image_url: data.imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', ingredientId)
        .select('*');

      if (updateError) {
        console.error('❌ Error saving image URL to database:', updateError);
        throw new Error(`Error guardando imagen: ${updateError.message}`);
      }

      if (!updateResult || updateResult.length === 0) {
        console.error('❌ No rows updated when saving image');
        throw new Error('No se pudo actualizar el ingrediente con la nueva imagen');
      }

      const updatedIngredient = updateResult[0];
      console.log('✅ Image URL saved to database successfully');
      
      return {
        success: true,
        imageUrl: data.imageUrl,
        ingredientId: ingredientId,
        ingredientName: ingredientName,
        savedToDatabase: true,
        updatedIngredient: updatedIngredient
      };
    },
    onSuccess: (data) => {
      console.log('🎉 Image generation and save complete success');
      
      // Invalidar queries para actualizar la UI automáticamente
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['ingredient', data.ingredientId] });
      
      toast({
        title: "✅ Imagen generada y guardada",
        description: `Nueva imagen guardada exitosamente para ${data.ingredientName}`,
      });
    },
    onError: (error) => {
      console.error('❌ Image generation error:', error);
      toast({
        title: "❌ Error al generar imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
