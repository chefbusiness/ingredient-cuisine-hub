
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageGenerationProgress {
  current: number;
  total: number;
  isGenerating: boolean;
}

interface ProcessingResult {
  ingredientId: string;
  ingredientName: string;
  success: boolean;
  error?: string;
  imageUrl?: string;
}

export const useGenerateMissingImages = (
  onProgressUpdate?: (progress: ImageGenerationProgress) => void
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('🔄 === STARTING ENHANCED MASS IMAGE REGENERATION ===');
      
      // PASO 1: Obtener ingredientes sin imágenes con información detallada
      console.log('📋 Step 1: Fetching ingredients without images...');
      const { data: ingredients, error: fetchError } = await supabase
        .from('ingredients')
        .select('id, name, description, image_url, updated_at')
        .is('image_url', null)
        .limit(10); // Reducido para testing inicial

      if (fetchError) {
        console.error('❌ Error fetching ingredients:', fetchError);
        throw new Error(`Error obteniendo ingredientes: ${fetchError.message}`);
      }

      console.log('📊 Ingredients analysis:', {
        totalFound: ingredients?.length || 0,
        sampleIds: ingredients?.slice(0, 3).map(i => ({ id: i.id, name: i.name })) || []
      });

      if (!ingredients || ingredients.length === 0) {
        console.log('ℹ️ No ingredients without images found');
        return { 
          processed: 0, 
          errors: 0, 
          message: 'Todos los ingredientes ya tienen imágenes',
          details: []
        };
      }

      console.log(`📋 Processing ${ingredients.length} ingredients without images`);
      
      let successCount = 0;
      let errorCount = 0;
      const total = ingredients.length;
      const processingDetails: ProcessingResult[] = [];

      // Inicializar progreso
      onProgressUpdate?.({ current: 0, total, isGenerating: true });

      // PASO 2: Procesar ingredientes uno por uno con verificación exhaustiva
      for (let i = 0; i < ingredients.length; i++) {
        const ingredient = ingredients[i];
        
        try {
          console.log(`\n🖼️ [${i + 1}/${total}] === PROCESSING: ${ingredient.name} ===`);
          console.log(`📋 Ingredient details:`, {
            id: ingredient.id,
            name: ingredient.name,
            hasDescription: !!ingredient.description,
            currentImageUrl: ingredient.image_url || 'null'
          });
          
          // Actualizar progreso
          onProgressUpdate?.({ current: i, total, isGenerating: true });
          
          // SUB-PASO 2A: Generar imagen
          console.log(`📤 [${i + 1}/${total}] Calling generate-image function...`);
          const { data: imageResult, error: imageError } = await supabase.functions.invoke('generate-image', {
            body: { 
              ingredientName: ingredient.name,
              name: ingredient.name,
              description: ingredient.description 
            }
          });

          console.log(`📥 [${i + 1}/${total}] Image generation response:`, {
            hasData: !!imageResult,
            success: imageResult?.success,
            hasImageUrl: !!imageResult?.imageUrl,
            error: imageError?.message || 'none'
          });

          if (imageError) {
            console.error(`❌ [${i + 1}/${total}] Supabase function error:`, imageError);
            errorCount++;
            processingDetails.push({
              ingredientId: ingredient.id,
              ingredientName: ingredient.name,
              success: false,
              error: `Function error: ${imageError.message}`
            });
            continue;
          }

          if (!imageResult || !imageResult.success) {
            console.error(`❌ [${i + 1}/${total}] Function returned error:`, imageResult?.error);
            errorCount++;
            processingDetails.push({
              ingredientId: ingredient.id,
              ingredientName: ingredient.name,
              success: false,
              error: `Generation failed: ${imageResult?.error || 'unknown error'}`
            });
            continue;
          }

          if (!imageResult.imageUrl) {
            console.error(`❌ [${i + 1}/${total}] No image URL returned`);
            errorCount++;
            processingDetails.push({
              ingredientId: ingredient.id,
              ingredientName: ingredient.name,
              success: false,
              error: 'No image URL received'
            });
            continue;
          }

          console.log(`✅ [${i + 1}/${total}] Image URL received: ${imageResult.imageUrl.substring(0, 50)}...`);

          // SUB-PASO 2B: Guardar en la base de datos con verificación exhaustiva
          console.log(`💾 [${i + 1}/${total}] Saving to database with verification...`);
          
          const timestamp = new Date().toISOString();
          const { data: updateResult, error: updateError } = await supabase
            .from('ingredients')
            .update({ 
              image_url: imageResult.imageUrl,
              updated_at: timestamp
            })
            .eq('id', ingredient.id)
            .select('id, name, image_url, updated_at');

          console.log(`📊 [${i + 1}/${total}] Update operation result:`, {
            error: updateError?.message || 'none',
            resultCount: updateResult?.length || 0,
            resultData: updateResult ? 'present' : 'null'
          });

          if (updateError) {
            console.error(`❌ [${i + 1}/${total}] Database update error:`, updateError);
            errorCount++;
            processingDetails.push({
              ingredientId: ingredient.id,
              ingredientName: ingredient.name,
              success: false,
              error: `Database error: ${updateError.message}`
            });
            continue;
          }

          if (!updateResult || updateResult.length === 0) {
            console.error(`❌ [${i + 1}/${total}] No rows updated (ID: ${ingredient.id})`);
            errorCount++;
            processingDetails.push({
              ingredientId: ingredient.id,
              ingredientName: ingredient.name,
              success: false,
              error: 'No rows updated - ingredient may not exist or RLS policy blocking'
            });
            continue;
          }

          const updatedIngredient = updateResult[0];
          
          // SUB-PASO 2C: Verificación POST-UPDATE
          console.log(`🔎 [${i + 1}/${total}] POST-UPDATE verification...`);
          if (!updatedIngredient.image_url) {
            console.error(`❌ [${i + 1}/${total}] CRITICAL: Image URL is NULL after update!`);
            errorCount++;
            processingDetails.push({
              ingredientId: ingredient.id,
              ingredientName: ingredient.name,
              success: false,
              error: 'Image URL is NULL after update'
            });
            continue;
          }

          if (updatedIngredient.image_url !== imageResult.imageUrl) {
            console.error(`❌ [${i + 1}/${total}] CRITICAL: Image URL mismatch after update!`);
            errorCount++;
            processingDetails.push({
              ingredientId: ingredient.id,
              ingredientName: ingredient.name,
              success: false,
              error: 'Image URL mismatch after update'
            });
            continue;
          }

          // SUB-PASO 2D: Verificación independiente
          console.log(`🔍 [${i + 1}/${total}] Independent SELECT verification...`);
          const { data: verificationResult, error: verificationError } = await supabase
            .from('ingredients')
            .select('image_url')
            .eq('id', ingredient.id)
            .maybeSingle();

          if (verificationError || !verificationResult?.image_url) {
            console.error(`❌ [${i + 1}/${total}] Independent verification failed`);
            errorCount++;
            processingDetails.push({
              ingredientId: ingredient.id,
              ingredientName: ingredient.name,
              success: false,
              error: 'Independent verification failed'
            });
            continue;
          }

          console.log(`✅ [${i + 1}/${total}] === SUCCESS: ${ingredient.name} ===`);
          console.log(`🔗 [${i + 1}/${total}] Verified URL: ${verificationResult.image_url.substring(0, 50)}...`);
          successCount++;
          processingDetails.push({
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            success: true,
            imageUrl: imageResult.imageUrl
          });
          
          // Pausa entre generaciones para evitar límites de rate
          if (i < ingredients.length - 1) {
            console.log(`⏸️ [${i + 1}/${total}] Pausing 3 seconds before next generation...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
          
        } catch (error) {
          console.error(`❌ [${i + 1}/${total}] Exception processing ${ingredient.name}:`, error);
          errorCount++;
          processingDetails.push({
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown exception'
          });
        }
      }

      // Finalizar progreso
      onProgressUpdate?.({ current: total, total, isGenerating: false });

      console.log(`\n🏁 === MASS REGENERATION COMPLETED ===`);
      console.log(`📊 Final results:`, {
        total: total,
        successful: successCount,
        failed: errorCount,
        successRate: total > 0 ? Math.round((successCount / total) * 100) : 0
      });

      console.log(`📋 Processing details:`, processingDetails);

      return { 
        processed: successCount, 
        errors: errorCount, 
        total: total,
        details: processingDetails
      };
    },
    onSuccess: (result) => {
      console.log('🎉 Mass regeneration completed - invalidating queries');
      
      // Invalidar queries para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      
      if (result.processed > 0) {
        toast({
          title: "🎉 Regeneración masiva completada",
          description: `${result.processed} imágenes generadas y verificadas de ${result.total} ingredientes`,
        });
      } else {
        toast({
          title: "ℹ️ Sin imágenes procesadas",
          description: result.message || `0 de ${result.total} ingredientes procesados exitosamente`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('❌ Mass regeneration FAILED:', error);
      onProgressUpdate?.({ current: 0, total: 0, isGenerating: false });
      toast({
        title: "❌ Error en regeneración masiva",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
