
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GenerateContentParams {
  type: 'ingredient' | 'category' | 'price_update';
  category?: string;
  region?: string;
  count?: number;
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
    onSuccess: () => {
      toast({
        title: "Contenido generado",
        description: "El contenido ha sido generado exitosamente",
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
