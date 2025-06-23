
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCompleteIngredientsData = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ingredientIds }: { ingredientIds: string[] }) => {
      console.log('=== INICIANDO RECUPERACIÓN DEFINITIVA DE DATOS ===');
      console.log(`🔄 Procesando ${ingredientIds.length} ingredientes`);

      let completedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      const successDetails: string[] = [];

      // Mostrar toast de inicio
      toast({
        title: "🔄 Recuperación iniciada",
        description: `Procesando ${ingredientIds.length} ingredientes con verificación completa...`,
      });

      for (const ingredientId of ingredientIds) {
        try {
          console.log(`\n=== PROCESANDO INGREDIENTE ${ingredientId} ===`);
          
          // 1. OBTENER EL INGREDIENTE ACTUAL
          const { data: ingredient, error: fetchError } = await supabase
            .from('ingredients')
            .select('id, name, description, name_fr, name_it, name_pt, name_zh')
            .eq('id', ingredientId)
            .single();

          if (fetchError || !ingredient) {
            console.error(`❌ Error obteniendo ingrediente ${ingredientId}:`, fetchError);
            errorCount++;
            errors.push(`Error obteniendo ingrediente ${ingredientId}: ${fetchError?.message || 'Ingrediente no encontrado'}`);
            continue;
          }

          console.log(`📥 Ingrediente obtenido: ${ingredient.name}`);
          console.log(`🔍 Estado actual idiomas:`, {
            fr: ingredient.name_fr || 'FALTANTE',
            it: ingredient.name_it || 'FALTANTE', 
            pt: ingredient.name_pt || 'FALTANTE',
            zh: ingredient.name_zh || 'FALTANTE'
          });

          // Verificar si necesita completar idiomas
          const needsFrench = !ingredient.name_fr;
          const needsItalian = !ingredient.name_it;
          const needsPortuguese = !ingredient.name_pt;
          const needsChinese = !ingredient.name_zh;
          
          if (!needsFrench && !needsItalian && !needsPortuguese && !needsChinese) {
            console.log(`✅ ${ingredient.name} ya tiene todos los idiomas completos`);
            completedCount++;
            successDetails.push(`${ingredient.name}: Ya completo`);
            continue;
          }

          console.log(`🤖 Generando idiomas faltantes para: ${ingredient.name}`);

          // 2. GENERAR DATOS CON PERPLEXITY
          const { data: generatedData, error: generateError } = await supabase.functions.invoke('generate-content', {
            body: {
              type: 'ingredient',
              ingredient: ingredient.name,
              count: 1
            }
          });

          if (generateError) {
            console.error(`❌ Error en función de generación:`, generateError);
            errorCount++;
            errors.push(`Error generando para ${ingredient.name}: ${generateError.message}`);
            continue;
          }

          if (!generatedData?.success || !generatedData?.data?.[0]) {
            console.error(`❌ Respuesta inválida de generación para ${ingredient.name}:`, generatedData);
            errorCount++;
            errors.push(`Respuesta inválida para ${ingredient.name}`);
            continue;
          }

          const completedIngredient = generatedData.data[0];
          console.log(`🎯 Datos generados:`, {
            name_fr: completedIngredient.name_fr || 'NO GENERADO',
            name_it: completedIngredient.name_it || 'NO GENERADO',
            name_pt: completedIngredient.name_pt || 'NO GENERADO', 
            name_zh: completedIngredient.name_zh || 'NO GENERADO'
          });

          // 3. PREPARAR ACTUALIZACIÓN SOLO DE IDIOMAS FALTANTES
          const updateData: any = {};
          let fieldsToUpdate: string[] = [];

          if (needsFrench && completedIngredient.name_fr) {
            updateData.name_fr = completedIngredient.name_fr;
            fieldsToUpdate.push('name_fr');
          }
          if (needsItalian && completedIngredient.name_it) {
            updateData.name_it = completedIngredient.name_it;
            fieldsToUpdate.push('name_it');
          }
          if (needsPortuguese && completedIngredient.name_pt) {
            updateData.name_pt = completedIngredient.name_pt;
            fieldsToUpdate.push('name_pt');
          }
          if (needsChinese && completedIngredient.name_zh) {
            updateData.name_zh = completedIngredient.name_zh;
            fieldsToUpdate.push('name_zh');
          }

          if (fieldsToUpdate.length === 0) {
            console.warn(`⚠️ No se generaron idiomas válidos para ${ingredient.name}`);
            errorCount++;
            errors.push(`No se generaron idiomas válidos para ${ingredient.name}`);
            continue;
          }

          console.log(`💾 Actualizando campos: [${fieldsToUpdate.join(', ')}]`);
          console.log(`📝 Datos a actualizar:`, updateData);

          // 4. EJECUTAR UPDATE EN SUPABASE CON MANEJO DE ERRORES DETALLADO
          const { data: updateResult, error: updateError } = await supabase
            .from('ingredients')
            .update(updateData)
            .eq('id', ingredientId)
            .select('id, name, name_fr, name_it, name_pt, name_zh');

          if (updateError) {
            console.error(`❌ Error en UPDATE de Supabase:`, updateError);
            errorCount++;
            errors.push(`Error actualizando ${ingredient.name}: ${updateError.message}`);
            continue;
          }

          if (!updateResult || updateResult.length === 0) {
            console.error(`❌ UPDATE no retornó datos para ${ingredient.name}`);
            errorCount++;
            errors.push(`UPDATE sin resultados para ${ingredient.name}`);
            continue;
          }

          console.log(`✅ UPDATE exitoso, datos retornados:`, updateResult[0]);

          // 5. VERIFICACIÓN POST-UPDATE
          const updatedIngredient = updateResult[0];
          const verifySuccess: string[] = [];
          const verifyFailed: string[] = [];

          if (needsFrench) {
            if (updatedIngredient.name_fr) {
              verifySuccess.push(`Francés: ${updatedIngredient.name_fr}`);
            } else {
              verifyFailed.push('Francés');
            }
          }
          if (needsItalian) {
            if (updatedIngredient.name_it) {
              verifySuccess.push(`Italiano: ${updatedIngredient.name_it}`);
            } else {
              verifyFailed.push('Italiano');
            }
          }
          if (needsPortuguese) {
            if (updatedIngredient.name_pt) {
              verifySuccess.push(`Portugués: ${updatedIngredient.name_pt}`);
            } else {
              verifyFailed.push('Portugués');
            }
          }
          if (needsChinese) {
            if (updatedIngredient.name_zh) {
              verifySuccess.push(`Chino: ${updatedIngredient.name_zh}`);
            } else {
              verifyFailed.push('Chino');
            }
          }

          if (verifyFailed.length > 0) {
            console.error(`❌ Verificación falló para ${ingredient.name}:`, verifyFailed);
            errorCount++;
            errors.push(`Verificación falló para ${ingredient.name}: ${verifyFailed.join(', ')}`);
            continue;
          }

          console.log(`🎉 ÉXITO COMPLETO para ${ingredient.name}:`);
          console.log(`   Idiomas guardados: ${verifySuccess.join(', ')}`);
          
          completedCount++;
          successDetails.push(`${ingredient.name}: ${verifySuccess.length} idiomas agregados`);

        } catch (error) {
          console.error(`💥 Error crítico procesando ingrediente ${ingredientId}:`, error);
          errorCount++;
          errors.push(`Error crítico en ${ingredientId}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      console.log('\n🏁 RECUPERACIÓN TERMINADA:');
      console.log(`   ✅ Exitosos: ${completedCount}`);
      console.log(`   ❌ Errores: ${errorCount}`);
      console.log(`   📊 Total: ${ingredientIds.length}`);
      
      if (successDetails.length > 0) {
        console.log('📋 Detalles de éxito:', successDetails);
      }
      if (errors.length > 0) {
        console.log('📋 Detalles de errores:', errors);
      }

      return { 
        completedCount, 
        errorCount, 
        total: ingredientIds.length, 
        errors,
        successDetails
      };
    },
    onSuccess: (result) => {
      console.log('🎯 Recuperación finalizada:', result);
      
      // Invalidar queries para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['data-status'] });
      
      if (result.completedCount > 0) {
        toast({
          title: "🎉 ¡Recuperación exitosa!",
          description: `${result.completedCount} ingredientes completados. ${result.errorCount > 0 ? `${result.errorCount} errores.` : '¡Sin errores!'}`,
        });
        
        if (result.successDetails.length > 0) {
          console.log('🏆 INGREDIENTES ACTUALIZADOS:', result.successDetails);
        }
      } else {
        toast({
          title: "⚠️ Sin actualizaciones",
          description: `No se completaron ingredientes. ${result.errorCount} errores encontrados.`,
          variant: "destructive",
        });
      }
      
      if (result.errors.length > 0) {
        console.log('🔍 ERRORES DETALLADOS:', result.errors);
      }
    },
    onError: (error) => {
      console.error('💥 Error crítico en recuperación:', error);
      toast({
        title: "💥 Error crítico",
        description: `Error en recuperación: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
