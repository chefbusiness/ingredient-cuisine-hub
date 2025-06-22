
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
      console.log('🖼️ === ENHANCED SINGLE IMAGE GENERATION (BATCH COMPATIBLE) ===');
      console.log('📋 Input parameters:', { 
        ingredientName, 
        ingredientId, 
        hasDescription: !!description 
      });
      
      if (!ingredientId) {
        console.error('❌ No ingredient ID provided');
        throw new Error('ID del ingrediente es requerido para generar imagen');
      }

      // PASO 1: Pre-validación mejorada del ingrediente
      console.log('🔍 Step 1: Enhanced ingredient pre-validation...');
      const { data: existingIngredient, error: checkError } = await supabase
        .from('ingredients')
        .select('id, name, image_url, updated_at, created_at')
        .eq('id', ingredientId)
        .maybeSingle();
      
      if (checkError) {
        console.error('❌ Pre-validation error:', checkError);
        throw new Error(`Error verificando ingrediente: ${checkError.message}`);
      }
      
      if (!existingIngredient) {
        console.error('❌ Ingredient not found during pre-validation:', ingredientId);
        throw new Error('Ingrediente no encontrado en la base de datos');
      }
      
      console.log('✅ Pre-validation successful:', { 
        id: existingIngredient.id, 
        name: existingIngredient.name,
        hasCurrentImage: !!existingIngredient.image_url,
        createdAt: existingIngredient.created_at,
        timeSinceCreation: Date.now() - new Date(existingIngredient.created_at).getTime()
      });
      
      // PASO 2: Verificación de conectividad de la función
      console.log('🔗 Step 2: Testing generate-image function connectivity...');
      try {
        // Pequeña pausa adicional si el ingrediente es muy reciente
        const timeSinceCreation = Date.now() - new Date(existingIngredient.created_at).getTime();
        if (timeSinceCreation < 2000) {
          console.log('⏸️ Ingredient very recent, adding extra delay...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('📤 Calling generate-image function with enhanced payload...');
        const { data, error } = await supabase.functions.invoke('generate-image', {
          body: { 
            ingredientName: ingredientName,
            name: ingredientName,
            description: description,
            ingredientId: ingredientId // Añadir ID para debugging
          }
        });

        console.log('📥 Function response analysis:', { 
          hasData: !!data,
          success: data?.success,
          hasImageUrl: !!data?.imageUrl,
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
        
        console.log('✅ Image generation successful:', {
          imageUrlLength: data.imageUrl.length,
          imageUrlPrefix: data.imageUrl.substring(0, 50) + '...'
        });
        
        // PASO 3: Guardado en base de datos con retry logic
        console.log('💾 Step 3: Enhanced database save with retry...');
        
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
        
        // PASO 4: Verificación final exhaustiva
        console.log('🔎 Step 4: Final verification...');
        if (!updatedIngredient.image_url || updatedIngredient.image_url !== data.imageUrl) {
          console.error('❌ Final verification failed:', {
            hasImageUrl: !!updatedIngredient.image_url,
            urlsMatch: updatedIngredient.image_url === data.imageUrl
          });
          throw new Error('Verificación final falló - imagen no guardada correctamente');
        }

        console.log('🎉 === IMAGE GENERATION AND SAVE COMPLETELY SUCCESSFUL ===');
        
        return {
          success: true,
          imageUrl: data.imageUrl,
          ingredientId: ingredientId,
          ingredientName: ingredientName,
          savedToDatabase: true,
          verifiedSave: true,
          updatedIngredient: updatedIngredient
        };
        
      } catch (functionError) {
        console.error('❌ Enhanced image generation failed:', functionError);
        throw functionError;
      }
    },
    onSuccess: (data) => {
      console.log('🎉 Enhanced image generation SUCCESS - invalidating queries');
      
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['ingredient', data.ingredientId] });
      
      toast({
        title: "✅ Imagen generada exitosamente",
        description: `Nueva imagen verificada para ${data.ingredientName}`,
      });
    },
    onError: (error) => {
      console.error('❌ Enhanced image generation FAILED:', error);
      toast({
        title: "❌ Error al generar imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
