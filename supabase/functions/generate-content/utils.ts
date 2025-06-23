
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
      
      for (let i = 0; i < ingredientsList.length; i++) {
        const specificIngredient = ingredientsList[i];
        console.log(`🔍 Processing ingredient ${i + 1}/${ingredientsList.length}: "${specificIngredient}"`);
        
        try {
          const params: GenerateContentParams = {
            type: 'ingredient',
            count: 1,
            category,
            region: 'España',
            ingredient: specificIngredient
          };

          const prompt = generatePrompt(params, existingIngredientsData);
          
          console.log(`📡 Sending request to Perplexity for: ${specificIngredient}`);
          const response = await perplexity.generateContent(prompt);
          
          if (response && response.length > 0) {
            // Ensure the generated ingredient matches the requested one
            const generatedIngredient = response[0];
            generatedIngredient.requested_ingredient = specificIngredient;
            generatedIngredients.push(generatedIngredient);
            console.log(`✅ Successfully generated data for: ${specificIngredient}`);
          } else {
            console.log(`⚠️ No data generated for: ${specificIngredient}`);
          }
          
          // Small delay to respect API limits
          if (i < ingredientsList.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`❌ Error generating data for "${specificIngredient}":`, error);
          // Continue with next ingredient instead of failing completely
        }
      }
      
      console.log(`🎯 Manual mode completed: ${generatedIngredients.length}/${ingredientsList.length} ingredients processed`);
      
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
    console.log(`🔧 Mode: ${ingredientsList ? 'Manual (Specific List)' : 'Automatic (Perplexity Choice)'}`);
    
    return generatedIngredients;

  } catch (error) {
    console.error('❌ Error in generateIngredientData:', error);
    throw new Error(`Error generating ingredient data: ${error.message}`);
  }
}
