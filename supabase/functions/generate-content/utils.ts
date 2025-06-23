
import { generatePrompt } from './prompts.ts';
import { PerplexityClient } from './perplexity-client.ts';
import { GenerateContentParams } from './types.ts';

export async function generateIngredientData(
  count: number, 
  category?: string, 
  additionalPrompt?: string,
  ingredientsList?: string[]
): Promise<any[]> {
  console.log('🔄 === STARTING INGREDIENT DATA GENERATION ===');
  console.log('📋 Input parameters:', { 
    count, 
    category, 
    ingredientsList: ingredientsList?.length || 0,
    hasIngredientsList: !!ingredientsList && ingredientsList.length > 0
  });
  
  const perplexity = new PerplexityClient();
  
  try {
    // Fetch existing ingredients to avoid duplicates
    console.log('📋 Fetching existing ingredients to avoid duplicates...');
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
    console.log(`📊 Found ${existingIngredientsData.length} existing ingredients in database`);

    let generatedIngredients: any[] = [];

    if (ingredientsList && ingredientsList.length > 0) {
      // MANUAL MODE: Generate specific ingredients from the list
      console.log('🎯 === MANUAL MODE: PROCESSING SPECIFIC INGREDIENTS ===');
      console.log('📝 Ingredients to process:', ingredientsList);
      console.log('📊 Total ingredients to process:', ingredientsList.length);
      
      // Validate ingredients list
      const validIngredients = ingredientsList.filter(ing => ing && ing.trim().length > 0);
      console.log('✅ Valid ingredients after filtering:', validIngredients.length);
      
      if (validIngredients.length === 0) {
        console.log('❌ No valid ingredients found in the list');
        throw new Error('No se encontraron ingredientes válidos en la lista proporcionada');
      }
      
      for (let i = 0; i < validIngredients.length; i++) {
        const specificIngredient = validIngredients[i].trim();
        
        console.log(`\n🔍 === PROCESSING INGREDIENT ${i + 1}/${validIngredients.length} ===`);
        console.log(`📝 Current ingredient: "${specificIngredient}"`);
        console.log(`📊 Progress: ${Math.round((i / validIngredients.length) * 100)}%`);
        
        try {
          const params: GenerateContentParams = {
            type: 'ingredient',
            count: 1,
            category,
            region: 'España',
            ingredient: specificIngredient
          };

          console.log(`📋 Generating prompt for: ${specificIngredient}`);
          const prompt = generatePrompt(params, existingIngredientsData);
          
          console.log(`📡 Sending request to Perplexity for: ${specificIngredient}`);
          console.log(`🎯 Prompt length: ${prompt.length} characters`);
          
          const response = await perplexity.generateContent(prompt);
          console.log(`📦 Perplexity response for ${specificIngredient}:`, {
            success: !!response,
            length: response?.length || 0,
            hasData: response && response.length > 0
          });
          
          if (response && response.length > 0) {
            // Ensure the generated ingredient matches the requested one
            const generatedIngredient = response[0];
            generatedIngredient.requested_ingredient = specificIngredient;
            generatedIngredients.push(generatedIngredient);
            console.log(`✅ Successfully generated data for: ${specificIngredient}`);
            console.log(`📊 Generated ingredient name: ${generatedIngredient.name || 'No name'}`);
          } else {
            console.log(`⚠️ No data generated for: ${specificIngredient}`);
            console.log(`📊 Empty response or invalid format from Perplexity`);
            
            // Add a placeholder for failed ingredients so we can track them
            generatedIngredients.push({
              name: specificIngredient,
              error: 'No se pudo generar información para este ingrediente',
              requested_ingredient: specificIngredient,
              generated: false
            });
          }
          
          // Small delay to respect API limits and avoid overwhelming Perplexity
          if (i < validIngredients.length - 1) {
            console.log(`⏸️ Waiting 2 seconds before next ingredient...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
        } catch (error) {
          console.error(`❌ Error generating data for "${specificIngredient}":`, error);
          console.error(`📊 Error details:`, {
            name: error.name,
            message: error.message,
            stack: error.stack?.substring(0, 200)
          });
          
          // Add error ingredient to track failures
          generatedIngredients.push({
            name: specificIngredient,
            error: `Error: ${error.message}`,
            requested_ingredient: specificIngredient,
            generated: false
          });
        }
      }
      
      // Filter out failed generations for the final result
      const successfulIngredients = generatedIngredients.filter(ing => ing.generated !== false);
      const failedIngredients = generatedIngredients.filter(ing => ing.generated === false);
      
      console.log(`🎯 Manual mode completed:`);
      console.log(`  ✅ Successful: ${successfulIngredients.length}/${validIngredients.length}`);
      console.log(`  ❌ Failed: ${failedIngredients.length}/${validIngredients.length}`);
      
      if (failedIngredients.length > 0) {
        console.log(`⚠️ Failed ingredients:`, failedIngredients.map(ing => ing.name));
      }
      
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
