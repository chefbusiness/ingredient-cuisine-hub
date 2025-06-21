
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGenerateContent = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ type, count, category, region, ingredient }: { 
      type: string; 
      count: number; 
      category?: string;
      region?: string;
      ingredient?: string;
    }) => {
      console.log('Generating content:', { type, count, category, region, ingredient });
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { type, count, category, region, ingredient }
      });

      if (error) {
        console.error('Error invoking generate-content:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Error generating content');
      }

      console.log('Generated content successfully:', data.data);
      return data.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Contenido generado exitosamente",
        description: `Se generaron ${data.length} elementos`,
      });
    },
    onError: (error) => {
      console.error('Generation error:', error);
      toast({
        title: "Error al generar contenido",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useGenerateImage = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ingredientName, description }: { ingredientName: string; description?: string }) => {
      console.log('Generating image for:', ingredientName);
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          name: ingredientName,
          description: description 
        }
      });

      if (error) {
        console.error('Error generating image:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Error generating image');
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Imagen generada exitosamente",
        description: "La imagen se ha generado correctamente",
      });
    },
    onError: (error) => {
      console.error('Image generation error:', error);
      toast({
        title: "Error al generar imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useSaveGeneratedContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ type, data }: { type: string; data: any[] }) => {
      console.log('Saving content:', { type, count: data.length });
      
      const { data: result, error } = await supabase.functions.invoke('save-generated-content', {
        body: { type, data }
      });

      if (error) {
        console.error('Error saving content:', error);
        throw error;
      }

      if (!result.success) {
        throw new Error('Error saving content');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Contenido guardado exitosamente",
        description: "El contenido se ha guardado en la base de datos",
      });
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast({
        title: "Error al guardar contenido",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useSaveContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ type, data }: { type: string; data: any[] }) => {
      console.log('Saving content:', { type, count: data.length });
      
      const { data: result, error } = await supabase.functions.invoke('save-generated-content', {
        body: { type, data }
      });

      if (error) {
        console.error('Error saving content:', error);
        throw error;
      }

      if (!result.success) {
        throw new Error('Error saving content');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Contenido guardado exitosamente",
        description: "El contenido se ha guardado en la base de datos",
      });
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast({
        title: "Error al guardar contenido",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRegenerateImages = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('Starting image regeneration for ingredients without images');
      
      // Primero obtenemos ingredientes sin imágenes
      const { data: ingredients, error: fetchError } = await supabase
        .from('ingredients')
        .select('id, name, description')
        .is('image_url', null);

      if (fetchError) {
        console.error('Error fetching ingredients without images:', fetchError);
        throw fetchError;
      }

      if (!ingredients || ingredients.length === 0) {
        toast({
          title: "No hay ingredientes sin imágenes",
          description: "Todos los ingredientes ya tienen imágenes asignadas",
        });
        return { processed: 0 };
      }

      console.log(`Found ${ingredients.length} ingredients without images`);
      
      // Procesamos cada ingrediente para generar su imagen
      let successCount = 0;
      let errorCount = 0;

      for (const ingredient of ingredients) {
        try {
          console.log(`Generating image for: ${ingredient.name}`);
          
          const { data: imageResult, error: imageError } = await supabase.functions.invoke('generate-image', {
            body: { 
              name: ingredient.name,
              description: ingredient.description 
            }
          });

          if (imageError) {
            console.error(`Error generating image for ${ingredient.name}:`, imageError);
            errorCount++;
            continue;
          }

          if (imageResult.success && imageResult.image_url) {
            // Actualizamos el ingrediente con la nueva imagen
            const { error: updateError } = await supabase
              .from('ingredients')
              .update({ image_url: imageResult.image_url })
              .eq('id', ingredient.id);

            if (updateError) {
              console.error(`Error updating ingredient ${ingredient.name}:`, updateError);
              errorCount++;
            } else {
              console.log(`Successfully generated image for: ${ingredient.name}`);
              successCount++;
            }
          } else {
            console.error(`No image URL returned for ${ingredient.name}`);
            errorCount++;
          }
        } catch (error) {
          console.error(`Exception generating image for ${ingredient.name}:`, error);
          errorCount++;
        }
      }

      console.log(`Image regeneration completed. Success: ${successCount}, Errors: ${errorCount}`);
      return { processed: successCount, errors: errorCount };
    },
    onSuccess: (result) => {
      if (result.processed > 0) {
        toast({
          title: "Imágenes regeneradas exitosamente",
          description: `Se generaron ${result.processed} imágenes`,
        });
      }
    },
    onError: (error) => {
      console.error('Image regeneration error:', error);
      toast({
        title: "Error al regenerar imágenes",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useFixCategorization = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('=== INICIANDO VERIFICACIÓN DE CATEGORIZACIÓN ===');
      
      // Lista de ingredientes de especias
      const spiceNames = [
        'Pimentón',
        'Pimienta negra',
        'Azafrán', 
        'Canela',
        'Clavo',
        'Comino',
        'Nuez moscada',
        'Orégano',
        'Laurel',
        'Tomillo'
      ];

      // Verificamos la categorización actual
      const { data: currentStatus, error: statusError } = await supabase
        .from('ingredients')
        .select(`
          id, 
          name, 
          category_id,
          categories!inner(name)
        `)
        .in('name', spiceNames);

      if (statusError) {
        console.error('Error verificando estado actual:', statusError);
        throw statusError;
      }

      console.log('Estado actual de los ingredientes de especias:');
      currentStatus?.forEach(ingredient => {
        console.log(`- ${ingredient.name}: ${ingredient.categories?.name}`);
      });

      // Contar cuántos están correctamente categorizados
      const correctlyPlaced = currentStatus?.filter(ing => ing.categories?.name === 'especias') || [];
      const incorrectlyPlaced = currentStatus?.filter(ing => ing.categories?.name !== 'especias') || [];

      console.log(`✅ Correctamente en "especias": ${correctlyPlaced.length}`);
      console.log(`❌ En categoría incorrecta: ${incorrectlyPlaced.length}`);

      if (incorrectlyPlaced.length === 0) {
        toast({
          title: "✅ Categorización correcta",
          description: `Todos los ${correctlyPlaced.length} ingredientes de especias están en la categoría correcta`,
        });
        return { 
          fixed: 0, 
          total: correctlyPlaced.length,
          alreadyCorrect: true,
          details: correctlyPlaced.map(i => i.name)
        };
      }

      // Si hay ingredientes mal categorizados, intentamos corregirlos
      console.log('Ingredientes que necesitan corrección:', incorrectlyPlaced.map(i => i.name));
      
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
        console.error('Error aplicando corrección:', updateError);
        throw updateError;
      }

      console.log('✅ Corrección aplicada exitosamente a:', updateResult?.map(r => r.name));
      
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
          title: "✅ Categorización ya está correcta",
          description: `Todos los ${result.total} ingredientes de especias están en la categoría correcta`,
        });
      } else if (result.fixed > 0) {
        toast({
          title: "✅ Categorización corregida",
          description: `Se corrigieron ${result.fixed} ingredientes: ${result.details.join(', ')}`,
        });
      }
    },
    onError: (error) => {
      console.error('Error en verificación/corrección:', error);
      toast({
        title: "Error al verificar categorización",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
