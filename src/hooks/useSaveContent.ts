
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSaveContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ type, data }: { type: string; data: any[] }) => {
      console.log('💾 Saving content:', { type, count: data.length });
      
      const { data: result, error } = await supabase.functions.invoke('save-generated-content', {
        body: { type, data }
      });

      if (error) {
        console.error('❌ Error saving content:', error);
        throw error;
      }

      if (!result.success) {
        throw new Error('Error saving content');
      }

      console.log('✅ Content saved successfully');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "✅ Contenido guardado exitosamente",
        description: "El contenido se ha guardado en la base de datos",
      });
    },
    onError: (error) => {
      console.error('❌ Save error:', error);
      toast({
        title: "❌ Error al guardar contenido",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
