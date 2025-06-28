
import { generatePrompt } from './prompts.ts';
import { GenerateContentParams } from './types.ts';
import { processManualMode } from './manual-mode-processor.ts';
import { processAutomaticMode } from './automatic-mode-processor.ts';
import { processResults, logResults } from './results-processor.ts';

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
      // Manual mode processing
      generatedIngredients = await processManualMode(ingredientsList, category, existingIngredientsData);
    } else {
      // Automatic mode processing
      generatedIngredients = await processAutomaticMode(count, category, existingIngredientsData);
    }

    // Process and log results
    const results = processResults(generatedIngredients);
    const mode = ingredientsList && ingredientsList.length > 0 ? 'manual' : 'automatic';
    const totalRequested = ingredientsList?.length || count;
    
    logResults(results, totalRequested, mode);
    
    console.log(`🎉 === SONAR DEEP RESEARCH GENERATION COMPLETED ===`);
    console.log(`📊 Total ingredients generated: ${results.successful.length}`);
    console.log(`🔧 Mode: ${mode === 'manual' ? 'Manual (Specific List with Deep Research)' : 'Automatic (Deep Research Choice)'}`);
    
    // Return only successful ingredients
    return results.successful;

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
