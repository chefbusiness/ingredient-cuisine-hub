
import { generatePrompt } from './prompts.ts';
import { PerplexityClient } from './perplexity-client.ts';
import { GenerateContentParams } from './types.ts';

// FUNCIONES DE VALIDACIÓN OPTIMIZADAS PARA GENERACIÓN MASIVA
const normalizeForComparison = (text: string): string => {
  if (!text) return '';
  return text.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normalizar espacios
    .replace(/de\s+/gi, '') // Remover "de" pero conservar estructura
    .replace(/del\s+/gi, '') // Remover "del" pero conservar estructura
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e') 
    .replace(/[íìï]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/ç/g, 'c');
};

const isSpecificDuplicate = (requestedName: string, existingIngredients: any[]): boolean => {
  const normalizedRequested = normalizeForComparison(requestedName);
  console.log(`🔍 Verificando duplicado específico para: "${requestedName}" -> normalizado: "${normalizedRequested}"`);
  
  const isDupe = existingIngredients.some(existing => {
    const existingNames = [
      existing.name,
      existing.name_en,
      existing.name_fr,
      existing.name_it,
      existing.name_pt,
      existing.name_la
    ].filter(Boolean);
    
    return existingNames.some(existingName => {
      const normalizedExisting = normalizeForComparison(existingName);
      
      // SOLO comparación exacta - no más includes que causaba problemas
      const isExactMatch = normalizedExisting === normalizedRequested;
      
      if (isExactMatch) {
        console.log(`⚠️ DUPLICADO EXACTO ENCONTRADO: "${requestedName}" coincide con "${existingName}"`);
      }
      
      return isExactMatch;
    });
  });
  
  console.log(`✅ Resultado verificación duplicado: ${isDupe ? 'ES DUPLICADO' : 'NO ES DUPLICADO'}`);
  return isDupe;
};

// NUEVA FUNCIÓN: Pre-filtrado masivo de duplicados por categoría
const getExistingIngredientsByCategory = (existingIngredients: any[], category?: string): string[] => {
  if (!category) return [];
  
  const categoryIngredients = existingIngredients
    .filter(ing => ing.categories?.name === category)
    .map(ing => [ing.name, ing.name_en, ing.name_fr, ing.name_it, ing.name_pt, ing.name_la])
    .flat()
    .filter(Boolean)
    .map(name => normalizeForComparison(name));
  
  console.log(`📊 Ingredientes existentes en categoría "${category}":`, categoryIngredients.length);
  return categoryIngredients;
};

