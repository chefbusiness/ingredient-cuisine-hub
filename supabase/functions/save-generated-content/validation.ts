
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

// Función mejorada para verificar duplicados con lógica más precisa
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
  
  // Check against all existing ingredients with improved logic
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
    
    // Check for exact matches or very specific matches
    return existingNames.some(existingName => {
      if (!existingName || existingName.length < 3) return false;
      
      return newNames.some(newName => {
        if (!newName || newName.length < 3) return false;
        
        // Exact match
        if (existingName === newName) return true;
        
        // Para ingredientes compuestos, verificar coincidencia de palabras clave
        const existingWords = existingName.split(/[^a-z0-9]/);
        const newWords = newName.split(/[^a-z0-9]/);
        
        // Solo considerar duplicado si hay coincidencia significativa de palabras clave
        if (existingWords.length > 1 && newWords.length > 1) {
          const significantWords = existingWords.filter(w => w.length > 3);
          const newSignificantWords = newWords.filter(w => w.length > 3);
          
          // Duplicado solo si todas las palabras significativas coinciden
          return significantWords.length > 0 && newSignificantWords.length > 0 &&
                 significantWords.every(word => newSignificantWords.includes(word));
        }
        
        return false;
      });
    });
  });
};

// Función específica para validación manual con lógica estricta
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
      
      // Exact match
      if (normalizedExisting === normalizedRequested) return true;
      
      // Para quesos específicos, verificar nombres únicos
      const requestedWords = normalizedRequested.split(/[^a-z0-9]/);
      const existingWords = normalizedExisting.split(/[^a-z0-9]/);
      
      // Verificar si el nombre específico (como "cabrales") ya existe
      const significantRequestedWords = requestedWords.filter(w => w.length > 4);
      const significantExistingWords = existingWords.filter(w => w.length > 4);
      
      // Solo duplicado si coinciden palabras específicas significativas
      return significantRequestedWords.length > 0 && 
             significantExistingWords.length > 0 &&
             significantRequestedWords.some(word => significantExistingWords.includes(word));
    });
  });
};

// Nueva función para validar que el ingrediente generado coincida con el solicitado
export const validateGeneratedIngredient = (requested: string, generated: any): boolean => {
  if (!generated || !generated.name) return false;
  
  const normalizeText = (text: string) => {
    if (!text) return '';
    return text.toLowerCase().trim();
  };
  
  const requestedName = normalizeText(requested);
  const generatedName = normalizeText(generated.name);
  
  // Verificar que el ingrediente generado contenga elementos del solicitado
  const requestedWords = requestedName.split(/\s+/);
  const generatedWords = generatedName.split(/\s+/);
  
  // Al menos una palabra significativa debe coincidir
  return requestedWords.some(reqWord => {
    if (reqWord.length < 4) return false; // Ignorar palabras muy cortas
    return generatedWords.some(genWord => 
      genWord.includes(reqWord) || reqWord.includes(genWord)
    );
  });
};
