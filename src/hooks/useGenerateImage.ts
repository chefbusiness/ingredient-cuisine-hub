
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGenerateImage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ingredientName, description, ingredientId }: { 
      ingredientName: string; 
      description?: string;
      ingredientId?: string;
    }) => {
      console.log('🖼️ === ENHANCED INTELLIGENT IMAGE GENERATION ===');
      console.log('📋 Input parameters:', { 
        ingredientName, 
        ingredientId, 
        hasDescription: !!description 
      });
      
      if (!ingredientId) {
        console.error('❌ No ingredient ID provided');
        throw new Error('ID del ingrediente es requerido para generar imagen');
      }

      // PASO 1: Validación mejorada del ingrediente
      console.log('🔍 Step 1: Enhanced ingredient validation...');
      const { data: existingIngredient, error: checkError } = await supabase
        .from('ingredients')
        .select(`
          id, 
          name, 
          description, 
          image_url, 
          updated_at, 
          created_at,
          categories(name)
        `)
        .eq('id', ingredientId)
        .maybeSingle();
      
      if (checkError) {
        console.error('❌ Validation error:', checkError);
        throw new Error(`Error verificando ingrediente: ${checkError.message}`);
      }
      
      if (!existingIngredient) {
        console.error('❌ Ingredient not found during validation:', ingredientId);
        throw new Error('Ingrediente no encontrado en la base de datos');
      }
      
      console.log('✅ Validation successful:', { 
        id: existingIngredient.id, 
        name: existingIngredient.name,
        category: existingIngredient.categories?.name,
        hasCurrentImage: !!existingIngredient.image_url,
        hasDescription: !!existingIngredient.description
      });
      
      // PASO 2: Llamada a la función con contexto mejorado
      console.log('🧠 Step 2: Calling intelligent image generation...');
      try {
        const { data, error } = await supabase.functions.invoke('generate-image', {
          body: { 
            ingredientName: existingIngredient.name,
            name: existingIngredient.name,
            description: existingIngredient.description || description,
            ingredientId: ingredientId,
            category: existingIngredient.categories?.name
          }
        });

        console.log('📥 Function response analysis:', { 
          hasData: !!data,
          success: data?.success,
          hasImageUrl: !!data?.imageUrl,
          intelligentPrompt: data?.intelligentPrompt,
          hasError: !!error,
          errorMessage: error?.message || 'none'
        });

        if (error) {
          console.error('❌ Supabase function error:', error);
          throw new Error(`Error en la función generate-image: ${error.message}`);
        }

        if (!data || !data.success) {
          console.error('❌ Function returned error:', data?.error);
          throw new Error(data?.error || 'Error generando imagen con Flux');
        }

        if (!data.imageUrl) {
          console.error('❌ No image URL received from function');
          throw new Error('No se recibió URL de imagen desde Flux');
        }
        
        console.log('✅ Intelligent image generation successful:', {
          imageUrlLength: data.imageUrl.length,
          imageUrlPrefix: data.imageUrl.substring(0, 50) + '...',
          intelligentPrompt: data.intelligentPrompt
        });
        
        // PASO 3: Guardado en base de datos con retry
        console.log('💾 Step 3: Enhanced database save...');
        
        const saveImageToDb = async (retryCount = 0) => {
          const timestamp = new Date().toISOString();
          
          console.log(`🔄 Save attempt ${retryCount + 1}/3`);
          
          const { data: updateResult, error: updateError } = await supabase
            .from('ingredients')
            .update({ 
              image_url: data.imageUrl,
              updated_at: timestamp
            })
            .eq('id', ingredientId)
            .select('id, name, image_url, updated_at');

          if (updateError) {
            console.error(`❌ Save attempt ${retryCount + 1} failed:`, updateError);
            if (retryCount < 2) {
              console.log('🔄 Retrying save operation...');
              await new Promise(resolve => setTimeout(resolve, 500));
              return saveImageToDb(retryCount + 1);
            }
            throw new Error(`Error guardando imagen después de ${retryCount + 1} intentos: ${updateError.message}`);
          }

          if (!updateResult || updateResult.length === 0) {
            console.error(`❌ No rows updated on attempt ${retryCount + 1}`);
            if (retryCount < 2) {
              console.log('🔄 Retrying save operation...');
              await new Promise(resolve => setTimeout(resolve, 500));
              return saveImageToDb(retryCount + 1);
            }
            throw new Error(`No se pudo actualizar el ingrediente después de ${retryCount + 1} intentos`);
          }

          return updateResult[0];
        };

        const updatedIngredient = await saveImageToDb();
        
        // PASO 4: Verificación final
        console.log('🔎 Step 4: Final verification...');
        if (!updatedIngredient.image_url || updatedIngredient.image_url !== data.imageUrl) {
          console.error('❌ Final verification failed:', {
            hasImageUrl: !!updatedIngredient.image_url,
            urlsMatch: updatedIngredient.image_url === data.imageUrl
          });
          throw new Error('Verificación final falló - imagen no guardada correctamente');
        }

        console.log('🎉 === INTELLIGENT IMAGE GENERATION COMPLETELY SUCCESSFUL ===');
        
        return {
          success: true,
          imageUrl: data.imageUrl,
          ingredientId: ingredientId,
          ingredientName: existingIngredient.name,
          savedToDatabase: true,
          verifiedSave: true,
          intelligentPrompt: data.intelligentPrompt,
          detectedType: data.detectedType,
          updatedIngredient: updatedIngredient
        };
        
      } catch (functionError) {
        console.error('❌ Intelligent image generation failed:', functionError);
        throw functionError;
      }
    },
    onSuccess: (data) => {
      console.log('🎉 Intelligent image generation SUCCESS - invalidating queries');
      
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['ingredient', data.ingredientId] });
      
      toast({
        title: "✅ Imagen inteligente generada",
        description: `Nueva imagen optimizada para ${data.ingredientName}`,
      });
    },
    onError: (error) => {
      console.error('❌ Intelligent image generation FAILED:', error);
      toast({
        title: "❌ Error al generar imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
