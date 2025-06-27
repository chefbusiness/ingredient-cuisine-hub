
export function guessCategory(ingredientName: string): string {
  const name = ingredientName.toLowerCase();
  
  if (name.includes('pimienta') && name.includes('negra')) {
    return 'especias_premium';
  }
  
  if (name.includes('azafrán') || name.includes('saffron')) {
    return 'especias_premium';
  }
  
  if (name.includes('fruta') && name.includes('pasión')) {
    return 'frutas_tropicales';
  }
  
  if (name.includes('mango') || name.includes('aguacate') || name.includes('papaya') ||
      name.includes('guayaba') || name.includes('maracuyá')) {
    return 'frutas_tropicales';
  }
  
  if (name.includes('pimienta') || name.includes('canela') || name.includes('clavo') ||
      name.includes('nuez moscada') || name.includes('comino')) {
    return 'especias_comunes';
  }
  
  if (name.includes('albahaca') || name.includes('cilantro') || name.includes('perejil') ||
      name.includes('menta') || name.includes('romero')) {
    return 'hierbas_frescas';
  }
  
  if (name.includes('carne') || name.includes('pollo') || name.includes('cerdo') ||
      name.includes('ternera') || name.includes('cordero') || name.includes('jamón') ||
      name.includes('chorizo') || name.includes('morcilla') || name.includes('bacón')) {
    return 'carnes';
  }
  
  if (name.includes('aceite')) {
    return 'aceites';
  }
  
  return 'general';
}

export function validateHorecaPrice(price: number, category: string, ingredientName: string): boolean {
  const priceRanges = {
    frutas_tropicales: { min: 8, max: 25 },
    especias_premium: { min: 15, max: 100 },
    especias_comunes: { min: 8, max: 30 },
    hierbas_frescas: { min: 15, max: 50 },
    carnes: { min: 3, max: 60 },
    aceites: { min: 2, max: 50 },
    general: { min: 0.5, max: 30 }
  };
  
  const nameLower = ingredientName.toLowerCase();
  
  if (nameLower.includes('azafrán')) {
    return price >= 3000 && price <= 8000;
  }

  if (nameLower.includes('pimienta') && nameLower.includes('negra')) {
    return price >= 15 && price <= 25;
  }

  if (nameLower.includes('fruta') && nameLower.includes('pasión')) {
    return price >= 12 && price <= 20;
  }

  const range = priceRanges[category as keyof typeof priceRanges] || priceRanges.general;
  return price >= range.min && price <= range.max;
}
