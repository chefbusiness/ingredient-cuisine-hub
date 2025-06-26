
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UpdatePricesParams {
  mode: 'all' | 'problematic' | 'specific';
  ingredientIds?: string[];
  batchSize?: number;
}

interface UpdatePricesResult {
  total_processed: number;
  successful_updates: number;
  failed_updates: number;
  updated_ingredients: Array<{
    id: string;
    name: string;
    prices_updated: number;
  }>;
  failed_ingredients: Array<{
    id: string;
    name: string;
    reason: string;
  }>;
  mode: string;
}

export const useUpdateIngredientPrices = (
  onProgress?: (progress: { current: number; total: number; status: string }) => void
) => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ mode, ingredientIds, batchSize = 5 }: UpdatePricesParams): Promise<UpdatePricesResult> => {
      console.log('🔄 Starting bulk price update:', { mode, batchSize });
      
      // Update progress
      if (onProgress) {
        onProgress({
          current: 0,
          total: 100,
          status: 'Iniciando actualización de precios HORECA...'
        });
      }

      const { data, error } = await supabase.functions.invoke('update-ingredient-prices', {
        body: { 
          mode,
          ingredientIds,
          batchSize
        }
      });

      if (error) {
        console.error('❌ Error invoking update-ingredient-prices:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Error actualizando precios');
      }

      console.log('✅ Bulk price update completed:', data.summary);
      return data.summary;
    },
    onSuccess: (data) => {
      const { successful_updates, failed_updates, total_processed } = data;
      
      if (onProgress) {
        onProgress({
          current: total_processed,
          total: total_processed,
          status: `Completado: ${successful_updates} exitosos, ${failed_updates} fallidos`
        });
      }

      if (successful_updates > 0) {
        toast({
          title: "✅ Precios actualizados exitosamente",
          description: `Se actualizaron los precios de ${successful_updates} ingrediente(s) usando fuentes HORECA`,
        });
      }

      if (failed_updates > 0) {
        toast({
          title: "⚠️ Actualización parcial completada",
          description: `${successful_updates} exitosos, ${failed_updates} fallidos. Revisa los logs para más detalles.`,
          variant: failed_updates > successful_updates ? "destructive" : "default",
        });
      }
    },
    onError: (error: any) => {
      console.error('❌ Bulk price update failed:', error);
      
      if (onProgress) {
        onProgress({
          current: 0,
          total: 100,
          status: `Error: ${error.message}`
        });
      }

      toast({
        title: "❌ Error al actualizar precios",
        description: error.message || "No se pudieron actualizar los precios",
        variant: "destructive",
      });
    },
  });
};
