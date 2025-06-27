
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
    mutationFn: async ({ mode, ingredientIds, batchSize = 3 }: UpdatePricesParams): Promise<UpdatePricesResult> => {
      console.log('🔄 Iniciando actualización masiva de precios HORECA:', { mode, batchSize });
      
      // Update progress
      if (onProgress) {
        onProgress({
          current: 0,
          total: 100,
          status: 'Conectando con Perplexity Sonar para investigación HORECA...'
        });
      }

      try {
        console.log('📡 Invocando función update-ingredient-prices...');
        
        const { data, error } = await supabase.functions.invoke('update-ingredient-prices', {
          body: { 
            mode,
            ingredientIds,
            batchSize
          }
        });

        console.log('📊 Respuesta de la función:', { data, error });

        if (error) {
          console.error('❌ Error en la invocación de la función:', error);
          throw new Error(`Error en la función: ${error.message || JSON.stringify(error)}`);
        }

        if (!data) {
          throw new Error('No se recibió respuesta de la función');
        }

        if (!data.success) {
          throw new Error(data.error || 'Error desconocido en la actualización de precios');
        }

        console.log('✅ Actualización completada exitosamente:', data.summary);
        return data.summary;
      } catch (functionError) {
        console.error('❌ Error crítico en useUpdateIngredientPrices:', functionError);
        throw functionError;
      }
    },
    onSuccess: (data) => {
      const { successful_updates, failed_updates, total_processed } = data;
      
      if (onProgress) {
        onProgress({
          current: total_processed,
          total: total_processed,
          status: `✅ Completado: ${successful_updates} actualizados, ${failed_updates} fallidos`
        });
      }

      console.log('🎉 Hook onSuccess - Resultado final:', data);

      if (successful_updates > 0) {
        toast({
          title: "✅ Precios HORECA actualizados",
          description: `Se actualizaron ${successful_updates} ingrediente(s) con precios mayoristas reales de Frutas Eloy, Makro y fuentes HORECA`,
        });
      }

      if (failed_updates > 0) {
        toast({
          title: failed_updates > successful_updates ? "⚠️ Actualización con errores" : "⚠️ Actualización parcial",
          description: `${successful_updates} exitosos, ${failed_updates} fallidos. Revisa los logs para más detalles.`,
          variant: failed_updates > successful_updates ? "destructive" : "default",
        });
      }
    },
    onError: (error: any) => {
      console.error('❌ Hook onError - Error en actualización masiva:', error);
      
      if (onProgress) {
        onProgress({
          current: 0,
          total: 100,
          status: `❌ Error: ${error.message || 'Error desconocido'}`
        });
      }

      let errorMessage = 'No se pudieron actualizar los precios';
      
      if (error.message) {
        if (error.message.includes('UNAUTHORIZED')) {
          errorMessage = 'No tienes permisos para realizar esta acción';
        } else if (error.message.includes('PERPLEXITY_API_KEY')) {
          errorMessage = 'Error de configuración: falta la clave API de Perplexity';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "❌ Error al actualizar precios HORECA",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};
