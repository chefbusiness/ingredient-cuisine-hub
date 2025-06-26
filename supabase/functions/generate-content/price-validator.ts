
export const PRICE_RANGES: { [key: string]: { min: number; max: number } } = {
  // Frutas por subcategorías
  'frutas_tropicales': { min: 8, max: 25 },    // Fruta de la pasión, mango, aguacate
  'frutas_exoticas': { min: 8, max: 25 },      // Pitaya, maracuyá, etc.
  'frutas_comunes': { min: 2, max: 8 },        // Manzanas, naranjas, etc.
  'citricos': { min: 1.5, max: 6 },            // Limones, naranjas
  'frutas_bosque': { min: 8, max: 30 },        // Arándanos, frambuesas
  
  // Verduras por subcategorías
  'verduras_premium': { min: 3, max: 15 },     // Espárragos, alcachofas
  'verduras_comunes': { min: 0.8, max: 5 },    // Tomates, cebollas
  'tuberculos': { min: 0.5, max: 3 },          // Patatas, zanahorias
  'verduras_hoja': { min: 2, max: 8 },         // Lechugas, espinacas
  
  // Hierbas y aromáticas
  'hierbas_frescas': { min: 15, max: 50 },     // Albahaca, cilantro
  'hierbas_secas': { min: 8, max: 40 },        // Orégano, tomillo seco
  
  // Vegetales gourmet
  'flores_comestibles': { min: 80, max: 200 }, // Pensamiento, violetas
  'germinados': { min: 20, max: 40 },          // Alfalfa, rúcula
  'brotes_vivos': { min: 25, max: 60 },        // Microgreens
  'mini_verduras': { min: 8, max: 25 },        // Baby vegetables
  
  // Especias
  'especias_comunes': { min: 8, max: 30 },     // Pimienta, canela
  'especias_premium': { min: 20, max: 100 },   // Vainilla, cardamomo
  
  // Otros
  'aceites': { min: 2, max: 20 },
  'carnes': { min: 8, max: 60 },
  'cereales': { min: 0.5, max: 5 },
  'general': { min: 1, max: 30 }
};

export function guessCategory(ingredientName: string): string {
  const name = ingredientName.toLowerCase();
  
  // Frutas tropicales y exóticas (PRIORIDAD ALTA - precios €8-25/kg)
  if (name.includes('pasión') || name.includes('passion') || name.includes('maracuyá') || 
      name.includes('mango') || name.includes('aguacate') || name.includes('avocado') ||
      name.includes('pitaya') || name.includes('dragón') || name.includes('papaya') ||
      name.includes('guayaba') || name.includes('lichi') || name.includes('rambután')) {
    return 'frutas_tropicales';
  }
  
  // Frutas del bosque (PRIORIDAD ALTA - precios €8-30/kg)
  if (name.includes('arándano') || name.includes('blueberry') || name.includes('frambuesa') ||
      name.includes('raspberry') || name.includes('mora') || name.includes('blackberry') ||
      name.includes('grosella') || name.includes('currant')) {
    return 'frutas_bosque';
  }
  
  // Flores comestibles (PRIORIDAD ALTA - precios €80-200/kg)
  if (name.includes('pensamiento') || name.includes('violeta') || name.includes('viola') ||
      name.includes('capuchina') || name.includes('caléndula') || name.includes('flores comestibles')) {
    return 'flores_comestibles';
  }
  
  // Germinados y brotes (PRIORIDAD ALTA - precios €20-60/kg)
  if (name.includes('germinado') || name.includes('brote') || name.includes('microgreen') ||
      name.includes('alfalfa') || name.includes('rúcula baby') || name.includes('micro')) {
    return 'germinados';
  }
  
  // Hierbas frescas (PRIORIDAD ALTA - precios €15-50/kg)
  if ((name.includes('albahaca') || name.includes('basil') || name.includes('cilantro') ||
       name.includes('perejil') || name.includes('parsley') || name.includes('menta') ||
       name.includes('mint') || name.includes('romero') || name.includes('rosemary')) &&
      (name.includes('fresco') || name.includes('fresh') || !name.includes('seco'))) {
    return 'hierbas_frescas';
  }
  
  // Verduras premium (PRIORIDAD MEDIA - precios €3-15/kg)
  if (name.includes('espárrago') || name.includes('asparagus') || name.includes('alcachofa') ||
      name.includes('artichoke') || name.includes('trufa') || name.includes('truffle')) {
    return 'verduras_premium';
  }
  
  // Especias (casos especiales primero)
  if (name.includes('azafrán') || name.includes('saffron')) {
    return 'especias_premium'; // €20-100/kg (o más para azafrán)
  }
  if (name.includes('pimienta') || name.includes('pepper') || name.includes('canela') || name.includes('clavo')) {
    return 'especias_comunes';
  }
  
  // Aceites
  if (name.includes('aceite') || name.includes('oil') || name.includes('vinagre') || name.includes('vinegar')) {
    return 'aceites';
  }
  
  // Frutas comunes
  if (name.includes('manzana') || name.includes('apple') || name.includes('pera') || name.includes('pear') ||
      name.includes('plátano') || name.includes('banana')) {
    return 'frutas_comunes';
  }
  
  // Cítricos
  if (name.includes('naranja') || name.includes('orange') || name.includes('limón') || name.includes('lemon') ||
      name.includes('lima') || name.includes('lime') || name.includes('pomelo') || name.includes('grapefruit')) {
    return 'citricos';
  }
  
  // Verduras comunes
  if (name.includes('tomate') || name.includes('tomato') || name.includes('cebolla') || name.includes('onion') ||
      name.includes('lechuga') || name.includes('lettuce') || name.includes('pimiento') || name.includes('pepper')) {
    return 'verduras_comunes';
  }
  
  // Tubérculos
  if (name.includes('patata') || name.includes('potato') || name.includes('zanahoria') || name.includes('carrot') ||
      name.includes('remolacha') || name.includes('beet')) {
    return 'tuberculos';
  }
  
  // Hierbas secas
  if (name.includes('tomillo') || name.includes('thyme') || name.includes('orégano') || name.includes('oregano')) {
    return 'hierbas_secas';
  }
  
  // Carnes
  if (name.includes('carne') || name.includes('meat') || name.includes('pollo') || name.includes('beef')) {
    return 'carnes';
  }
  
  // Cereales
  if (name.includes('harina') || name.includes('flour') || name.includes('arroz') || name.includes('rice')) {
    return 'cereales';
  }
  
  return 'general';
}

export function validateHorecaPrice(price: number, category: string, ingredientName: string): boolean {
  // Casos especiales críticos
  const nameLower = ingredientName.toLowerCase();
  
  if (nameLower.includes('azafrán') || nameLower.includes('saffron')) {
    return price >= 3000 && price <= 8000; // Azafrán es extremadamente caro
  }

  if (nameLower.includes('fruta') && nameLower.includes('pasión')) {
    return price >= 12 && price <= 20; // Fruta de la pasión rango Frutas Eloy/Makro
  }

  if (nameLower.includes('pimienta') && nameLower.includes('negra')) {
    return price >= 15 && price <= 25; // Pimienta negra rango específico
  }

  const range = PRICE_RANGES[category] || PRICE_RANGES['general'];
  return price >= range.min && price <= range.max;
}
