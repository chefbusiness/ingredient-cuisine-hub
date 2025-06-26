
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Función para procesar precios múltiples países
export async function processMultiCountryPrices(ingredientId: string, pricesData: any[]): Promise<void> {
  console.log(`💰 === PROCESANDO PRECIOS MULTI-PAÍS PARA ${ingredientId} ===`);
  
  if (!pricesData || !Array.isArray(pricesData)) {
    console.log('⚠️ No hay datos de precios o formato incorrecto');
    return;
  }

  console.log(`📊 Procesando ${pricesData.length} precios de diferentes países`);

  // Mapeo de códigos de país a IDs en la base de datos
  const countryMapping: { [key: string]: string } = {
    'ES': 'España',
    'US': 'Estados Unidos', 
    'FR': 'Francia',
    'IT': 'Italia',
    'MX': 'México',
    'AR': 'Argentina'
  };

  let processedPrices = 0;
  let failedPrices = 0;

  for (const priceData of pricesData) {
    try {
      const countryCode = priceData.country_code || 'ES';
      const countryName = countryMapping[countryCode] || priceData.country || 'España';
      
      console.log(`🌍 Procesando precio para ${countryName} (${countryCode}): ${priceData.price} ${priceData.currency}/${priceData.unit}`);

      // Buscar el país en la base de datos
      const { data: country, error: countryError } = await supabase
        .from('countries')
        .select('id')
        .eq('name', countryName)
        .single();

      if (countryError || !country) {
        console.log(`⚠️ País ${countryName} no encontrado en BD, saltando precio`);
        failedPrices++;
        continue;
      }

      // Determinar la unidad apropiada basada en el tipo de ingrediente
      let finalUnit = priceData.unit || 'kg';
      
      // Normalizar unidades
      if (finalUnit.toLowerCase().includes('litro') || finalUnit.toLowerCase() === 'l') {
        finalUnit = 'litro';
      } else if (finalUnit.toLowerCase() === 'g' || finalUnit.toLowerCase() === 'gramo') {
        finalUnit = 'g';
      } else {
        finalUnit = 'kg'; // Por defecto
      }

      // Insertar el precio en la base de datos
      const { error: priceError } = await supabase
        .from('ingredient_prices')
        .insert({
          ingredient_id: ingredientId,
          country_id: country.id,
          price: Math.max(0, parseFloat(priceData.price) || 0),
          unit: finalUnit,
          season_variation: priceData.market_type || 'general'
        });

      if (priceError) {
        console.error(`❌ Error insertando precio para ${countryName}:`, priceError);
        failedPrices++;
      } else {
        console.log(`✅ Precio guardado para ${countryName}: ${priceData.price} ${priceData.currency}/${finalUnit}`);
        processedPrices++;
      }

    } catch (error) {
      console.error(`💥 Error procesando precio:`, error);
      failedPrices++;
    }
  }

  console.log(`🏁 Resumen precios: ${processedPrices} exitosos, ${failedPrices} fallidos`);
}
