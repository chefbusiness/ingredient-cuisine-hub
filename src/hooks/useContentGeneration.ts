
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

// Hook para regenerar imágenes faltantes
export const useRegenerateImages = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      // Obtener ingredientes sin imagen
      const { data: ingredients, error: fetchError } = await supabase
        .from('ingredients')
        .select('id, name, description, image_url')
        .or('image_url.is.null,image_url.eq.');

      if (fetchError) throw fetchError;

      console.log('Ingredientes sin imagen encontrados:', ingredients?.length);

      if (!ingredients || ingredients.length === 0) {
        return { message: 'Todos los ingredientes ya tienen imagen' };
      }

      // Generar imágenes para ingredientes sin imagen
      const results = [];
      for (const ingredient of ingredients) {
        try {
          console.log('Generando imagen para:', ingredient.name);
          
          const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-image', {
            body: {
              ingredientName: ingredient.name,
              description: ingredient.description
            }
          });

          if (imageError) {
            console.error('Error generando imagen para', ingredient.name, ':', imageError);
            results.push({ 
              id: ingredient.id, 
              name: ingredient.name, 
              success: false, 
              error: imageError.message 
            });
            continue;
          }

          if (imageData?.imageUrl) {
            // Actualizar el ingrediente con la nueva imagen
            const { error: updateError } = await supabase
              .from('ingredients')
              .update({ image_url: imageData.imageUrl })
              .eq('id', ingredient.id);

            if (updateError) {
              console.error('Error actualizando imagen para', ingredient.name, ':', updateError);
              results.push({ 
                id: ingredient.id, 
                name: ingredient.name, 
                success: false, 
                error: updateError.message 
              });
            } else {
              console.log('Imagen actualizada exitosamente para:', ingredient.name);
              results.push({ 
                id: ingredient.id, 
                name: ingredient.name, 
                success: true 
              });
            }
          }

          // Pequeña pausa entre generaciones para evitar rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error: any) {
          console.error('Error procesando', ingredient.name, ':', error);
          results.push({ 
            id: ingredient.id, 
            name: ingredient.name, 
            success: false, 
            error: error.message 
          });
        }
      }

      return { 
        processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Regeneración completada",
        description: `${data.successful} imágenes generadas exitosamente de ${data.processed} procesadas`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error en regeneración",
        description: error.message || "Error al regenerar imágenes",
        variant: "destructive",
      });
    },
  });
};

// Hook para corregir categorización
export const useFixCategorization = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      // Obtener ID de categoría "especias"
      let { data: especiasCategory, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', 'especias')
        .single();

      if (categoryError && categoryError.code === 'PGRST116') {
        // Crear categoría especias si no existe
        const { data: newCategory, error: createError } = await supabase
          .from('categories')
          .insert({
            name: 'especias',
            name_en: 'spices',
            description: 'Especias y condimentos para cocina'
          })
          .select('id')
          .single();

        if (createError) throw createError;
        especiasCategory = newCategory;
      } else if (categoryError) {
        throw categoryError;
      }

      // Lista de ingredientes que deberían estar en especias
      const spiceNames = [
        'canela', 'cinnamon', 'cardamomo', 'cardamom', 'clavo', 'cloves',
        'comino', 'cumin', 'cúrcuma', 'turmeric', 'jengibre', 'ginger',
        'nuez moscada', 'nutmeg', 'paprika', 'pimienta', 'pepper',
        'azafrán', 'saffron', 'anís', 'anise'
      ];

      // Actualizar ingredientes que coincidan con nombres de especias
      const updates = [];
      for (const spiceName of spiceNames) {
        const { data: ingredients, error: fetchError } = await supabase
          .from('ingredients')
          .select('id, name, name_en')
          .or(`name.ilike.%${spiceName}%,name_en.ilike.%${spiceName}%`);

        if (fetchError) {
          console.error('Error buscando ingrediente:', spiceName, fetchError);
          continue;
        }

        if (ingredients && ingredients.length > 0) {
          for (const ingredient of ingredients) {
            const { error: updateError } = await supabase
              .from('ingredients')
              .update({ category_id: especiasCategory.id })
              .eq('id', ingredient.id);

            if (updateError) {
              console.error('Error actualizando categoría para:', ingredient.name, updateError);
            } else {
              updates.push(ingredient.name);
              console.log('Categoría actualizada para:', ingredient.name);
            }
          }
        }
      }

      return {
        updated: updates.length,
        ingredients: updates
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Categorización corregida",
        description: `${data.updated} ingredientes movidos a la categoría especias`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error corrigiendo categorización",
        description: error.message || "Error al corregir categorías",
        variant: "destructive",
      });
    },
  });
};
