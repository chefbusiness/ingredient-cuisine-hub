
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

// ALGORITMO ULTRA-PERMISIVO PARA MODO MANUAL: Solo normalización básica
const basicNormalization = (text: string): string => {
  if (!text) return '';
  return text.toLowerCase().trim();
};

// ALGORITMO ESTÁNDAR para modo automático: Normalización más estricta
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

// FUNCIÓN PRINCIPAL: Modo manual ultra-permisivo vs automático estricto
export const isDuplicate = (newIngredient: any, existingIngredients: any[], isManualMode: boolean = false): boolean => {
  console.log(`🔍 === VERIFICACIÓN DE DUPLICADO ${isManualMode ? 'MODO MANUAL ULTRA-PERMISIVO' : 'MODO AUTOMÁTICO ESTRICTO'} ===`);
  console.log(`📋 Verificando: "${newIngredient.name}"`);
  console.log(`📊 Contra ${existingIngredients.length} ingredientes existentes`);
  
  if (isManualMode) {
    console.log(`🎯 MODO MANUAL ULTRA-PERMISIVO: Solo rechazar nombres 100% idénticos`);
    
    // ULTRA-PERMISIVO: Solo normalización básica (minúsculas + trim)
    const newNameBasic = basicNormalization(newIngredient.name);
    console.log(`🔤 Nombre normalizado básico: "${newNameBasic}"`);
    
    const isDupe = existingIngredients.some(existing => {
      const existingNameBasic = basicNormalization(existing.name);
      
      // SOLO comparación 100% idéntica después de normalización básica
      const isIdentical = existingNameBasic === newNameBasic;
      
      if (isIdentical) {
        console.log(`🚫 DUPLICADO 100% IDÉNTICO ENCONTRADO:`);
        console.log(`   📝 Solicitado: "${newIngredient.name}" → "${newNameBasic}"`);
        console.log(`   📝 Existente: "${existing.name}" → "${existingNameBasic}"`);
        console.log(`   ✅ Son idénticos: SÍ`);
        return true;
      } else {
        console.log(`✅ NO idéntico: "${newNameBasic}" ≠ "${existingNameBasic}"`);
        return false;
      }
    });
    
    console.log(`🎯 Resultado MODO MANUAL ULTRA-PERMISIVO: ${isDupe ? '🚫 ES DUPLICADO IDÉNTICO' : '✅ PERMITIR CREACIÓN'}`);
    return isDupe;
    
  } else {
    // Modo automático: verificación estricta como antes
    console.log(`🤖 MODO AUTOMÁTICO ESTRICTO: Verificación multi-idioma con normalización avanzada`);
    
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
    
    console.log(`✅ Resultado MODO AUTOMÁTICO ESTRICTO: ${isDupe ? '🚫 ES DUPLICADO' : '✅ NO ES DUPLICADO'}`);
    return isDupe;
  }
};

// FUNCIÓN ESPECÍFICA PARA MODO MANUAL ULTRA-PERMISIVO: Solo verificar identidad 100%
export const isSpecificDuplicate = (requestedName: string, existingIngredients: any[]): boolean => {
  const normalizedRequested = basicNormalization(requestedName);
  console.log(`🎯 Verificación específica MODO MANUAL ULTRA-PERMISIVO para: "${requestedName}" → normalizado: "${normalizedRequested}"`);
  
  const isDupe = existingIngredients.some(existing => {
    const normalizedExisting = basicNormalization(existing.name);
    
    // SOLO comparación 100% idéntica
    const isIdentical = normalizedExisting === normalizedRequested;
    
    if (isIdentical) {
      console.log(`🚫 DUPLICADO 100% IDÉNTICO ENCONTRADO: "${requestedName}" es idéntico a "${existing.name}"`);
    } else {
      console.log(`✅ NO idéntico: "${normalizedRequested}" ≠ "${normalizedExisting}"`);
    }
    
    return isIdentical;
  });
  
  console.log(`✅ Resultado verificación específica ULTRA-PERMISIVA: ${isDupe ? 'ES DUPLICADO 100% IDÉNTICO' : 'PERMITIR CREACIÓN'}`);
  return isDupe;
};
