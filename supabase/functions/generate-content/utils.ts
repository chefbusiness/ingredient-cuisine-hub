
import { generatePrompt } from './prompts.ts';
import { PerplexityClient } from './perplexity-client.ts';
import { GenerateContentParams } from './types.ts';

export async function generateIngredientData(
  count: number, 
  category?: string, 
  additionalPrompt?: string,
  ingredientsList?: string[]
): Promise<any[]> {
  console.log('🔄 === STARTING SONAR DEEP RESEARCH INGREDIENT GENERATION ===');
  console.log('📋 Input parameters:', { 
    count, 
    category, 
    ingredientsList: ingredientsList?.length || 0,
    hasIngredientsList: !!ingredientsList && ingredientsList.length > 0
  });
  
  const perplexity = new PerplexityClient();
  
  try {
    // Fetch existing ingredients to avoid duplicates with improved detection
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
      // MODO MANUAL MEJORADO: Procesamiento individual con Sonar Deep Research
      console.log('🎯 === MODO MANUAL CON SONAR DEEP RESEARCH - PROCESAMIENTO INDIVIDUAL ===');
      console.log('📝 Ingredients to process:', ingredientsList);
      console.log('📊 Total ingredients to process:', ingredientsList.length);
      
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
      
      for (let i = 0; i < validIngredients.length; i++) {
        const specificIngredient = validIngredients[i].trim();
        
        console.log(`\n🔍 === PROCESSING WITH SONAR DEEP RESEARCH ${i + 1}/${validIngredients.length} ===`);
        console.log(`📝 Current ingredient: "${specificIngredient}"`);
        console.log(`📊 Progress: ${Math.round((i / validIngredients.length) * 100)}%`);
        
        // Pre-check mejorado para duplicados exactos ANTES de la llamada API
        const isExactDuplicate = existingIngredientsData.some(existing => {
          const allExistingNames = [
            existing.name?.toLowerCase().trim(),
            existing.name_en?.toLowerCase().trim(),
            existing.name_fr?.toLowerCase().trim(),
            existing.name_it?.toLowerCase().trim(),
            existing.name_pt?.toLowerCase().trim(),
            existing.name_la?.toLowerCase().trim()
          ].filter(Boolean);
          
          const searchName = specificIngredient.toLowerCase().trim();
          
          // Solo coincidencia EXACTA o muy específica (no contención general)
          return allExistingNames.some(existingName => {
            // Coincidencia exacta
            if (existingName === searchName) return true;
            
            // Para nombres compuestos, verificar coincidencia específica
            const existingWords = existingName.split(/\s+/);
            const searchWords = searchName.split(/\s+/);
            
            // Solo si ambos son nombres compuestos y coinciden exactamente
            if (existingWords.length > 1 && searchWords.length > 1) {
              return existingWords.every(word => searchWords.includes(word)) ||
                     searchWords.every(word => existingWords.includes(word));
            }
            
            return false;
          });
        });
        
        if (isExactDuplicate) {
          console.log(`⚠️ EXACT DUPLICATE DETECTED BEFORE API CALL: "${specificIngredient}" - Skipping to save tokens`);
          generatedIngredients.push({
            name: specificIngredient,
            error: 'DUPLICADO_DETECTADO',
            reason: 'Ya existe exactamente en la base de datos',
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
      
      // Filter and report results
      const successfulIngredients = generatedIngredients.filter(ing => ing.generated !== false);
      const duplicateIngredients = generatedIngredients.filter(ing => ing.error === 'DUPLICADO_DETECTADO');
      const failedIngredients = generatedIngredients.filter(ing => ing.generated === false && ing.error !== 'DUPLICADO_DETECTADO');
      
      console.log(`🎯 Sonar Deep Research manual mode completed:`);
      console.log(`  ✅ Successful: ${successfulIngredients.length}/${validIngredients.length}`);
      console.log(`  ⚠️ Duplicates (tokens saved): ${duplicateIngredients.length}/${validIngredients.length}`);
      console.log(`  ❌ Failed: ${failedIngredients.length}/${validIngredients.length}`);
      
      // Return only successful ingredients
      generatedIngredients = successfulIngredients;
      
    } else {
      // AUTOMATIC MODE: Let Sonar Deep Research decide ingredients
      console.log('🤖 === AUTOMATIC MODE: SONAR DEEP RESEARCH DECIDES INGREDIENTS ===');
      
      const params: GenerateContentParams = {
        type: 'ingredient',
        count,
        category,
        region: 'España'
      };

      const prompt = generatePrompt(params, existingIngredientsData);
      
      console.log(`📡 Sending Deep Research request for ${count} random ingredients`);
      const response = await perplexity.generateContent(prompt);
      
      if (response && response.length > 0) {
        generatedIngredients = response.map(ing => ({
          ...ing,
          generated_with: 'sonar-deep-research'
        }));
        console.log(`✅ Successfully generated ${response.length} random ingredients with Deep Research`);
      } else {
        console.log('⚠️ No ingredients generated in automatic Deep Research mode');
      }
    }

    console.log(`🎉 === SONAR DEEP RESEARCH GENERATION COMPLETED ===`);
    console.log(`📊 Total ingredients generated: ${generatedIngredients.length}`);
    console.log(`🔧 Mode: ${ingredientsList && ingredientsList.length > 0 ? 'Manual (Specific List with Deep Research)' : 'Automatic (Deep Research Choice)'}`);
    
    // Log generated ingredient names for verification
    if (generatedIngredients.length > 0) {
      console.log(`📝 Generated ingredient names with Deep Research:`);
      generatedIngredients.forEach((ing, idx) => {
        console.log(`  ${idx + 1}. ${ing.name || 'No name'} (requested: ${ing.requested_ingredient || 'N/A'})`);
      });
    }
    
    return generatedIngredients;

  } catch (error) {
    console.error('❌ Critical error in Sonar Deep Research generateIngredientData:', error);
    console.error('📊 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });
    throw new Error(`Error generating ingredient data with Sonar Deep Research: ${error.message}`);
  }
}
