
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Rangos de precios HORECA por categoría
const HORECA_PRICE_RANGES: { [key: string]: { min: number; max: number } } = {
  'especias': { min: 8, max: 50 },
  'aceites': { min: 2, max: 20 },
  'verduras': { min: 0.8, max: 8 },
  'hierbas': { min: 8, max: 40 },
  'carnes': { min: 8, max: 60 },
  'cereales': { min: 0.5, max: 5 },
  'lácteos': { min: 2, max: 15 },
  'pescados': { min: 10, max: 50 },
  'general': { min: 1, max: 30 }
};

// Precios específicos para ingredientes conocidos
const SPECIFIC_INGREDIENT_RANGES: { [key: string]: { min: number; max: number } } = {
  'pimienta negra': { min: 15, max: 25 },
  'black pepper': { min: 15, max: 25 },
  'azafrán': { min: 3000, max: 8000 },
  'saffron': { min: 3000, max: 8000 },
  'aceite oliva virgen extra': { min: 4, max: 12 },
  'olive oil extra virgin': { min: 4, max: 12 },
  'tomate': { min: 1.5, max: 3.5 },
  'tomato': { min: 1.5, max: 3.5 },
  'romero': { min: 10, max: 20 },
  'rosemary': { min: 10, max: 20 }
};

function validateHorecaPrice(ingredientName: string, price: number, unit: string): { isValid: boolean; suggestedRange: string; reason: string } {
  console.log(`🔍 Validando precio HORECA: ${ingredientName} - €${price}/${unit}`);
  
  const name = ingredientName.toLowerCase();
  
  // Verificar precios específicos primero
  for (const [ingredient, range] of Object.entries(SPECIFIC_INGREDIENT_RANGES)) {
    if (name.includes(ingredient.toLowerCase())) {
      const isValid = price >= range.min && price <= range.max;
      return {
        isValid,
        suggestedRange: `€${range.min}-${range.max}/${unit}`,
        reason: isValid ? 'Precio dentro del rango HORECA específico' : `Precio fuera del rango típico para ${ingredient} en canal HORECA`
      };
    }
  }
  
  // Categorizar por tipo de ingrediente
  let category = 'general';
  if (name.includes('pimienta') || name.includes('pepper') || name.includes('canela') || name.includes('clavo')) {
    category = 'especias';
  } else if (name.includes('aceite') || name.includes('oil') || name.includes('vinagre')) {
    category = 'aceites';
  } else if (name.includes('tomate') || name.includes('cebolla') || name.includes('patata') || name.includes('verdura')) {
    category = 'verduras';
  } else if (name.includes('romero') || name.includes('tomillo') || name.includes('albahaca')) {
    category = 'hierbas';
  } else if (name.includes('carne') || name.includes('pollo') || name.includes('ternera')) {
    category = 'carnes';
  } else if (name.includes('harina') || name.includes('arroz') || name.includes('trigo')) {
    category = 'cereales';
  } else if (name.includes('leche') || name.includes('queso') || name.includes('mantequilla')) {
    category = 'lácteos';
  } else if (name.includes('pescado') || name.includes('salmón') || name.includes('atún')) {
    category = 'pescados';
  }
  
  const range = HORECA_PRICE_RANGES[category];
  const isValid = price >= range.min && price <= range.max;
  
  return {
    isValid,
    suggestedRange: `€${range.min}-${range.max}/${unit}`,
    reason: isValid ? `Precio válido para categoría ${category} HORECA` : `Precio fuera del rango típico HORECA para ${category}`
  };
}

