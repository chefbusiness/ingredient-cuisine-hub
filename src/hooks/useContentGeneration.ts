
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GenerateContentParams {
  type: 'ingredient' | 'category' | 'price_update' | 'market_research' | 'weather_impact' | 'cultural_variants' | 'trend_analysis' | 'supply_chain';
  category?: string;
  region?: string;
  count?: number;
  ingredient?: string;
  search_query?: string;
}

interface GenerateImageParams {
  ingredientName: string;
  description?: string;
}

export const useGenerateContent = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: GenerateContentParams) => {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: params
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      const typeMessages = {
        ingredient: "Ingredientes generados exitosamente",
        category: "Categorías generadas exitosamente", 
        market_research: "Investigación de mercado completada",
        weather_impact: "Análisis climático completado",
        cultural_variants: "Investigación cultural completada",
        trend_analysis: "Análisis de tendencias completado",
        supply_chain: "Investigación de cadena de suministro completada"
      };
      
      toast({
        title: "Investigación completada",
        description: typeMessages[variables.type] || "Contenido generado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al generar contenido",
        variant: "destructive",
      });
    },
  });
};

export const useGenerateImage = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: GenerateImageParams) => {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: params
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Imagen generada",
        description: "La imagen ha sido generada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al generar imagen",
        variant: "destructive",
      });
    },
  });
};

export const useSaveGeneratedContent = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ type, data }: { type: string; data: any[] }) => {
      const { data: result, error } = await supabase.functions.invoke('save-generated-content', {
        body: { type, data }
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Contenido guardado",
        description: "El contenido ha sido guardado en la base de datos",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al guardar contenido",
        variant: "destructive",
      });
    },
  });
};
