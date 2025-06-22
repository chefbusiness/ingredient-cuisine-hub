
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRegenerateImages = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('🔄 Starting image regeneration for ingredients without images');
      
      // Obtener ingredientes sin imágenes
      const { data: ingredients, error: fetchError } = await supabase
        .from('ingredients')
        .select('id, name, description')
        .is('image_url', null)
        .limit(10); // Limitar para evitar timeouts

      if (fetchError) {
        console.error('❌ Error fetching ingredients:', fetchError);
        throw fetchError;
      }

      if (!ingredients || ingredients.length === 0) {
        return { processed: 0, message: 'No hay ingredientes sin imágenes' };
      }

      console.log(`📋 Found ${ingredients.length} ingredients without images`);
      
      let successCount = 0;
      let errorCount = 0;

      // Procesar ingredientes uno por uno
      for (const ingredient of ingredients) {
        try {
          console.log(`🖼️ Generating image for: ${ingredient.name}`);
          
          const { data: imageResult, error: imageError } = await supabase.functions.invoke('generate-image', {
            body: { 
              ingredientName: ingredient.name,
              name: ingredient.name,
              description: ingredient.description 
            }
          });

          if (imageError || !imageResult.success) {
            console.error(`❌ Error generating image for ${ingredient.name}:`, imageError);
            errorCount++;
            continue;
          }

          if (imageResult.imageUrl) {
            // Actualizar ingrediente con la nueva imagen
            const { error: updateError } = await supabase
              .from('ingredients')
              .update({ image_url: imageResult.imageUrl })
              .eq('id', ingredient.id);

            if (updateError) {
              console.error(`❌ Error updating ${ingredient.name}:`, updateError);
              errorCount++;
            } else {
              console.log(`✅ Successfully generated image for: ${ingredient.name}`);
              successCount++;
            }
          } else {
            console.error(`❌ No image URL returned for ${ingredient.name}`);
            errorCount++;
          }
        } catch (error) {
          console.error(`❌ Exception generating image for ${ingredient.name}:`, error);
          errorCount++;
        }
      }

      console.log(`🏁 Image regeneration completed. Success: ${successCount}, Errors: ${errorCount}`);
      return { processed: successCount, errors: errorCount };
    },
    onSuccess: (result) => {
      if (result.processed > 0) {
        toast({
          title: "🎉 Imágenes regeneradas exitosamente",
          description: `Se generaron ${result.processed} imágenes`,
        });
      } else {
        toast({
          title: "ℹ️ Sin cambios",
          description: result.message || "No había ingredientes sin imágenes",
        });
      }
    },
    onError: (error) => {
      console.error('❌ Image regeneration error:', error);
      toast({
        title: "❌ Error al regenerar imágenes",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
