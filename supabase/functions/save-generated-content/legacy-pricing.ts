
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function processLegacyPricing(ingredientId: string, priceEstimate: string): Promise<void> {
  if (!priceEstimate || isNaN(parseFloat(priceEstimate))) return;

  console.log('📊 Usando método de precio anterior (solo España)');
  
  const { data: country } = await supabase
    .from('countries')
    .select('id')
    .eq('code', 'ES')
    .single();

  if (country) {
    await supabase
      .from('ingredient_prices')
      .insert({
        ingredient_id: ingredientId,
        country_id: country.id,
        price: Math.max(0, parseFloat(priceEstimate)),
        unit: 'kg'
      });
  }
}
