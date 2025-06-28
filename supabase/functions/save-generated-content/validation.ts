
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

// Función mejorada para verificar si un ingrediente es duplicado con detección avanzada
export const isDuplicate = (newIngredient: any, existingIngredients: any[]): boolean => {
  const normalizeText = (text: string) => {
    if (!text) return '';
    return text.toLowerCase()
      .trim()
      .replace(/[\s\-_]/g, '') // Remove spaces, hyphens, underscores
      .replace(/[áàä]/g, 'a')
      .replace(/[éèë]/g, 'e') 
      .replace(/[íìï]/g, 'i')
      .replace(/[óòö]/g, 'o')
      .replace(/[úùü]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/ç/g, 'c');
  };
  
  // Get all variations of the new ingredient name
  const newNames = [
    normalizeText(newIngredient.name),
    normalizeText(newIngredient.name_en),
    normalizeText(newIngredient.name_fr),
    normalizeText(newIngredient.name_it),
    normalizeText(newIngredient.name_pt),
    normalizeText(newIngredient.name_zh),
    normalizeText(newIngredient.name_la)
  ].filter(Boolean);
  
  // Check against all existing ingredients
  return existingIngredients.some(existing => {
    const existingNames = [
      normalizeText(existing.name),
      normalizeText(existing.name_en),
      normalizeText(existing.name_fr),
      normalizeText(existing.name_it),
      normalizeText(existing.name_pt),
      normalizeText(existing.name_zh),
      normalizeText(existing.name_la)
    ].filter(Boolean);
    
    // Check for exact matches or partial matches for compound names
    return existingNames.some(existingName => {
      if (!existingName || existingName.length < 3) return false;
      
      return newNames.some(newName => {
        if (!newName || newName.length < 3) return false;
        
        // Exact match
        if (existingName === newName) return true;
        
        // Partial match for compound names (only if both are > 5 chars)
        if (existingName.length > 5 && newName.length > 5) {
          return existingName.includes(newName) || newName.includes(existingName);
        }
        
        return false;
      });
    });
  });
};

// Nueva función para verificar duplicados específicos en modo manual
export const isSpecificDuplicate = (requestedName: string, existingIngredients: any[]): boolean => {
  const normalizeText = (text: string) => {
    if (!text) return '';
    return text.toLowerCase()
      .trim()
      .replace(/[\s\-_]/g, '')
      .replace(/de\s+/g, '') // Remove "de" preposition
      .replace(/del\s+/g, '') // Remove "del" preposition
      .replace(/[áàä]/g, 'a')
      .replace(/[éèë]/g, 'e') 
      .replace(/[íìï]/g, 'i')
      .replace(/[óòö]/g, 'o')
      .replace(/[úùü]/g, 'u')
      .replace(/ñ/g, 'n');
  };
  
  const normalizedRequested = normalizeText(requestedName);
  
  return existingIngredients.some(existing => {
    const existingNames = [
      existing.name,
      existing.name_en,
      existing.name_fr,
      existing.name_it,
      existing.name_pt,
      existing.name_la
    ].filter(Boolean);
    
    return existingNames.some(existingName => {
      const normalizedExisting = normalizeText(existingName);
      
      // Exact match or very close match
      if (normalizedExisting === normalizedRequested) return true;
      
      // Check if one contains the other (for variations like "Queso Cabrales" vs "Cabrales")
      if (normalizedExisting.length > 4 && normalizedRequested.length > 4) {
        return normalizedExisting.includes(normalizedRequested) || 
               normalizedRequested.includes(normalizedExisting);
      }
      
      return false;
    });
  });
};