// Función para procesar precios múltiples países con validación HORECA
export async function processMultiCountryPrices(ingredientId: string, pricesData: any[]): Promise<void> {
  console.log(`💰 === PROCESANDO PRECIOS MULTI-PAÍS PARA ${ingredientId} ===`);
  
  if (!pricesData || !Array.isArray(pricesData)) {
    console.log('⚠️ No hay datos de precios o formato incorrecto');
    return;
  }

  console.log(`📊 Procesando ${pricesData.length} precios de diferentes países`);

  // Obtener información del ingrediente para validación
  const { data: ingredient, error: ingredientError } = await supabase
    .from('ingredients')
    .select('name, name_en')
    .eq('id', ingredientId)
    .single();

  if (ingredientError || !ingredient) {
    console.log('⚠️ No se pudo obtener información del ingrediente para validación');
    return;
  }

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
  let suspiciousPrices = 0;

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

      const price = Math.max(0, parseFloat(priceData.price) || 0);

      // VALIDACIÓN CRÍTICA DE PRECIOS HORECA
      const validation = validateHorecaPrice(ingredient.name, price, finalUnit);
      
      if (!validation.isValid) {
        console.log(`🚨 PRECIO SOSPECHOSO para ${ingredient.name} en ${countryName}:`);
        console.log(`   💰 Precio recibido: €${price}/${finalUnit}`);
        console.log(`   📏 Rango esperado: ${validation.suggestedRange}`);
        console.log(`   📝 Razón: ${validation.reason}`);
        suspiciousPrices++;
        
        // Marcar con season_variation especial para revisión
        priceData.season_variation = `REVISAR_PRECIO_${priceData.market_type || 'general'}`;
      }

      // Insertar el precio en la base de datos (incluso si es sospechoso, para revisión posterior)
      const { error: priceError } = await supabase
        .from('ingredient_prices')
        .insert({
          ingredient_id: ingredientId,
          country_id: country.id,
          price: price,
          unit: finalUnit,
          season_variation: priceData.season_variation || 'general'
        });

      if (priceError) {
        console.error(`❌ Error insertando precio para ${countryName}:`, priceError);
        failedPrices++;
      } else {
        const statusIcon = validation.isValid ? '✅' : '⚠️';
        console.log(`${statusIcon} Precio guardado para ${countryName}: €${price}/${finalUnit} ${validation.isValid ? '' : '(REQUIERE REVISIÓN)'}`);
        processedPrices++;
      }

    } catch (error) {
      console.error(`💥 Error procesando precio:`, error);
      failedPrices++;
    }
  }

  console.log(`🏁 === RESUMEN PROCESAMIENTO PRECIOS ===`);
  console.log(`✅ Precios procesados: ${processedPrices}`);
  console.log(`❌ Precios fallidos: ${failedPrices}`);
  console.log(`⚠️ Precios sospechosos: ${suspiciousPrices}`);
  
  if (suspiciousPrices > 0) {
    console.log(`🔍 ACCIÓN REQUERIDA: ${suspiciousPrices} precios marcados para revisión manual`);
    console.log(`📋 Buscar en ingredient_prices donde season_variation LIKE 'REVISAR_PRECIO_%'`);
  }
}

// Nueva función para validar y corregir precios existentes
export async function validateExistingPrices(ingredientId?: string): Promise<void> {
  console.log('🔍 === VALIDANDO PRECIOS EXISTENTES ===');
  
  let query = supabase
    .from('ingredient_prices')
    .select(`
      id,
      price,
      unit,
      ingredients!inner(name, name_en),
      countries!inner(name)
    `);
    
  if (ingredientId) {
    query = query.eq('ingredient_id', ingredientId);
  }
  
  const { data: prices, error } = await query;
  
  if (error) {
    console.error('❌ Error obteniendo precios para validación:', error);
    return;
  }
  
  let validatedCount = 0;
  let suspiciousCount = 0;
  
  for (const priceRecord of prices) {
    const validation = validateHorecaPrice(
      priceRecord.ingredients.name, 
      priceRecord.price, 
      priceRecord.unit
    );
    
    if (!validation.isValid) {
      console.log(`⚠️ Precio sospechoso encontrado:`);
      console.log(`   Ingrediente: ${priceRecord.ingredients.name}`);
      console.log(`   País: ${priceRecord.countries.name}`);
      console.log(`   Precio: €${priceRecord.price}/${priceRecord.unit}`);
      console.log(`   Rango esperado: ${validation.suggestedRange}`);
      
      suspiciousCount++;
      
      // Marcar para revisión
      await supabase
        .from('ingredient_prices')
        .update({ season_variation: 'REVISAR_PRECIO_HORECA' })
        .eq('id', priceRecord.id);
    } else {
      validatedCount++;
    }
  }
  
  console.log(`✅ Precios validados correctamente: ${validatedCount}`);
  console.log(`⚠️ Precios que requieren revisión: ${suspiciousCount}`);
}
