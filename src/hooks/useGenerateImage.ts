
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
      console.log('🖼️ === STARTING ENHANCED SINGLE IMAGE GENERATION ===');
      console.log('📋 Parameters:', { ingredientName, ingredientId });
      
      if (!ingredientId) {
        console.error('❌ No ingredient ID provided');
        throw new Error('ID del ingrediente es requerido para generar imagen');
      }

      // PASO 1: Verificar que el ingrediente existe Y obtener estado actual
      console.log('🔍 Step 1: Verifying ingredient exists and getting current state...');
      const { data: existingIngredient, error: checkError } = await supabase
        .from('ingredients')
        .select('id, name, image_url, updated_at')
        .eq('id', ingredientId)
        .maybeSingle();
      
      if (checkError) {
        console.error('❌ Error checking ingredient:', checkError);
        throw new Error(`Error verificando ingrediente: ${checkError.message}`);
      }
      
      if (!existingIngredient) {
        console.error('❌ Ingredient not found with ID:', ingredientId);
        throw new Error('Ingrediente no encontrado en la base de datos');
      }
      
      console.log('✅ Ingredient found:', { 
        id: existingIngredient.id, 
        name: existingIngredient.name,
        hasCurrentImage: !!existingIngredient.image_url,
        currentImageUrl: existingIngredient.image_url?.substring(0, 50) + '...' || 'null'
      });
      
      // PASO 2: Generar imagen con Flux
      console.log('📤 Step 2: Calling generate-image function...');
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
        error: error?.message || 'none'
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(`Error en la función: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error('❌ Function reported error:', data?.error);
        throw new Error(data?.error || 'Error generando imagen');
      }

      if (!data.imageUrl) {
        console.error('❌ No image URL received');
        throw new Error('No se recibió URL de imagen');
      }
      
      console.log('✅ Image URL received successfully');
      console.log('🔗 New Image URL (first 80 chars):', data.imageUrl.substring(0, 80) + '...');
      
      // PASO 3: Guardar en la base de datos con verificación exhaustiva
      console.log('💾 Step 3: Saving to database with enhanced verification...');
      
      const timestamp = new Date().toISOString();
      const { data: updateResult, error: updateError } = await supabase
        .from('ingredients')
        .update({ 
          image_url: data.imageUrl,
          updated_at: timestamp
        })
        .eq('id', ingredientId)
        .select('id, name, image_url, updated_at');

      console.log('📊 Update operation result:', {
        error: updateError?.message || 'none',
        resultCount: updateResult?.length || 0,
        resultData: updateResult ? 'present' : 'null'
      });

      if (updateError) {
        console.error('❌ Database update error:', updateError);
        throw new Error(`Error guardando imagen: ${updateError.message}`);
      }

      if (!updateResult || updateResult.length === 0) {
        console.error('❌ No rows updated - possible causes:');
        console.error('   - Ingredient ID not found:', ingredientId);
        console.error('   - RLS policy blocking update');
        console.error('   - Database constraint violation');
        throw new Error('No se pudo actualizar el ingrediente - no se encontraron filas para actualizar');
      }

      const updatedIngredient = updateResult[0];
      
      // PASO 4: Verificación POST-UPDATE
      console.log('🔎 Step 4: POST-UPDATE verification...');
      console.log('📋 Updated ingredient data:', {
        id: updatedIngredient.id,
        name: updatedIngredient.name,
        hasImageUrl: !!updatedIngredient.image_url,
        imageUrlMatch: updatedIngredient.image_url === data.imageUrl,
        updatedAt: updatedIngredient.updated_at
      });

      if (!updatedIngredient.image_url) {
        console.error('❌ CRITICAL: Image URL is NULL after update!');
        throw new Error('La URL de imagen no se guardó correctamente - campo NULL después de actualización');
      }

      if (updatedIngredient.image_url !== data.imageUrl) {
        console.error('❌ CRITICAL: Image URL mismatch after update!');
        console.error('   Expected:', data.imageUrl.substring(0, 50) + '...');
        console.error('   Actual:', updatedIngredient.image_url.substring(0, 50) + '...');
        throw new Error('La URL de imagen guardada no coincide con la generada');
      }

      // PASO 5: Verificación adicional con SELECT independiente
      console.log('🔍 Step 5: Independent SELECT verification...');
      const { data: verificationResult, error: verificationError } = await supabase
        .from('ingredients')
        .select('id, name, image_url, updated_at')
        .eq('id', ingredientId)
        .maybeSingle();

      if (verificationError) {
        console.error('❌ Verification SELECT error:', verificationError);
        // No lanzar error aquí, solo advertir
        console.warn('⚠️ Could not verify save with independent SELECT');
      } else if (!verificationResult?.image_url) {
        console.error('❌ CRITICAL: Independent SELECT shows NULL image_url!');
        throw new Error('Verificación independiente muestra que la imagen no se guardó');
      } else if (verificationResult.image_url !== data.imageUrl) {
        console.error('❌ CRITICAL: Independent SELECT shows different image_url!');
        throw new Error('Verificación independiente muestra URL de imagen diferente');
      } else {
        console.log('✅ Independent SELECT verification PASSED');
        console.log('🔗 Verified URL (first 50 chars):', verificationResult.image_url.substring(0, 50) + '...');
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
    },
    onSuccess: (data) => {
      console.log('🎉 Individual image generation SUCCESS - invalidating queries');
      
      // Invalidar queries para actualizar la UI automáticamente
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['ingredient', data.ingredientId] });
      
      toast({
        title: "✅ Imagen generada y guardada",
        description: `Nueva imagen verificada para ${data.ingredientName}`,
      });
    },
    onError: (error) => {
      console.error('❌ Individual image generation FAILED:', error);
      toast({
        title: "❌ Error al generar imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
