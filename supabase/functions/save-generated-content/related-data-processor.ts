
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { sanitizeText } from './validation.ts';
import type { IngredientData } from './types.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function processNutritionalInfo(ingredientId: string, nutritionalInfo: IngredientData['nutritional_info']): Promise<void> {
  if (!nutritionalInfo) return;

  console.log('🥗 Procesando información nutricional para:', ingredientId);
  
  await supabase
    .from('nutritional_info')
    .insert({
      ingredient_id: ingredientId,
      calories: Math.max(0, parseInt(nutritionalInfo.calories?.toString() || '0') || 0),
      protein: Math.max(0, parseFloat(nutritionalInfo.protein?.toString() || '0') || 0),
      carbs: Math.max(0, parseFloat(nutritionalInfo.carbs?.toString() || '0') || 0),
      fat: Math.max(0, parseFloat(nutritionalInfo.fat?.toString() || '0') || 0),
      fiber: Math.max(0, parseFloat(nutritionalInfo.fiber?.toString() || '0') || 0),
      vitamin_c: Math.max(0, parseFloat(nutritionalInfo.vitamin_c?.toString() || '0') || 0)
    });
}

export async function processUses(ingredientId: string, uses: string[]): Promise<void> {
  if (!uses || !Array.isArray(uses)) return;

  console.log('🔧 Procesando usos para:', ingredientId, '- Total:', uses.length);
  
  for (const use of uses.slice(0, 10)) {
    await supabase
      .from('ingredient_uses')
      .insert({
        ingredient_id: ingredientId,
        use_description: sanitizeText(use, 500)
      });
  }
}

export async function processRecipes(ingredientId: string, recipes: IngredientData['recipes']): Promise<void> {
  if (!recipes || !Array.isArray(recipes)) return;

  console.log('🍳 Procesando recetas para:', ingredientId, '- Total:', recipes.length);
  
  for (const recipe of recipes.slice(0, 5)) {
    await supabase
      .from('ingredient_recipes')
      .insert({
        ingredient_id: ingredientId,
        name: sanitizeText(recipe.name, 200),
        type: sanitizeText(recipe.type, 50),
        difficulty: sanitizeText(recipe.difficulty, 20),
        time: sanitizeText(recipe.time, 50)
      });
  }
}

export async function processVarieties(ingredientId: string, varieties: string[]): Promise<void> {
  if (!varieties || !Array.isArray(varieties)) return;

  console.log('🌿 Procesando variedades para:', ingredientId, '- Total:', varieties.length);
  
  for (const variety of varieties.slice(0, 10)) {
    await supabase
      .from('ingredient_varieties')
      .insert({
        ingredient_id: ingredientId,
        variety_name: sanitizeText(variety, 100)
      });
  }
}
