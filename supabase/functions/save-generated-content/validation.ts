
// Input validation and sanitization functions
export function sanitizeText(input: any, maxLength: number = 255): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

export function validateIngredientData(ingredient: any): boolean {
  return ingredient.name && 
         ingredient.name_en && 
         ingredient.description && 
         ingredient.category &&
         typeof ingredient.name === 'string' &&
         typeof ingredient.name_en === 'string';
}

// ALGORITMO CORREGIDO: Normalización más precisa para evitar falsos positivos
const normalizeForComparison = (text: string): string => {
  if (!text) return '';
  return text.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normalizar espacios
    .replace(/de\s+/gi, '') // Remover "de" pero conservar estructura
    .replace(/del\s+/gi, '') // Remover "del" pero conservar estructura
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e') 
    .replace(/[íìï]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/ç/g, 'c');
};

// Función mejorada para verificar si un ingrediente es duplicado con detección PRECISA
export const isDuplicate = (newIngredient: any, existingIngredients: any[]): boolean => {
  // Get all variations of the new ingredient name
  const newNames = [
    normalizeForComparison(newIngredient.name),
    normalizeForComparison(newIngredient.name_en),
    normalizeForComparison(newIngredient.name_fr),
    normalizeForComparison(newIngredient.name_it),
    normalizeForComparison(newIngredient.name_pt),
    normalizeForComparison(newIngredient.name_zh),
    normalizeForComparison(newIngredient.name_la)
  ].filter(Boolean);
  
  // Check against all existing ingredients
  return existingIngredients.some(existing => {
    const existingNames = [
      normalizeForComparison(existing.name),
      normalizeForComparison(existing.name_en),
      normalizeForComparison(existing.name_fr),
      normalizeForComparison(existing.name_it),
      normalizeForComparison(existing.name_pt),
      normalizeForComparison(existing.name_zh),
      normalizeForComparison(existing.name_la)
    ].filter(Boolean);
    
    // CORREGIDO: Solo coincidencia EXACTA, no includes que causaba falsos positivos
    return existingNames.some(existingName => {
      if (!existingName || existingName.length < 2) return false;
      
      return newNames.some(newName => {
        if (!newName || newName.length < 2) return false;
        
        // SOLO comparación exacta para evitar "cabrales" vs "manchego"
        return existingName === newName;
      });
    });
  });
};

// CORREGIDA: Función específica para modo manual con verificación exacta
export const isSpecificDuplicate = (requestedName: string, existingIngredients: any[]): boolean => {
  const normalizedRequested = normalizeForComparison(requestedName);
  console.log(`🔍 Verificando duplicado específico para: "${requestedName}" -> normalizado: "${normalizedRequested}"`);
  
  const isDupe = existingIngredients.some(existing => {
    const existingNames = [
      existing.name,
      existing.name_en,
      existing.name_fr,
      existing.name_it,
      existing.name_pt,
      existing.name_la
    ].filter(Boolean);
    
    return existingNames.some(existingName => {
      const normalizedExisting = normalizeForComparison(existingName);
      
      // SOLO comparación exacta - no más includes que causaba problemas
      const isExactMatch = normalizedExisting === normalizedRequested;
      
      if (isExactMatch) {
        console.log(`⚠️ DUPLICADO EXACTO ENCONTRADO: "${requestedName}" coincide con "${existingName}"`);
      }
      
      return isExactMatch;
    });
  });
  
  console.log(`✅ Resultado verificación duplicado: ${isDupe ? 'ES DUPLICADO' : 'NO ES DUPLICADO'}`);
  return isDupe;
};
