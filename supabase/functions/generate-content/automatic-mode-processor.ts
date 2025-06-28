
import { generatePrompt } from './prompts.ts';
import { PerplexityClient } from './perplexity-client.ts';
import { GenerateContentParams } from './types.ts';

export async function processAutomaticMode(
  count: number,
  category: string | undefined,
  existingIngredientsData: any[]
): Promise<any[]> {
  console.log('🤖 === AUTOMATIC MODE: SONAR DEEP RESEARCH DECIDES INGREDIENTS ===');
  
  const perplexity = new PerplexityClient();
  
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
    const generatedIngredients = response.map(ing => ({
      ...ing,
      generated_with: 'sonar-deep-research'
    }));
    console.log(`✅ Successfully generated ${response.length} random ingredients with Deep Research`);
    return generatedIngredients;
  } else {
    console.log('⚠️ No ingredients generated in automatic Deep Research mode');
    return [];
  }
}
