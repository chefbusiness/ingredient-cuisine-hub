
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
    mutationFn: async ({ mode, ingredientIds, batchSize = 1 }: UpdatePricesParams): Promise<UpdatePricesResult> => {
      console.log('🔄 Iniciando actualización optimizada de precios HORECA:', { mode, batchSize });
      
      // Update progress
      if (onProgress) {
        onProgress({
          current: 0,
          total: 100,
          status: 'Conectando con Perplexity Sonar para investigación HORECA...'
        });
      }

      try {
        console.log('📡 Invocando función update-ingredient-prices con timeout extendido...');
        
        // Usar timeout más largo para operaciones de precios
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('TIMEOUT: La operación tomó más de 5 minutos')), 300000); // 5 minutos
        });

        const functionPromise = supabase.functions.invoke('update-ingredient-prices', {
          body: { 
            mode,
            ingredientIds,
            batchSize: 1 // Forzar lotes de 1 para evitar timeouts
          }
        });

        const result = await Promise.race([functionPromise, timeoutPromise]);
        const { data, error } = result as any;

        console.log('📊 Respuesta de la función:', { data, error });

        if (error) {
          console.error('❌ Error en la invocación de la función:', error);
          
          // Mejorar el manejo de errores específicos
          if (error.message?.includes('timeout') || error.message?.includes('TIMEOUT')) {
            throw new Error('TIMEOUT: La actualización está tomando más tiempo del esperado. Algunos ingredientes pueden haberse actualizado correctamente. Revisa el progreso y reintenta si es necesario.');
          }
          
          if (error.message?.includes('UNAUTHORIZED')) {
            throw new Error('UNAUTHORIZED: No tienes permisos para realizar esta acción');
          }
          
          if (error.message?.includes('PERPLEXITY_API_KEY')) {
            throw new Error('CONFIGURATION_ERROR: Falta configurar la clave API de Perplexity');
          }
          
          throw new Error(`Error en la función: ${error.message || JSON.stringify(error)}`);
        }

        if (!data) {
          throw new Error('EMPTY_RESPONSE: No se recibió respuesta de la función');
        }

        if (!data.success) {
          throw new Error(data.error || 'ERROR_UNKNOWN: Error desconocido en la actualización de precios');
        }

        console.log('✅ Actualización completada exitosamente:', data.summary);
        return data.summary;
        
      } catch (functionError: any) {
        console.error('❌ Error crítico en useUpdateIngredientPrices:', functionError);
        
        // Detectar si es un error de timeout del navegador
        if (functionError.name === 'AbortError' || functionError.message?.includes('AbortError')) {
          throw new Error('BROWSER_TIMEOUT: La conexión se cortó por timeout del navegador. La actualización puede estar continuando en segundo plano.');
        }
        
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
          description: `Se actualizaron ${successful_updates} ingrediente(s) con precios mayoristas reales de fuentes HORECA especializadas`,
        });
      }

      if (failed_updates > 0) {
        toast({
          title: failed_updates > successful_updates ? "⚠️ Actualización con errores" : "⚠️ Actualización parcial",
          description: `${successful_updates} exitosos, ${failed_updates} fallidos. Algunos ingredientes pueden requerir revisión manual.`,
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
      let errorTitle = "❌ Error al actualizar precios HORECA";
      
      if (error.message) {
        if (error.message.includes('UNAUTHORIZED')) {
          errorMessage = 'No tienes permisos para realizar esta acción';
        } else if (error.message.includes('PERPLEXITY_API_KEY') || error.message.includes('CONFIGURATION_ERROR')) {
          errorMessage = 'Error de configuración: falta la clave API de Perplexity';
        } else if (error.message.includes('TIMEOUT') || error.message.includes('timeout')) {
          errorTitle = "⏱️ Timeout en actualización de precios";
          errorMessage = 'La operación está tomando más tiempo del esperado. Puede estar procesándose en segundo plano. Espera unos minutos antes de reintentar.';
        } else if (error.message.includes('BROWSER_TIMEOUT')) {
          errorTitle = "🌐 Timeout del navegador";
          errorMessage = 'La conexión se cortó, pero la actualización puede estar continuando. Revisa los resultados en unos minutos.';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    },
    // Configuración optimizada para operaciones largas
    retry: (failureCount, error: any) => {
      // No reintentar automáticamente en timeouts para evitar duplicados
      if (error?.message?.includes('TIMEOUT') || error?.message?.includes('timeout')) {
        return false;
      }
      // Reintentar hasta 2 veces en otros errores
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponencial
  });
};
