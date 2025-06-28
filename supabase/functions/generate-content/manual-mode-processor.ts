
import { generatePrompt } from './prompts.ts';
import { PerplexityClient } from './perplexity-client.ts';
import { GenerateContentParams } from './types.ts';
import { checkForDuplicates } from './duplicate-detection.ts';

export async function processManualMode(
  ingredientsList: string[],
  category: string | undefined,
  existingIngredientsData: any[]
): Promise<any[]> {
  console.log('🎯 === MODO MANUAL CON SONAR DEEP RESEARCH - PROCESAMIENTO INDIVIDUAL ===');
  console.log('📝 Ingredients to process:', ingredientsList);
  console.log('📊 Total ingredients to process:', ingredientsList.length);
  
  const perplexity = new PerplexityClient();
  
  // Límite optimizado para Deep Research
  const maxIngredients = Math.min(ingredientsList.length, 5); // Reducido para Deep Research
  console.log('⚡ Processing limit set to:', maxIngredients, 'to allow proper Deep Research');
  
  const validIngredients = ingredientsList
    .filter(ing => ing && ing.trim().length > 0)
    .slice(0, maxIngredients);
  
  console.log('✅ Valid ingredients after filtering and limiting:', validIngredients.length);
  
  if (validIngredients.length === 0) {
    console.log('❌ No valid ingredients found in the list');
    throw new Error('No se encontraron ingredientes válidos en la lista proporcionada');
  }
  
  // Pre-check for duplicates to save API calls
  const duplicateChecks = await checkForDuplicates(validIngredients, existingIngredientsData);
  
  const generatedIngredients: any[] = [];
  
  for (let i = 0; i < validIngredients.length; i++) {
    const specificIngredient = validIngredients[i].trim();
    const duplicateCheck = duplicateChecks.find(check => check.ingredient === specificIngredient);
    
    console.log(`\n🔍 === PROCESSING WITH SONAR DEEP RESEARCH ${i + 1}/${validIngredients.length} ===`);
    console.log(`📝 Current ingredient: "${specificIngredient}"`);
    console.log(`📊 Progress: ${Math.round((i / validIngredients.length) * 100)}%`);
    
    if (duplicateCheck?.isDuplicate) {
      console.log(`⚠️ EXACT DUPLICATE DETECTED BEFORE API CALL: "${specificIngredient}" - Skipping to save tokens`);
      generatedIngredients.push({
        name: specificIngredient,
        error: 'DUPLICADO_DETECTADO',
        reason: duplicateCheck.reason,
        requested_ingredient: specificIngredient,
        generated: false,
        skipped_to_save_tokens: true
      });
      continue;
    }
    
    try {
      const params: GenerateContentParams = {
        type: 'ingredient',
        count: 1,
        category,
        region: 'España',
        ingredient: specificIngredient,
        ingredientsList: [specificIngredient] // Activar modo manual específico
      };

      console.log(`📋 Generating prompt for Sonar Deep Research: ${specificIngredient}`);
      const prompt = generatePrompt(params, existingIngredientsData);
      
      console.log(`📡 Sending Deep Research request to Perplexity for: ${specificIngredient}`);
      console.log(`🎯 Prompt length: ${prompt.length} characters`);
      
      const response = await perplexity.generateContent(prompt);
      console.log(`📦 Sonar Deep Research response for ${specificIngredient}:`, {
        success: !!response,
        length: response?.length || 0,
        hasData: response && response.length > 0
      });
      
      if (response && response.length > 0) {
        const generatedIngredient = response[0];
        
        // Validar que el ingrediente generado coincida con el solicitado
        if (generatedIngredient.error === 'DUPLICADO_DETECTADO') {
          console.log(`⚠️ Sonar Deep Research detected duplicate for: ${specificIngredient}`);
          generatedIngredients.push({
            name: specificIngredient,
            error: 'DUPLICADO_DETECTADO',
            reason: 'Detectado por Sonar Deep Research como duplicado',
            requested_ingredient: specificIngredient,
            generated: false
          });
        } else {
          // Verificar que el nombre generado corresponda al solicitado
          const generatedName = generatedIngredient.name?.toLowerCase().trim();
          const requestedName = specificIngredient.toLowerCase().trim();
          
          if (generatedName && !generatedName.includes(requestedName.split(' ')[0])) {
            console.log(`⚠️ MISMATCH: Generated "${generatedName}" for requested "${requestedName}"`);
            // Corregir el nombre para que coincida con lo solicitado
            generatedIngredient.name = specificIngredient;
          }
          
          generatedIngredient.requested_ingredient = specificIngredient;
          generatedIngredient.manual_mode = true;
          generatedIngredient.generated_with = 'sonar-deep-research';
          generatedIngredients.push(generatedIngredient);
          console.log(`✅ Successfully generated data with Deep Research for: ${specificIngredient}`);
          console.log(`📊 Generated ingredient name: ${generatedIngredient.name || 'No name'}`);
        }
      } else {
        console.log(`⚠️ No data generated by Deep Research for: ${specificIngredient}`);
        generatedIngredients.push({
          name: specificIngredient,
          error: 'No se pudo generar información con Sonar Deep Research para este ingrediente',
          requested_ingredient: specificIngredient,
          generated: false
        });
      }
      
      // Delay optimizado para Deep Research (más tiempo entre requests)
      if (i < validIngredients.length - 1) {
        const delay = 5000; // 5 segundos entre requests para Deep Research
        console.log(`⏸️ Waiting ${delay/1000} seconds before next Deep Research request...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error) {
      console.error(`❌ Error in Sonar Deep Research for "${specificIngredient}":`, error);
      
      generatedIngredients.push({
        name: specificIngredient,
        error: `Deep Research Error: ${error.message}`,
        requested_ingredient: specificIngredient,
        generated: false
      });
    }
  }
  
  return generatedIngredients;
}
