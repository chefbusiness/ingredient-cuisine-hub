
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFixLatinoamericaNames = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('🔧 Iniciando corrección de nombres latinoamericanos...');
      
      const { data, error } = await supabase.functions.invoke('fix-latinoamerica-names');

      if (error) {
        console.error('❌ Error invocando función de corrección:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Error corrigiendo nombres');
      }

      console.log('✅ Corrección completada:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      
      toast({
        title: "✅ Nombres latinoamericanos corregidos",
        description: `${data.corrected_count} ingredientes corregidos, ${data.skipped_count} ya estaban correctos`,
      });
    },
    onError: (error) => {
      console.error('❌ Error en corrección:', error);
      toast({
        title: "❌ Error al corregir nombres",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
