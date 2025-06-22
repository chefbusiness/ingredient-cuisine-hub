
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageGenerationProgress {
  current: number;
  total: number;
  isGenerating: boolean;
}

export const useGenerateMissingImages = (
  onProgressUpdate?: (progress: ImageGenerationProgress) => void
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('🔄 === STARTING MASS IMAGE REGENERATION ===');
      
      // Obtener ingredientes sin imágenes
      const { data: ingredients, error: fetchError } = await supabase
        .from('ingredients')
        .select('id, name, description')
        .is('image_url', null)
        .limit(20); // Limitar para evitar timeouts

      if (fetchError) {
        console.error('❌ Error fetching ingredients:', fetchError);
        throw new Error(`Error obteniendo ingredientes: ${fetchError.message}`);
      }

      if (!ingredients || ingredients.length === 0) {
        return { 
          processed: 0, 
          errors: 0, 
          message: 'Todos los ingredientes ya tienen imágenes' 
        };
      }

      console.log(`📋 Found ${ingredients.length} ingredients without images`);
      
      let successCount = 0;
      let errorCount = 0;
      const total = ingredients.length;

      // Inicializar progreso
      onProgressUpdate?.({ current: 0, total, isGenerating: true });

      // Procesar ingredientes uno por uno
      for (let i = 0; i < ingredients.length; i++) {
        const ingredient = ingredients[i];
        
        try {
          console.log(`🖼️ [${i + 1}/${total}] Generating image for: ${ingredient.name}`);
          
          // Actualizar progreso
          onProgressUpdate?.({ current: i, total, isGenerating: true });
          
          // Llamar a la función de generación de imagen
          const { data: imageResult, error: imageError } = await supabase.functions.invoke('generate-image', {
            body: { 
              ingredientName: ingredient.name,
              name: ingredient.name,
              description: ingredient.description 
            }
          });

          console.log(`📤 Image generation response for ${ingredient.name}:`, {
            hasData: !!imageResult,
            success: imageResult?.success,
            hasImageUrl: !!imageResult?.imageUrl,
            error: imageError
          });

          if (imageError) {
            console.error(`❌ Supabase function error for ${ingredient.name}:`, imageError);
            errorCount++;
            continue;
          }

          if (!imageResult || !imageResult.success) {
            console.error(`❌ Function returned error for ${ingredient.name}:`, imageResult?.error);
            errorCount++;
            continue;
          }

          if (!imageResult.imageUrl) {
            console.error(`❌ No image URL returned for ${ingredient.name}`);
            errorCount++;
            continue;
          }

          console.log(`📥 Got image URL for ${ingredient.name}: ${imageResult.imageUrl.substring(0, 50)}...`);

          // GUARDAR EN LA BASE DE DATOS con verificación explícita
          console.log(`💾 Saving image URL to database for ${ingredient.name}...`);
          
          const { data: updateResult, error: updateError } = await supabase
            .from('ingredients')
            .update({ 
              image_url: imageResult.imageUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', ingredient.id)
            .select('id, name, image_url');

          if (updateError) {
            console.error(`❌ Database update error for ${ingredient.name}:`, updateError);
            errorCount++;
            continue;
          }

          if (!updateResult || updateResult.length === 0) {
            console.error(`❌ No rows updated for ${ingredient.name} (ingredient ID: ${ingredient.id})`);
            errorCount++;
            continue;
          }

          const updatedIngredient = updateResult[0];
          if (!updatedIngredient.image_url) {
            console.error(`❌ Image URL not saved correctly for ${ingredient.name}`);
            errorCount++;
            continue;
          }

          console.log(`✅ [${i + 1}/${total}] Successfully saved image for: ${ingredient.name}`);
          console.log(`🔗 Saved URL: ${updatedIngredient.image_url.substring(0, 50)}...`);
          successCount++;
          
          // Pequeña pausa entre generaciones para evitar límites de rate
          if (i < ingredients.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
        } catch (error) {
          console.error(`❌ Exception generating image for ${ingredient.name}:`, error);
          errorCount++;
        }
      }

      // Finalizar progreso
      onProgressUpdate?.({ current: total, total, isGenerating: false });

      console.log(`🏁 Mass image regeneration completed. Success: ${successCount}, Errors: ${errorCount}`);
      return { processed: successCount, errors: errorCount, total };
    },
    onSuccess: (result) => {
      // Invalidar queries para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      
      if (result.processed > 0) {
        toast({
          title: "🎉 Regeneración masiva completada",
          description: `Se generaron y guardaron ${result.processed} imágenes de ${result.total} ingredientes`,
        });
      } else {
        toast({
          title: "ℹ️ Sin cambios",
          description: result.message || "No había ingredientes sin imágenes",
        });
      }
    },
    onError: (error) => {
      console.error('❌ Mass image regeneration error:', error);
      onProgressUpdate?.({ current: 0, total: 0, isGenerating: false });
      toast({
        title: "❌ Error en regeneración masiva",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
