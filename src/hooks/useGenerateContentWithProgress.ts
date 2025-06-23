
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProgressUpdate {
  current: number;
  total: number;
  currentIngredient?: string;
  status: 'processing' | 'success' | 'error';
  message?: string;
}

export const useGenerateContentWithProgress = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [generatedData, setGeneratedData] = useState<any[]>([]);

  const generateContent = async ({ 
    type, 
    count, 
    category, 
    region, 
    ingredient, 
    ingredientsList 
  }: { 
    type: string; 
    count: number; 
    category?: string;
    region?: string;
    ingredient?: string;
    ingredientsList?: string[];
  }) => {
    setIsLoading(true);
    setProgress(null);
    setGeneratedData([]);

    try {
      console.log('🔄 Starting content generation:', { 
        type, 
        count, 
        category, 
        region, 
        ingredient, 
        ingredientsList: ingredientsList?.length || 0 
      });

      // Show initial progress for manual mode
      if (ingredientsList && ingredientsList.length > 0) {
        setProgress({
          current: 0,
          total: ingredientsList.length,
          status: 'processing',
          message: 'Iniciando procesamiento de ingredientes...'
        });
      }

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
      setGeneratedData(data.data);
      
      // Show completion progress
      if (ingredientsList && ingredientsList.length > 0) {
        setProgress({
          current: data.data.length,
          total: ingredientsList.length,
          status: 'success',
          message: `Completado: ${data.data.length}/${ingredientsList.length} ingredientes`
        });
      }

      toast({
        title: "✅ Contenido generado exitosamente",
        description: `Se generaron ${data.data.length} elementos`,
      });

      return data.data;
    } catch (error: any) {
      console.error('❌ Generation error:', error);
      
      setProgress({
        current: 0,
        total: ingredientsList?.length || count,
        status: 'error',
        message: `Error: ${error.message}`
      });

      toast({
        title: "❌ Error al generar contenido",
        description: error.message,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateContent,
    isLoading,
    progress,
    generatedData
  };
};
