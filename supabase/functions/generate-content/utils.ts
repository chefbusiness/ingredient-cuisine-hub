
import { generatePrompt } from './prompts.ts';
import { PerplexityClient } from './perplexity-client.ts';
import { GenerateContentParams } from './types.ts';

export async function generateIngredientData(
  count: number, 
  category?: string, 
  additionalPrompt?: string,
  ingredientsList?: string[]
): Promise<any[]> {
  console.log('🔄 === STARTING ENHANCED INGREDIENT DATA GENERATION ===');
  console.log('📋 Input parameters:', { 
    count, 
    category, 
    ingredientsList: ingredientsList?.length || 0,
    hasIngredientsList: !!ingredientsList && ingredientsList.length > 0
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
      // MODO MANUAL MEJORADO: Procesamiento individual y verificación estricta
      console.log('🎯 === MODO MANUAL MEJORADO - PROCESAMIENTO INDIVIDUAL ===');
      console.log('📝 Ingredients to process:', ingredientsList);
      
      // Limit to prevent timeouts and ensure proper processing
      const maxIngredients = Math.min(ingredientsList.length, 8);
      console.log('⚡ Processing limit set to:', maxIngredients, 'to prevent timeouts');
      
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
        
        console.log(`\n🔍 === PROCESSING INGREDIENT ${i + 1}/${validIngredients.length} ===`);
        console.log(`📝 Current ingredient: "${specificIngredient}"`);
        
        // CORREGIDO: Pre-check for duplicates con algoritmo mejorado
        const { isSpecificDuplicate } = await import('../save-generated-content/validation.ts');
        const isDuplicate = isSpecificDuplicate(specificIngredient, existingIngredientsData);
        
        if (isDuplicate) {
          console.log(`⚠️ DUPLICATE DETECTED BEFORE API CALL: "${specificIngredient}" - Skipping to save tokens`);
          generatedIngredients.push({
            name: specificIngredient,
            error: 'DUPLICADO_DETECTADO',
            reason: 'Ya existe en la base de datos',
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
            ingredientsList: [specificIngredient] // Pasar como lista para activar modo manual
          };

          console.log(`📋 Generating prompt for: ${specificIngredient}`);
          const prompt = generatePrompt(params, existingIngredientsData);
          
          // AÑADIDO: Log del prompt para debugging
          console.log(`📄 PROMPT ENVIADO A PERPLEXITY (primeros 300 chars):`);
          console.log(prompt.substring(0, 300) + '...');
          
          console.log(`📡 Sending request to Perplexity for: ${specificIngredient}`);
          
          const response = await perplexity.generateContent(prompt);
          console.log(`📦 Perplexity response for ${specificIngredient}:`, {
            success: !!response,
            length: response?.length || 0,
            hasData: response && response.length > 0
          });
          
          if (response && response.length > 0) {
            const generatedIngredient = response[0];
            
            // AÑADIDO: Log del contenido generado
            console.log(`📋 Generated ingredient data:`, {
              name: generatedIngredient.name,
              name_en: generatedIngredient.name_en,
              requested: specificIngredient,
              matches: generatedIngredient.name?.toLowerCase().includes(specificIngredient.toLowerCase())
            });
            
            // Validate that the generated ingredient matches the requested one
            if (generatedIngredient.error === 'DUPLICADO_DETECTADO') {
              console.log(`⚠️ Perplexity detected duplicate for: ${specificIngredient}`);
              generatedIngredients.push({
                name: specificIngredient,
                error: 'DUPLICADO_DETECTADO',
                reason: 'Detectado por Perplexity como duplicado',
                requested_ingredient: specificIngredient,
                generated: false
              });
            } else {
              generatedIngredient.requested_ingredient = specificIngredient;
              generatedIngredient.manual_mode = true;
              generatedIngredients.push(generatedIngredient);
              console.log(`✅ Successfully generated data for: ${specificIngredient}`);
            }
          } else {
            console.log(`⚠️ No data generated for: ${specificIngredient}`);
            generatedIngredients.push({
              name: specificIngredient,
              error: 'No se pudo generar información para este ingrediente',
              requested_ingredient: specificIngredient,
              generated: false
            });
          }
          
          // Optimized delay for better rate limit handling
          if (i < validIngredients.length - 1) {
            const delay = i > 2 ? 3000 : 2000;
            console.log(`⏸️ Waiting ${delay/1000} seconds before next ingredient...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
        } catch (error) {
          console.error(`❌ Error generating data for "${specificIngredient}":`, error);
          
          generatedIngredients.push({
            name: specificIngredient,
            error: `Error: ${error.message}`,
            requested_ingredient: specificIngredient,
            generated: false
          });
        }
      }
      
      // Filter results
      const successfulIngredients = generatedIngredients.filter(ing => ing.generated !== false);
      const duplicateIngredients = generatedIngredients.filter(ing => ing.error === 'DUPLICADO_DETECTADO');
      const failedIngredients = generatedIngredients.filter(ing => ing.generated === false && ing.error !== 'DUPLICADO_DETECTADO');
      
      console.log(`🎯 Manual mode completed:`);
      console.log(`  ✅ Successful: ${successfulIngredients.length}/${validIngredients.length}`);
      console.log(`  ⚠️ Duplicates (tokens saved): ${duplicateIngredients.length}/${validIngredients.length}`);
      console.log(`  ❌ Failed: ${failedIngredients.length}/${validIngredients.length}`);
      
      // Return only successful ingredients
      generatedIngredients = successfulIngredients;
      
    } else {
      // AUTOMATIC MODE: Let Perplexity decide ingredients
      console.log('🤖 === AUTOMATIC MODE: PERPLEXITY DECIDES INGREDIENTS ===');
      
      const params: GenerateContentParams = {
        type: 'ingredient',
        count,
        category,
        region: 'España'
      };

      const prompt = generatePrompt(params, existingIngredientsData);
      
      console.log(`📡 Sending request to Perplexity for ${count} random ingredients`);
      const response = await perplexity.generateContent(prompt);
      
      if (response && response.length > 0) {
        generatedIngredients = response;
        console.log(`✅ Successfully generated ${response.length} random ingredients`);
      } else {
        console.log('⚠️ No ingredients generated in automatic mode');
      }
    }

    console.log(`🎉 === GENERATION COMPLETED ===`);
    console.log(`📊 Total ingredients generated: ${generatedIngredients.length}`);
    console.log(`🔧 Mode: ${ingredientsList && ingredientsList.length > 0 ? 'Manual (Specific List)' : 'Automatic (Perplexity Choice)'}`);
    
    // Log generated ingredient names for verification
    if (generatedIngredients.length > 0) {
      console.log(`📝 Generated ingredient names:`);
      generatedIngredients.forEach((ing, idx) => {
        console.log(`  ${idx + 1}. ${ing.name || 'No name'} (requested: ${ing.requested_ingredient || 'N/A'})`);
      });
    }
    
    return generatedIngredients;

  } catch (error) {
    console.error('❌ Critical error in generateIngredientData:', error);
    console.error('📊 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });
    throw new Error(`Error generating ingredient data: ${error.message}`);
  }
}
