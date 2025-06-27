
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function getExistingIngredients(): Promise<any[]> {
  try {
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('name, name_en, categories(name)')
      .limit(1000);

    if (ingredientsError) {
      console.log('⚠️ Warning: Could not fetch existing ingredients:', ingredientsError.message);
      return [];
    }

    const existingIngredients = ingredients || [];
    console.log('📋 Loaded', existingIngredients.length, 'existing ingredients to avoid duplicates');
    return existingIngredients;
  } catch (error) {
    console.log('⚠️ Warning: Error fetching existing ingredients:', error);
    return [];
  }
}
