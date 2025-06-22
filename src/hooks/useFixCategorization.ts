
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFixCategorization = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('🔧 Starting categorization fix...');
      
      const spiceNames = [
        'Pimentón', 'Pimienta negra', 'Azafrán', 'Canela', 'Clavo',
        'Comino', 'Nuez moscada', 'Orégano', 'Laurel', 'Tomillo'
      ];

      // Verificar estado actual
      const { data: currentStatus, error: statusError } = await supabase
        .from('ingredients')
        .select(`id, name, category_id, categories!inner(name)`)
        .in('name', spiceNames);

      if (statusError) {
        console.error('❌ Error checking current status:', statusError);
        throw statusError;
      }

      const incorrectlyPlaced = currentStatus?.filter(ing => ing.categories?.name !== 'especias') || [];

      if (incorrectlyPlaced.length === 0) {
        return { 
          fixed: 0, 
          total: currentStatus?.length || 0,
          alreadyCorrect: true 
        };
      }

      // Obtener ID de categoría especias
      const { data: spicesCategory, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', 'especias')
        .single();

      if (categoryError || !spicesCategory) {
        throw new Error('No se pudo encontrar la categoría "especias"');
      }

      // Aplicar corrección
      const { data: updateResult, error: updateError } = await supabase
        .from('ingredients')
        .update({ category_id: spicesCategory.id })
        .in('id', incorrectlyPlaced.map(ing => ing.id))
        .select('name');

      if (updateError) {
        console.error('❌ Error applying fix:', updateError);
        throw updateError;
      }

      console.log('✅ Categorization fixed successfully');
      
      return { 
        fixed: updateResult?.length || 0,
        total: currentStatus?.length || 0,
        alreadyCorrect: false,
        details: updateResult?.map(r => r.name) || []
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      if (result.alreadyCorrect) {
        toast({
          title: "✅ Categorización correcta",
          description: `Todos los ingredientes están en la categoría correcta`,
        });
      } else if (result.fixed > 0) {
        toast({
          title: "✅ Categorización corregida",
          description: `Se corrigieron ${result.fixed} ingredientes`,
        });
      }
    },
    onError: (error) => {
      console.error('❌ Categorization fix error:', error);
      toast({
        title: "❌ Error al corregir categorización",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
