
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGenerateImage = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ingredientName, description, ingredientId }: { 
      ingredientName: string; 
      description?: string;
      ingredientId?: string;
    }) => {
      console.log('🖼️ === STARTING IMAGE GENERATION (NO DB UPDATE) ===');
      console.log('📋 Parameters:', { ingredientName, ingredientId });
      
      if (!ingredientId) {
        console.error('❌ No ingredient ID provided');
        throw new Error('ID del ingrediente es requerido para generar imagen');
      }

      // Verificar que el ingrediente existe
      console.log('🔍 Verifying ingredient exists...');
      const { data: existingIngredient, error: checkError } = await supabase
        .from('ingredients')
        .select('id, name')
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
      
      console.log('✅ Image URL received (NOT SAVING TO DB):', data.imageUrl.substring(0, 50) + '...');
      
      // NO ACTUALIZAR LA BASE DE DATOS - Solo retornar la URL
      return {
        success: true,
        imageUrl: data.imageUrl,
        ingredientId: ingredientId,
        ingredientName: ingredientName
      };
    },
    onSuccess: (data) => {
      console.log('🎉 Image generation success (URL only)');
      
      toast({
        title: "🎉 Imagen generada",
        description: `Nueva imagen lista para ${data.ingredientName}. Recuerda hacer clic en "Guardar Cambios".`,
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
