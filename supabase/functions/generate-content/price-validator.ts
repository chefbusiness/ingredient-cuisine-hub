
export const PRICE_RANGES: { [key: string]: { min: number; max: number } } = {
  'especias': { min: 8, max: 50 },
  'aceites': { min: 2, max: 20 },
  'verduras': { min: 0.8, max: 8 },
  'hierbas': { min: 8, max: 40 },
  'carnes': { min: 8, max: 60 },
  'cereales': { min: 0.5, max: 5 },
  'general': { min: 1, max: 30 }
};

export function guessCategory(ingredientName: string): string {
  const name = ingredientName.toLowerCase();
  
  if (name.includes('pimienta') || name.includes('pepper') || name.includes('especias') || name.includes('canela') || name.includes('clavo')) {
    return 'especias';
  }
  if (name.includes('aceite') || name.includes('oil') || name.includes('vinagre') || name.includes('vinegar')) {
    return 'aceites';
  }
  if (name.includes('tomate') || name.includes('cebolla') || name.includes('patata') || name.includes('verdura')) {
    return 'verduras';
  }
  if (name.includes('romero') || name.includes('tomillo') || name.includes('albahaca') || name.includes('herbs')) {
    return 'hierbas';
  }
  if (name.includes('carne') || name.includes('meat') || name.includes('pollo') || name.includes('beef')) {
    return 'carnes';
  }
  if (name.includes('harina') || name.includes('flour') || name.includes('arroz') || name.includes('rice')) {
    return 'cereales';
  }
  
  return 'general';
}

export function validateHorecaPrice(price: number, category: string, ingredientName: string): boolean {
  // Casos especiales
  if (ingredientName.toLowerCase().includes('azafrán') || ingredientName.toLowerCase().includes('saffron')) {
    return price >= 3000 && price <= 8000; // Azafrán es extremadamente caro
  }

  if (ingredientName.toLowerCase().includes('pimienta') || ingredientName.toLowerCase().includes('pepper')) {
    return price >= 15 && price <= 25; // Pimienta negra rango específico
  }

  const range = PRICE_RANGES[category] || PRICE_RANGES['general'];
  return price >= range.min && price <= range.max;
}
