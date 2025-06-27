
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function processMultiCountryPrices(ingredientId: string, pricesData: any[]) {
  const pricesToInsert = [];
  
  console.log(`💰 Procesando precios para ingrediente ${ingredientId}:`, pricesData.length, 'países');
  
  for (const priceData of pricesData) {
    try {
      const { data: country, error: countryError } = await supabase
        .from('countries')
        .select('id')
        .eq('code', priceData.country_code)
        .single();
      
      if (countryError) {
        console.log(`⚠️ País no encontrado para código ${priceData.country_code}:`, countryError);
        continue;
      }
      
      if (country && priceData.price && priceData.price > 0) {
        pricesToInsert.push({
          ingredient_id: ingredientId,
          country_id: country.id,
          price: priceData.price,
          unit: priceData.unit || 'kg'
        });
        console.log(`✅ Precio agregado: ${priceData.country} - €${priceData.price}/${priceData.unit || 'kg'}`);
      }
    } catch (error) {
      console.error(`❌ Error procesando precio para ${priceData.country}:`, error);
    }
  }
  
  if (pricesToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('ingredient_prices')
      .insert(pricesToInsert);
      
    if (insertError) {
      console.error('❌ Error insertando precios:', insertError);
      throw insertError;
    }
    
    console.log(`💾 ${pricesToInsert.length} precios insertados exitosamente`);
  }
}
