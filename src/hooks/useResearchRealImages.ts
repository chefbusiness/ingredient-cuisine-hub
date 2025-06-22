
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
  }>;
  error?: string;
}

interface ResearchResponse {
  success: boolean;
  results: ResearchResult[];
  summary: {
    total_processed: number;
    successful: number;
    total_images_found: number;
    total_images_saved: number;
  };
}

export const useResearchRealImages = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ingredientIds, mode = 'single' }: ResearchImagesParams): Promise<ResearchResponse> => {
      console.log('🔍 Starting image research for:', ingredientIds);

      const { data, error } = await supabase.functions.invoke('research-real-images', {
        body: { 
          ingredientIds,
          mode
        }
      });

      if (error) {
        console.error('❌ Research error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Error en la investigación de imágenes');
      }

      return data;
    },
    onSuccess: (data) => {
      const { summary, results } = data;
      
      if (summary.total_images_saved > 0) {
        toast({
          title: "¡Investigación completada!",
          description: `Se encontraron y guardaron ${summary.total_images_saved} imágenes reales para ${summary.successful} ingrediente(s)`,
        });
      } else {
        toast({
          title: "Investigación completada",
          description: "No se encontraron imágenes válidas en esta búsqueda",
          variant: "destructive",
        });
      }

      // Log detailed results
      console.log('🎉 === RESEARCH RESULTS ===');
      console.log(`📊 Procesados: ${summary.total_processed}`);
      console.log(`✅ Exitosos: ${summary.successful}`);
      console.log(`🖼️ Imágenes encontradas: ${summary.total_images_found}`);
      console.log(`💾 Imágenes guardadas: ${summary.total_images_saved}`);
      
      results.forEach(result => {
        if (result.success) {
          console.log(`✅ ${result.ingredientName}: ${result.imagesSaved}/${result.imagesFound} imágenes`);
        } else {
          console.log(`❌ ${result.ingredientName}: ${result.error}`);
        }
      });
    },
    onError: (error: any) => {
      console.error('❌ Research failed:', error);
      toast({
        title: "Error en la investigación",
        description: error.message || "No se pudieron buscar imágenes reales",
        variant: "destructive",
      });
    },
  });
};
