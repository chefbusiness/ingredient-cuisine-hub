
import { generatePrompt } from './prompts.ts';
import { PerplexityClient } from './perplexity-client.ts';
import { GenerateContentParams } from './types.ts';

export async function processAutomaticMode(
  count: number,
  category: string | undefined,
  existingIngredientsData: any[]
): Promise<any[]> {
  console.log('🤖 === AUTOMATIC MODE: SONAR PRO DECIDES INGREDIENTS ===');
  
  const perplexity = new PerplexityClient();
  
  const params: GenerateContentParams = {
    type: 'ingredient',
    count,
    category,
    region: 'España'
  };

  const prompt = generatePrompt(params, existingIngredientsData);
  
  console.log(`📡 Sending Sonar Pro request for ${count} random ingredients`);
  const response = await perplexity.generateContent(prompt);
  
  if (response && response.length > 0) {
    const generatedIngredients = response.map(ing => ({
      ...ing,
      generated_with: 'sonar-pro'
    }));
    console.log(`✅ Successfully generated ${response.length} random ingredients with Sonar Pro`);
    return generatedIngredients;
  } else {
    console.log('⚠️ No ingredients generated in automatic Sonar Pro mode');
    return [];
  }
}
