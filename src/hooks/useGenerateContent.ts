
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGenerateContent = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ type, count, category, region, ingredient, ingredientsList }: { 
      type: string; 
      count: number; 
      category?: string;
      region?: string;
      ingredient?: string;
      ingredientsList?: string[];
    }) => {
      console.log('🔄 Generating content:', { type, count, category, region, ingredient, ingredientsList });
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          type, 
          count, 
          category, 
          region, 
          ingredient,
          ingredientsList: ingredientsList || undefined
        }
      });

      if (error) {
        console.error('❌ Error invoking generate-content:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Error generating content');
      }

      console.log('✅ Generated content successfully:', data.data.length, 'items');
      return data.data;
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Contenido generado exitosamente",
        description: `Se generaron ${data.length} elementos`,
      });
    },
    onError: (error) => {
      console.error('❌ Generation error:', error);
      toast({
        title: "❌ Error al generar contenido",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
