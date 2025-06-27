
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UpdatePriceParams {
  priceId?: string;
  ingredientId: string;
  countryId: string;
  price: number;
  unit: string;
  seasonVariation?: string;
}

export const useUpdateIngredientPrice = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdatePriceParams) => {
      console.log('💰 === UPDATING INGREDIENT PRICE ===');
      console.log('📋 Params:', params);

      if (params.priceId) {
        // Actualizar precio existente
        const { data, error } = await supabase
          .from('ingredient_prices')
          .update({
            price: params.price,
            unit: params.unit,
            season_variation: params.seasonVariation,
            updated_at: new Date().toISOString()
          })
          .eq('id', params.priceId)
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating price:', error);
          throw error;
        }

        console.log('✅ Price updated successfully:', data);
        return data;
      } else {
        // Crear nuevo precio
        const { data, error } = await supabase
          .from('ingredient_prices')
          .insert({
            ingredient_id: params.ingredientId,
            country_id: params.countryId,
            price: params.price,
            unit: params.unit,
            season_variation: params.seasonVariation
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Error creating price:', error);
          throw error;
        }

        console.log('✅ Price created successfully:', data);
        return data;
      }
    },
    onSuccess: (data, variables) => {
      toast({
        title: "✅ Precio actualizado",
        description: `Precio de ${variables.price}€/${variables.unit} guardado exitosamente`,
      });

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['ingredient', variables.ingredientId] });
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
    onError: (error: any) => {
      console.error('❌ Error in price update:', error);
      
      toast({
        title: "❌ Error al actualizar precio",
        description: error.message || "No se pudo actualizar el precio",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteIngredientPrice = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ priceId, ingredientId }: { priceId: string; ingredientId: string }) => {
      console.log('🗑️ === DELETING INGREDIENT PRICE ===');
      console.log('📋 Price ID:', priceId);

      const { error } = await supabase
        .from('ingredient_prices')
        .delete()
        .eq('id', priceId);

      if (error) {
        console.error('❌ Error deleting price:', error);
        throw error;
      }

      console.log('✅ Price deleted successfully');
      return { priceId, ingredientId };
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Precio eliminado",
        description: "El precio ha sido eliminado exitosamente",
      });

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['ingredient', data.ingredientId] });
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
    onError: (error: any) => {
      console.error('❌ Error in price deletion:', error);
      
      toast({
        title: "❌ Error al eliminar precio",
        description: error.message || "No se pudo eliminar el precio",
        variant: "destructive",
      });
    },
  });
};
