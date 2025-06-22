
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
      console.log('🔄 Generating content:', { type, count, category, region, ingredient });
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { type, count, category, region, ingredient }
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

export const useGenerateImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ingredientName, description, ingredientId }: { 
      ingredientName: string; 
      description?: string;
      ingredientId?: string;
    }) => {
      console.log('🖼️ === STARTING IMAGE GENERATION ===');
      console.log('📋 Parameters:', { ingredientName, ingredientId });
      
      if (!ingredientId) {
        console.error('❌ No ingredient ID provided');
        throw new Error('ID del ingrediente es requerido para generar imagen');
      }

      // Verificar que el ingrediente existe
      console.log('🔍 Verifying ingredient exists...');
      const { data: existingIngredient, error: checkError } = await supabase
        .from('ingredients')
        .select('id, name, image_url')
        .eq('id', ingredientId)
        .single();
      
      if (checkError || !existingIngredient) {
        console.error('❌ Ingredient not found:', checkError);
        throw new Error('Ingrediente no encontrado en la base de datos');
      }
      
      console.log('✅ Ingredient found:', { id: existingIngredient.id, name: existingIngredient.name });
      
      // Llamar a la función de generación de imagen
      console.log('📤 Calling generate-image function...');
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          ingredientName: ingredientName,
          name: ingredientName,
          description: description 
        }
      });

      console.log('📥 Generate-image response:', { 
        success: data?.success, 
        hasImageUrl: !!data?.imageUrl,
        error 
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(`Error de función: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error('❌ Function reported error:', data?.error);
        throw new Error(data?.error || 'Error generating image');
      }

      if (!data.imageUrl) {
        console.error('❌ No image URL received');
        throw new Error('No se recibió URL de imagen');
      }
      
      console.log('✅ Image URL received:', data.imageUrl.substring(0, 50) + '...');
      
      // Actualizar ingrediente con la nueva imagen
      console.log('💾 Updating ingredient with new image...');
      const { data: updateResult, error: updateError } = await supabase
        .from('ingredients')
        .update({ 
          image_url: data.imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', ingredientId)
        .select('id, name, image_url');

      if (updateError) {
        console.error('❌ Error updating ingredient:', updateError);
        throw new Error(`Error guardando imagen: ${updateError.message}`);
      }

      if (!updateResult || updateResult.length === 0) {
        console.error('❌ No records updated');
        throw new Error('No se pudo actualizar el ingrediente');
      }

      const updatedIngredient = updateResult[0];
      console.log('✅ Ingredient updated successfully:', {
        id: updatedIngredient.id,
        name: updatedIngredient.name,
        hasImageUrl: !!updatedIngredient.image_url
      });

      return {
        success: true,
        imageUrl: data.imageUrl,
        ingredientId: ingredientId,
        ingredientName: ingredientName
      };
    },
    onSuccess: (data) => {
      console.log('🎉 Image generation mutation success');
      
      // Invalidar queries para refrescar la UI
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['ingredient'] });
      
      if (data.ingredientId) {
        queryClient.refetchQueries({ queryKey: ['ingredient', data.ingredientId] });
      }
      
      toast({
        title: "🎉 Imagen generada exitosamente",
        description: `Imagen creada para ${data.ingredientName}`,
      });
    },
    onError: (error) => {
      console.error('❌ Image generation mutation error:', error);
      toast({
        title: "❌ Error al generar imagen",
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

export const useRegenerateImages = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('🔄 Starting image regeneration for ingredients without images');
      
      // Obtener ingredientes sin imágenes
      const { data: ingredients, error: fetchError } = await supabase
        .from('ingredients')
        .select('id, name, description')
        .is('image_url', null)
        .limit(10); // Limitar para evitar timeouts

      if (fetchError) {
        console.error('❌ Error fetching ingredients:', fetchError);
        throw fetchError;
      }

      if (!ingredients || ingredients.length === 0) {
        return { processed: 0, message: 'No hay ingredientes sin imágenes' };
      }

      console.log(`📋 Found ${ingredients.length} ingredients without images`);
      
      let successCount = 0;
      let errorCount = 0;

      // Procesar ingredientes uno por uno
      for (const ingredient of ingredients) {
        try {
          console.log(`🖼️ Generating image for: ${ingredient.name}`);
          
          const { data: imageResult, error: imageError } = await supabase.functions.invoke('generate-image', {
            body: { 
              ingredientName: ingredient.name,
              name: ingredient.name,
              description: ingredient.description 
            }
          });

          if (imageError || !imageResult.success) {
            console.error(`❌ Error generating image for ${ingredient.name}:`, imageError);
            errorCount++;
            continue;
          }

          if (imageResult.imageUrl) {
            // Actualizar ingrediente con la nueva imagen
            const { error: updateError } = await supabase
              .from('ingredients')
              .update({ image_url: imageResult.imageUrl })
              .eq('id', ingredient.id);

            if (updateError) {
              console.error(`❌ Error updating ${ingredient.name}:`, updateError);
              errorCount++;
            } else {
              console.log(`✅ Successfully generated image for: ${ingredient.name}`);
              successCount++;
            }
          } else {
            console.error(`❌ No image URL returned for ${ingredient.name}`);
            errorCount++;
          }
        } catch (error) {
          console.error(`❌ Exception generating image for ${ingredient.name}:`, error);
          errorCount++;
        }
      }

      console.log(`🏁 Image regeneration completed. Success: ${successCount}, Errors: ${errorCount}`);
      return { processed: successCount, errors: errorCount };
    },
    onSuccess: (result) => {
      if (result.processed > 0) {
        toast({
          title: "🎉 Imágenes regeneradas exitosamente",
          description: `Se generaron ${result.processed} imágenes`,
        });
      } else {
        toast({
          title: "ℹ️ Sin cambios",
          description: result.message || "No había ingredientes sin imágenes",
        });
      }
    },
    onError: (error) => {
      console.error('❌ Image regeneration error:', error);
      toast({
        title: "❌ Error al regenerar imágenes",
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
