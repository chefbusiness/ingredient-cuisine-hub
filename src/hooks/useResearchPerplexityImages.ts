
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ResearchImagesParams {
  ingredientIds: string | string[];
  mode?: 'single' | 'batch';
}

interface ResearchResult {
  ingredientId: string;
  ingredientName: string;
  success: boolean;
  imagesFound?: number;
  imagesSaved?: number;
  images?: Array<{
    url: string;
    caption: string;
    category: string;
    source?: string;
  }>;
  error?: string;
  searchEngine: string;
  totalAttempted?: number;
  validationDetails?: any[];
}

interface ResearchResponse {
  success: boolean;
  results: ResearchResult[];
  summary: {
    total_processed: number;
    successful: number;
    total_images_found: number;
    total_images_saved: number;
    search_engine: string;
  };
}

export const useResearchPerplexityImages = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ingredientIds, mode = 'single' }: ResearchImagesParams): Promise<ResearchResponse> => {
      console.log('🔍 Starting Perplexity Sonar image research for:', ingredientIds);

      const { data, error } = await supabase.functions.invoke('research-real-images-perplexity', {
        body: { 
          ingredientIds,
          mode
        }
      });

      if (error) {
        console.error('❌ Perplexity research error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Error en la investigación de imágenes con Perplexity Sonar');
      }

      return data;
    },
    onSuccess: (data) => {
      const { summary, results } = data;
      
      console.log('🎉 === PERPLEXITY RESEARCH RESULTS ===');
      console.log(`🔍 Motor de búsqueda: ${summary.search_engine}`);
      console.log(`📊 Procesados: ${summary.total_processed}`);
      console.log(`✅ Exitosos: ${summary.successful}`);
      console.log(`🖼️ Imágenes encontradas: ${summary.total_images_found}`);
      console.log(`💾 Imágenes guardadas: ${summary.total_images_saved}`);
      
      // Enhanced logging for debugging
      results.forEach(result => {
        if (result.success) {
          console.log(`✅ ${result.ingredientName}: ${result.imagesSaved}/${result.imagesFound} imágenes válidas`);
          if (result.totalAttempted) {
            console.log(`   📊 Total intentadas: ${result.totalAttempted}`);
          }
          if (result.images) {
            result.images.forEach((img, idx) => {
              console.log(`   📸 [${idx + 1}] ${img.category}: ${img.source || 'unknown source'}`);
            });
          }
        } else {
          console.log(`❌ ${result.ingredientName}: ${result.error}`);
        }
      });

      if (summary.total_images_saved > 0) {
        toast({
          title: "¡Investigación Perplexity Sonar completada!",
          description: `Se encontraron y guardaron ${summary.total_images_saved} imágenes reales para ${summary.successful} ingrediente(s)`,
        });
      } else if (summary.total_images_found > 0) {
        toast({
          title: "Investigación completada con limitaciones",
          description: `Se encontraron ${summary.total_images_found} imágenes potenciales, pero ninguna pasó la validación de calidad. Esto puede deberse a URLs inválidas o formato incorrecto.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sin resultados en esta búsqueda",
          description: "Perplexity Sonar no encontró imágenes válidas para este ingrediente. Esto puede ocurrir con ingredientes muy específicos o poco comunes.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('❌ Perplexity research failed:', error);
      
      // Enhanced error messages based on error type
      let errorTitle = "Error en investigación Perplexity";
      let errorDescription = "No se pudieron buscar imágenes reales";
      
      if (error.message?.includes('SSL')) {
        errorTitle = "Error de conexión SSL";
        errorDescription = "Problema de conectividad con Perplexity. Intenta de nuevo en unos segundos.";
      } else if (error.message?.includes('timeout')) {
        errorTitle = "Tiempo de espera agotado";
        errorDescription = "La búsqueda tomó demasiado tiempo. Intenta con un ingrediente diferente.";
      } else if (error.message?.includes('JSON')) {
        errorTitle = "Error de formato de respuesta";
        errorDescription = "Perplexity devolvió un formato inesperado. El equipo técnico ha sido notificado.";
      } else if (error.message?.includes('API')) {
        errorTitle = "Error de API de Perplexity";
        errorDescription = "Problema temporal con el servicio de Perplexity. Intenta de nuevo más tarde.";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    },
  });
};
