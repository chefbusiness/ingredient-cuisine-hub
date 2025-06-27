
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { guessCategory, validateHorecaPrice } from './price-validator.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function getProblematicIngredients() {
  console.log('🔍 Identificando ingredientes con precios problemáticos...');
  
  const { data: ingredientsWithPrices, error } = await supabase
    .from('ingredient_prices')
    .select(`
      ingredient_id,
      price,
      unit,
      ingredients!inner(id, name, name_en)
    `);

  if (error) throw new Error(`Error obteniendo precios existentes: ${error.message}`);

  const problematicIngredients = new Set();
  let totalPricesChecked = 0;
  let problematicPricesFound = 0;

  for (const priceRecord of ingredientsWithPrices) {
    totalPricesChecked++;
    const ingredient = priceRecord.ingredients;
    const category = guessCategory(ingredient.name);
    const isValidPrice = validateHorecaPrice(priceRecord.price, category, ingredient.name);
    
    if (!isValidPrice) {
      problematicIngredients.add(ingredient.id);
      problematicPricesFound++;
      console.log(`🚨 Precio problemático detectado: ${ingredient.name} - €${priceRecord.price} (categoría: ${category})`);
    }
  }

  const { data: uniqueProblematic, error: uniqueError } = await supabase
    .from('ingredients')
    .select('id, name, name_en')
    .in('id', Array.from(problematicIngredients));

  if (uniqueError) throw new Error(`Error obteniendo ingredientes problemáticos: ${uniqueError.message}`);

  console.log(`📊 Análisis completado:`);
  console.log(`   Total precios revisados: ${totalPricesChecked}`);
  console.log(`   Precios problemáticos: ${problematicPricesFound}`);
  console.log(`   Ingredientes a actualizar: ${uniqueProblematic.length}`);

  return uniqueProblematic;
}

export async function getAllIngredients() {
  const { data: allIngredients, error } = await supabase
    .from('ingredients')
    .select('id, name, name_en')
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Error obteniendo ingredientes: ${error.message}`);
  return allIngredients;
}

export async function getSpecificIngredients(ingredientIds: string[]) {
  const { data: specificIngredients, error } = await supabase
    .from('ingredients')
    .select('id, name, name_en')
    .in('id', ingredientIds);

  if (error) throw new Error(`Error obteniendo ingredientes específicos: ${error.message}`);
  return specificIngredients;
}
