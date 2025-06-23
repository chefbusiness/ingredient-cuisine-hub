
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
  console.log('📋 Input parameters:', { count, category, ingredientsList: ingredientsList?.length || 0 });
  
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
      
      for (let i = 0; i < ingredientsList.length; i++) {
        const specificIngredient = ingredientsList[i].trim();
        
        if (!specificIngredient) {
          console.log(`⚠️ Skipping empty ingredient at index ${i}`);
          continue;
        }
        
        console.log(`🔍 Processing ingredient ${i + 1}/${ingredientsList.length}: "${specificIngredient}"`);
        
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
          }
          
          // Small delay to respect API limits and avoid overwhelming Perplexity
          if (i < ingredientsList.length - 1) {
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
          // Continue with next ingredient instead of failing completely
        }
      }
      
      console.log(`🎯 Manual mode completed: ${generatedIngredients.length}/${ingredientsList.length} ingredients processed successfully`);
      
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