export async function generateIngredientData(
  count: number, 
  category?: string, 
  additionalPrompt?: string,
  ingredientsList?: string[]
): Promise<any[]> {
  console.log('🚀 === INICIANDO GENERACIÓN MASIVA OPTIMIZADA DE INGREDIENTES ===');
  console.log('📋 Input parameters:', { 
    count, 
    category, 
    ingredientsList: ingredientsList?.length || 0,
    hasIngredientsList: !!ingredientsList && ingredientsList.length > 0,
    isMassive: count > 10
  });
  
  const perplexity = new PerplexityClient();
  
  try {
    // Fetch existing ingredients to avoid duplicates
    console.log('📋 Fetching existing ingredients for enhanced duplicate detection...');
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.7.1');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const { data: existingIngredients, error: fetchError } = await supabase
      .from('ingredients')
      .select(`
        id, name, name_en, name_fr, name_it, name_pt, name_zh, name_la,
        categories!inner(name)
      `);

    if (fetchError) {
      console.log('⚠️ Warning: Could not fetch existing ingredients:', fetchError.message);
    }

    const existingIngredientsData = existingIngredients || [];
    console.log(`📊 Found ${existingIngredientsData.length} existing ingredients for duplicate validation`);

    let generatedIngredients: any[] = [];

    if (ingredientsList && ingredientsList.length > 0) {
      // MODO MANUAL MASIVO: Procesamiento optimizado de listas grandes
      console.log('🎯 === MODO MANUAL MASIVO - PROCESAMIENTO OPTIMIZADO ===');
      console.log('📝 Ingredients to process:', ingredientsList.length);
      
      // OPTIMIZACIÓN: Pre-filtrar duplicados para ahorrar tokens
      console.log('💰 === PRE-FILTRADO DE DUPLICADOS PARA AHORRO DE TOKENS ===');
      const nonDuplicateIngredients = [];
      const duplicateIngredients = [];
      
      for (const ingredient of ingredientsList) {
        const trimmedIngredient = ingredient.trim();
        if (!trimmedIngredient) continue;
        
        const isDuplicate = isSpecificDuplicate(trimmedIngredient, existingIngredientsData);
        if (isDuplicate) {
          console.log(`💰 TOKEN SAVED: "${trimmedIngredient}" es duplicado - no se enviará a Perplexity`);
          duplicateIngredients.push({
            name: trimmedIngredient,
            error: 'DUPLICADO_DETECTADO',
            reason: 'Pre-filtrado: Ya existe en la base de datos',
            requested_ingredient: trimmedIngredient,
            generated: false,
            tokens_saved: true
          });
        } else {
          nonDuplicateIngredients.push(trimmedIngredient);
        }
      }
      
      console.log(`💰 AHORRO DE TOKENS: ${duplicateIngredients.length}/${ingredientsList.length} duplicados evitados`);
      console.log(`🚀 INGREDIENTES A PROCESAR: ${nonDuplicateIngredients.length}/${ingredientsList.length}`);
      
      if (nonDuplicateIngredients.length === 0) {
        console.log('⚠️ Todos los ingredientes solicitados ya existen - retornando solo duplicados');
        return duplicateIngredients;
      }
      
      // Limit processing for manual mode to prevent timeouts
      const maxIngredientsManual = Math.min(nonDuplicateIngredients.length, 50);
      const ingredientsToProcess = nonDuplicateIngredients.slice(0, maxIngredientsManual);
      
      console.log(`🔧 Procesando ${ingredientsToProcess.length} ingredientes no duplicados (límite: 50)`);
      
      // PROCESAMIENTO EN LOTES para modo manual masivo
      const batchSize = Math.min(ingredientsToProcess.length, 10); // Procesar hasta 10 a la vez
      const batches = [];
      for (let i = 0; i < ingredientsToProcess.length; i += batchSize) {
        batches.push(ingredientsToProcess.slice(i, i + batchSize));
      }
      
      console.log(`📦 Dividido en ${batches.length} lotes de máximo ${batchSize} ingredientes`);
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`\n🔄 PROCESANDO LOTE ${batchIndex + 1}/${batches.length} - ${batch.length} ingredientes`);
        
        try {
          const params: GenerateContentParams = {
            type: 'ingredient',
            count: batch.length,
            category,
            region: 'España',
            ingredientsList: batch
          };

          console.log(`📋 Generating prompt for batch: ${batch.join(', ')}`);
          const prompt = generatePrompt(params, existingIngredientsData);
          
          console.log(`📡 Sending batch request to Perplexity for: ${batch.length} ingredients`);
          
          const response = await perplexity.generateContent(prompt);
          console.log(`📦 Perplexity response for batch ${batchIndex + 1}:`, {
            success: !!response,
            length: response?.length || 0,
            hasData: response && response.length > 0
          });
          
          if (response && response.length > 0) {
            generatedIngredients.push(...response);
            console.log(`✅ Successfully generated ${response.length} ingredients from batch ${batchIndex + 1}`);
          }
          
          // Delay between batches to respect rate limits
          if (batchIndex < batches.length - 1) {
            const delay = 3000; // 3 segundos entre lotes
            console.log(`⏸️ Waiting ${delay/1000} seconds before next batch...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
        } catch (error) {
          console.error(`❌ Error processing batch ${batchIndex + 1}:`, error);
          // Continue with next batch even if one fails
        }
      }
      
      // Combinar resultados generados con duplicados detectados
      const allResults = [...generatedIngredients, ...duplicateIngredients];
      const successfulIngredients = allResults.filter(ing => ing.generated !== false);
      
      console.log(`🎯 Manual masivo completado:`);
      console.log(`  ✅ Generados exitosamente: ${successfulIngredients.length}`);
      console.log(`  💰 Duplicados evitados (tokens ahorrados): ${duplicateIngredients.length}`);
      console.log(`  📊 Total procesado: ${allResults.length}/${ingredientsList.length}`);
      
      return successfulIngredients;
      
    } else {
      // MODO AUTOMÁTICO MASIVO: Optimizado para generar muchos ingredientes
      console.log('🤖 === MODO AUTOMÁTICO MASIVO: PERPLEXITY DECIDE MÚLTIPLES INGREDIENTES ===');
      console.log(`🎯 Solicitando ${count} ingredientes automáticos`);
      
      // OPTIMIZACIÓN: Pre-analizar categoría para evitar duplicados comunes
      const existingInCategory = category ? getExistingIngredientsByCategory(existingIngredientsData, category) : [];
      if (existingInCategory.length > 0) {
        console.log(`💡 OPTIMIZACIÓN: ${existingInCategory.length} ingredientes ya existen en categoría "${category}"`);
      }
      
      const params: GenerateContentParams = {
        type: 'ingredient',
        count,
        category,
        region: 'España'
      };

      const prompt = generatePrompt(params, existingIngredientsData);
      
      console.log(`📡 Sending massive request to Perplexity for ${count} random ingredients`);
      const response = await perplexity.generateContent(prompt);
      
      if (response && response.length > 0) {
        generatedIngredients = response;
        console.log(`✅ Successfully generated ${response.length} random ingredients in massive mode`);
      } else {
        console.log('⚠️ No ingredients generated in massive automatic mode');
      }
    }

    console.log(`🎉 === GENERACIÓN MASIVA COMPLETADA ===`);
    console.log(`📊 Total ingredients generated: ${generatedIngredients.length}`);
    console.log(`🔧 Mode: ${ingredientsList && ingredientsList.length > 0 ? 'Manual Masivo (Lista Específica)' : 'Automático Masivo (Perplexity Decide)'}`);
    console.log(`💰 Optimización de tokens: ${ingredientsList ? 'Pre-filtrado de duplicados activado' : 'Detección inteligente en prompt'}`);
    
    // Log generated ingredient names for verification
    if (generatedIngredients.length > 0) {
      console.log(`📝 Generated ingredient names (primeros 10):`);
      generatedIngredients.slice(0, 10).forEach((ing, idx) => {
        console.log(`  ${idx + 1}. ${ing.name || 'No name'} (requested: ${ing.requested_ingredient || 'N/A'})`);
      });
      if (generatedIngredients.length > 10) {
        console.log(`  ... y ${generatedIngredients.length - 10} más`);
      }
    }
    
    return generatedIngredients;

  } catch (error) {
    console.error('❌ Critical error in massive generateIngredientData:', error);
    console.error('📊 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });
    throw new Error(`Error generating massive ingredient data: ${error.message}`);
  }
}
