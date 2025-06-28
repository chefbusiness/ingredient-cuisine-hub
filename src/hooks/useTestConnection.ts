
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTestConnection = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('🔧 Iniciando test de conexión...');
      
      const { data, error } = await supabase.functions.invoke('test-connection', {
        body: {}
      });

      if (error) {
        console.error('❌ Error en test-connection:', error);
        throw error;
      }

      console.log('✅ Test de conexión completado:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('🎉 Resultado del test:', data);
      
      const perplexityWorking = data.connectivity_tests?.perplexity_api;
      const perplexityConfigured = data.environment_variables?.perplexity_key_present;
      
      if (perplexityConfigured && perplexityWorking) {
        toast({
          title: "✅ Conexiones funcionando correctamente",
          description: "Perplexity API configurada y conectada correctamente",
        });
      } else if (perplexityConfigured && !perplexityWorking) {
        toast({
          title: "⚠️ API configurada pero con problemas de conexión",
          description: "La clave API está presente pero hay problemas de conectividad",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Perplexity API no configurada",
          description: "La clave PERPLEXITY_API_KEY no está disponible en Edge Functions",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('❌ Error en test de conexión:', error);
      toast({
        title: "❌ Error en test de conexión",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
