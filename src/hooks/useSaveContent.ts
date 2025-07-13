import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSaveContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ type, data, isManualMode }: { type: string; data: any[]; isManualMode?: boolean }) => {
      console.log('💾 === ENHANCED SAVE CONTENT PROCESS ===');
      console.log('📋 Input data:', { type, count: data.length, isManualMode: isManualMode || false });
      
      // PASO 1: Guardar contenido con parámetro de modo manual
      const { data: result, error } = await supabase.functions.invoke('save-generated-content', {
        body: { type, data, isManualMode: isManualMode || false }
      });

      if (error) {
        console.error('❌ Error saving content:', error);
        throw error;
      }

      if (!result.success) {
        console.error('❌ Save function returned error:', result.error);
        throw new Error(result.error || 'Error saving content');
      }

      console.log('✅ Content saved, raw result:', {
        success: result.success,
        hasResults: !!result.results,
        resultCount: result.results?.length || 0,
        hasSummary: !!result.summary,
        manualMode: isManualMode || false
      });

      if (type === 'ingredient' && result.results) {
        console.log('🔍 === VERIFICATION OF SAVED INGREDIENTS ===');
        
        // Filtrar solo los ingredientes exitosamente creados
        const successfulIngredients = result.results.filter(r => r.success && r.id);
        console.log('📊 Successful ingredients:', {
          total: result.results.length,
          successful: successfulIngredients.length,
          failed: result.results.length - successfulIngredients.length
        });

        if (successfulIngredients.length > 0) {
          // PASO 3: Verificación adicional con SELECT independiente
          console.log('🔎 Independent verification of saved ingredients...');
          const savedIds = successfulIngredients.map(r => r.id);
          
          const { data: verificationData, error: verificationError } = await supabase
            .from('ingredients')
            .select('id, name, image_url, created_at')
            .in('id', savedIds);

          if (verificationError) {
            console.error('❌ Verification error:', verificationError);
            // No lanzar error, solo advertir
            console.warn('⚠️ Could not verify saved ingredients, proceeding anyway');
          } else {
            console.log('✅ Verification results:', {
              queriedIds: savedIds.length,
              foundIngredients: verificationData?.length || 0,
              allFound: (verificationData?.length || 0) === savedIds.length
            });

            // Actualizar result.data con datos verificados
            result.data = verificationData || successfulIngredients;
            console.log('📝 Updated result.data with verified ingredients');
          }
        }

        // PASO 4: Pequeña pausa para asegurar consistencia
        console.log('⏸️ Brief pause to ensure database consistency...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('🎉 === SAVE PROCESS COMPLETED SUCCESSFULLY ===');
      console.log('📋 Final result data:', {
        type: type,
        success: result.success,
        dataCount: result.data?.length || 0,
        ready_for_image_generation: type === 'ingredient' && result.data?.length > 0,
        manual_mode: isManualMode || false
      });

      return result;
    },
    onSuccess: (result, variables) => {
      console.log('🎉 Save mutation SUCCESS - invalidating queries');
      
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      // Invalidar cache específica según el tipo de contenido
      if (variables.type === 'category') {
        console.log('📂 Invalidating category-specific queries');
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
      
      const { type, isManualMode } = variables;
      const savedCount = result.data?.length || 0;
      
      toast({
        title: "✅ Contenido guardado exitosamente",
        description: `${savedCount} ${type === 'ingredient' ? 'ingredientes' : 'elementos'} guardados en ${isManualMode ? 'modo manual' : 'modo automático'}`,
      });
    },
    onError: (error) => {
      console.error('❌ Save mutation ERROR:', error);
      toast({
        title: "❌ Error al guardar contenido",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
