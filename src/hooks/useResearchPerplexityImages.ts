
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
      console.log('🔍 Starting Perplexity image research for:', ingredientIds);

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
        throw new Error(data.error || 'Error en la investigación de imágenes con Perplexity');
      }

      return data;
    },
    onSuccess: (data) => {
      const { summary, results } = data;
      
      if (summary.total_images_saved > 0) {
        toast({
          title: "¡Investigación Perplexity completada!",
          description: `Se encontraron y guardaron ${summary.total_images_saved} imágenes reales para ${summary.successful} ingrediente(s) usando Perplexity Sonar`,
        });
      } else {
        toast({
          title: "Investigación Perplexity completada",
          description: "No se encontraron imágenes válidas en esta búsqueda con Perplexity",
          variant: "destructive",
        });
      }

      // Enhanced logging for Perplexity results
      console.log('🎉 === PERPLEXITY RESEARCH RESULTS ===');
      console.log(`🔍 Motor de búsqueda: ${summary.search_engine}`);
      console.log(`📊 Procesados: ${summary.total_processed}`);
      console.log(`✅ Exitosos: ${summary.successful}`);
      console.log(`🖼️ Imágenes encontradas: ${summary.total_images_found}`);
      console.log(`💾 Imágenes guardadas: ${summary.total_images_saved}`);
      console.log(`📈 Tasa de éxito: ${((summary.total_images_saved / summary.total_images_found) * 100).toFixed(1)}%`);
      
      results.forEach(result => {
        if (result.success) {
          console.log(`✅ ${result.ingredientName}: ${result.imagesSaved}/${result.imagesFound} imágenes`);
          if (result.images) {
            result.images.forEach((img, idx) => {
              console.log(`   📸 [${idx + 1}] ${img.category}: ${img.source || 'unknown source'}`);
            });
          }
        } else {
          console.log(`❌ ${result.ingredientName}: ${result.error}`);
        }
      });
    },
    onError: (error: any) => {
      console.error('❌ Perplexity research failed:', error);
      toast({
        title: "Error en investigación Perplexity",
        description: error.message || "No se pudieron buscar imágenes reales con Perplexity Sonar",
        variant: "destructive",
      });
    },
  });
};
