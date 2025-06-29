
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

// ALGORITMO CORREGIDO: Normalización menos agresiva para modo manual
const normalizeForComparison = (text: string): string => {
  if (!text) return '';
  return text.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normalizar espacios múltiples
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e') 
    .replace(/[íìï]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/ç/g, 'c');
};

// FUNCIÓN PRINCIPAL: Modo manual vs automático con diferentes niveles de detección
export const isDuplicate = (newIngredient: any, existingIngredients: any[], isManualMode: boolean = false): boolean => {
  console.log(`🔍 === VERIFICACIÓN DE DUPLICADO ${isManualMode ? 'MODO MANUAL' : 'MODO AUTOMÁTICO'} ===`);
  console.log(`📋 Verificando: "${newIngredient.name}"`);
  console.log(`📊 Contra ${existingIngredients.length} ingredientes existentes`);
  
  if (isManualMode) {
    console.log(`🎯 MODO MANUAL: Verificación menos estricta para ingrediente solicitado específicamente`);
    
    // En modo manual, solo rechazar si hay coincidencia EXACTA en el nombre principal (español)
    const newNameNormalized = normalizeForComparison(newIngredient.name);
    
    const isDupe = existingIngredients.some(existing => {
      const existingNameNormalized = normalizeForComparison(existing.name);
      
      // SOLO comparación exacta del nombre principal en español
      const isExactSpanishMatch = existingNameNormalized === newNameNormalized;
      
      if (isExactSpanishMatch) {
        console.log(`⚠️ DUPLICADO EXACTO EN ESPAÑOL: "${newIngredient.name}" === "${existing.name}"`);
        return true;
      }
      
      return false;
    });
    
    console.log(`✅ Resultado MODO MANUAL: ${isDupe ? '🚫 ES DUPLICADO EXACTO' : '✅ PERMITIR CREACIÓN'}`);
    return isDupe;
    
  } else {
    // Modo automático: verificación más estricta como antes
    console.log(`🤖 MODO AUTOMÁTICO: Verificación estricta multi-idioma`);
    
    const newNames = [
      normalizeForComparison(newIngredient.name),
      normalizeForComparison(newIngredient.name_en),
      normalizeForComparison(newIngredient.name_fr),
      normalizeForComparison(newIngredient.name_it),
      normalizeForComparison(newIngredient.name_pt),
      normalizeForComparison(newIngredient.name_zh),
      normalizeForComparison(newIngredient.name_la)
    ].filter(Boolean);
    
    const isDupe = existingIngredients.some(existing => {
      const existingNames = [
        normalizeForComparison(existing.name),
        normalizeForComparison(existing.name_en),
        normalizeForComparison(existing.name_fr),
        normalizeForComparison(existing.name_it),
        normalizeForComparison(existing.name_pt),
        normalizeForComparison(existing.name_zh),
        normalizeForComparison(existing.name_la)
      ].filter(Boolean);
      
      const hasMatch = existingNames.some(existingName => {
        if (!existingName || existingName.length < 3) return false;
        
        return newNames.some(newName => {
          if (!newName || newName.length < 3) return false;
          
          const isExactMatch = existingName === newName;
          
          if (isExactMatch) {
            console.log(`⚠️ DUPLICADO EXACTO MULTI-IDIOMA: "${newName}" === "${existingName}"`);
            console.log(`🔍 Ingrediente existente: "${existing.name}"`);
          }
          
          return isExactMatch;
        });
      });
      
      return hasMatch;
    });
    
    console.log(`✅ Resultado MODO AUTOMÁTICO: ${isDupe ? '🚫 ES DUPLICADO' : '✅ NO ES DUPLICADO'}`);
    return isDupe;
  }
};

// FUNCIÓN ESPECÍFICA PARA MODO MANUAL: Solo verificar nombre español exacto
export const isSpecificDuplicate = (requestedName: string, existingIngredients: any[]): boolean => {
  const normalizedRequested = normalizeForComparison(requestedName);
  console.log(`🎯 Verificación específica MODO MANUAL para: "${requestedName}" -> normalizado: "${normalizedRequested}"`);
  
  const isDupe = existingIngredients.some(existing => {
    const normalizedExisting = normalizeForComparison(existing.name);
    
    // SOLO comparación exacta del nombre principal español
    const isExactMatch = normalizedExisting === normalizedRequested;
    
    if (isExactMatch) {
      console.log(`⚠️ DUPLICADO EXACTO ESPAÑOL ENCONTRADO: "${requestedName}" coincide exactamente con "${existing.name}"`);
    }
    
    return isExactMatch;
  });
  
  console.log(`✅ Resultado verificación específica: ${isDupe ? 'ES DUPLICADO EXACTO' : 'PERMITIR CREACIÓN'}`);
  return isDupe;
};
