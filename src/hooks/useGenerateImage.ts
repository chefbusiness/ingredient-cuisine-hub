
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
      console.log('🖼️ === STARTING SIMPLE IMAGE GENERATION ===');
      console.log('📋 Parameters:', { ingredientName, ingredientId });
      
      if (!ingredientId) {
        throw new Error('ID del ingrediente es requerido');
      }

      // Llamar a la función de generación de imagen
      console.log('📤 Calling generate-image function...');
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          ingredientName: ingredientName,
          name: ingredientName,
          description: description 
        }
      });

      if (error) {
        console.error('❌ Function error:', error);
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
      
      console.log('✅ Image URL received:', data.imageUrl);
      
      // GUARDAR EN LA BASE DE DATOS CON QUERY SIMPLE
      console.log('💾 Saving image URL to database...');
      const { error: updateError } = await supabase
        .from('ingredients')
        .update({ 
          image_url: data.imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', ingredientId);

      if (updateError) {
        console.error('❌ Database update error:', updateError);
        throw new Error(`Error guardando imagen: ${updateError.message}`);
      }

      console.log('✅ Image URL saved successfully');
      
      return {
        success: true,
        imageUrl: data.imageUrl,
        ingredientId: ingredientId,
        ingredientName: ingredientName
      };
    },
    onSuccess: (data) => {
      console.log('🎉 Complete success');
      
      // Invalidar queries para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['ingredient', data.ingredientId] });
      
      toast({
        title: "✅ Imagen generada",
        description: `Nueva imagen creada para ${data.ingredientName}`,
      });
    },
    onError: (error) => {
      console.error('❌ Complete error:', error);
      toast({
        title: "❌ Error al generar imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
