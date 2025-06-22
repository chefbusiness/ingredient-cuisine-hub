
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('ingredient_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setFavorites(data.map(fav => fav.ingredient_id));
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (ingredientId: string) => {
    if (!user) {
      toast({
        title: "Registro requerido",
        description: "Inicia sesión para guardar favoritos",
        variant: "destructive"
      });
      return;
    }

    const isFavorite = favorites.includes(ingredientId);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('ingredient_id', ingredientId);

        if (error) throw error;

        setFavorites(prev => prev.filter(id => id !== ingredientId));
        toast({
          title: "Eliminado de favoritos",
          description: "El ingrediente se ha eliminado de tus favoritos"
        });
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            ingredient_id: ingredientId
          });

        if (error) throw error;

        setFavorites(prev => [...prev, ingredientId]);
        toast({
          title: "Agregado a favoritos",
          description: "El ingrediente se ha guardado en tus favoritos"
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar favoritos",
        variant: "destructive"
      });
    }
  };

  const isFavorite = (ingredientId: string) => favorites.includes(ingredientId);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite
  };
};
