
/**
 * Normaliza texto removiendo acentos y convirtiendo a minúsculas
 * para búsquedas insensibles a acentos
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

/**
 * NUEVA IMPLEMENTACIÓN SIMPLIFICADA: Solo variaciones esenciales
 * Crea máximo 4-6 variaciones por término para evitar saturar la query
 */
const createEssentialAccentVariations = (term: string): string[] => {
  const variations = new Set<string>();
  const cleanTerm = term.trim().toLowerCase();
  
  // Agregar el término original
  variations.add(cleanTerm);
  
  // Agregar versión normalizada (sin acentos)
  const normalized = normalizeText(cleanTerm);
  variations.add(normalized);
  
  // Solo para términos cortos, crear variaciones comunes en español
  if (cleanTerm.length <= 15) {
    // Mapeo SIMPLIFICADO solo para acentos comunes en español
    const simpleReplacements = [
      { from: 'a', to: 'á' },
      { from: 'e', to: 'é' },
      { from: 'i', to: 'í' },
      { from: 'o', to: 'ó' },
      { from: 'u', to: 'ú' },
      { from: 'n', to: 'ñ' }
    ];
    
    // Para cada reemplazo, crear UNA variación
    simpleReplacements.forEach(replacement => {
      if (cleanTerm.includes(replacement.from)) {
        const variant = cleanTerm.replace(new RegExp(replacement.from, 'g'), replacement.to);
        variations.add(variant);
      }
      if (normalized.includes(replacement.from)) {
        const variant = normalized.replace(new RegExp(replacement.from, 'g'), replacement.to);
        variations.add(variant);
      }
    });
  }
  
  console.log(`🔤 Variaciones esenciales para "${term}":`, Array.from(variations));
  return Array.from(variations);
};

/**
 * BÚSQUEDA SIMPLIFICADA Y ROBUSTA - Sin textSearch que falla
 * Usa solo ilike con OR para múltiples variaciones
 */
export const applyAccentInsensitiveSearch = (query: any, searchTerm: string) => {
  const cleanTerm = searchTerm.trim();
  if (!cleanTerm) return query;

  console.log('🔍 BÚSQUEDA SIMPLIFICADA SIN ACENTOS:', {
    termino_original: cleanTerm
  });
  
  // Crear solo variaciones esenciales
  const variations = createEssentialAccentVariations(cleanTerm);
  console.log('🔤 Total de variaciones:', variations.length);
  
  if (variations.length === 0) {
    console.warn('⚠️ No se pudieron crear variaciones, usando búsqueda simple');
    return query.ilike('name', `%${cleanTerm}%`);
  }
  
  // MÉTODO SIMPLE Y ROBUSTO: Usar OR con ilike para cada variación
  // Buscar en name, name_en y description
  const orConditions = variations.map(variation => 
    `name.ilike.%${variation}%,name_en.ilike.%${variation}%,description.ilike.%${variation}%`
  ).join(',');
  
  console.log('🔍 Condiciones OR creadas:', orConditions.length, 'caracteres');
  
  try {
    return query.or(orConditions);
  } catch (error) {
    console.error('❌ Error en búsqueda con variaciones, usando fallback:', error);
    // Fallback ultra-simple si todo falla
    return query.ilike('name', `%${cleanTerm}%`);
  }
};

/**
 * @deprecated - mantenido solo para compatibilidad
 */
export const createAccentInsensitiveSearchQuery = (searchTerm: string) => {
  const variations = createEssentialAccentVariations(searchTerm);
  return variations.map(variation => 
    `name.ilike.%${variation}%,name_en.ilike.%${variation}%,description.ilike.%${variation}%`
  ).join(',');
};
