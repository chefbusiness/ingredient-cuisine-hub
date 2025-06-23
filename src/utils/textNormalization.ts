
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
 * Crea todas las variaciones posibles de un término con y sin acentos
 * Esto asegura que "azafran" encuentre "Azafrán" y viceversa
 */
const createAllAccentVariations = (term: string): string[] => {
  const variations = new Set<string>();
  
  // Agregar el término original
  variations.add(term.toLowerCase());
  
  // Agregar versión normalizada (sin acentos)
  const normalized = normalizeText(term);
  variations.add(normalized);
  
  // Mapeo completo de caracteres con acentos
  const accentMap: { [key: string]: string[] } = {
    'a': ['a', 'á', 'à', 'ä', 'â', 'ã', 'å'],
    'e': ['e', 'é', 'è', 'ë', 'ê'],
    'i': ['i', 'í', 'ì', 'ï', 'î'],
    'o': ['o', 'ó', 'ò', 'ö', 'ô', 'õ'],
    'u': ['u', 'ú', 'ù', 'ü', 'û'],
    'n': ['n', 'ñ'],
    'c': ['c', 'ç']
  };
  
  // Para cada carácter del término, crear variaciones con acentos
  const createVariationsRecursive = (currentTerm: string, position: number): void => {
    if (position >= currentTerm.length) {
      variations.add(currentTerm);
      return;
    }
    
    const char = currentTerm[position].toLowerCase();
    const possibleChars = accentMap[char] || [char];
    
    for (const possibleChar of possibleChars) {
      const newTerm = currentTerm.substring(0, position) + possibleChar + currentTerm.substring(position + 1);
      createVariationsRecursive(newTerm, position + 1);
    }
  };
  
  // Solo crear variaciones para términos cortos para evitar explosión combinatoria
  if (term.length <= 10) {
    createVariationsRecursive(term.toLowerCase(), 0);
  }
  
  return Array.from(variations);
};

/**
 * NUEVA IMPLEMENTACIÓN: Búsqueda insensible a acentos que REALMENTE funciona
 * Aplica múltiples condiciones de búsqueda usando textSearch de Supabase
 */
export const applyAccentInsensitiveSearch = (query: any, searchTerm: string) => {
  const cleanTerm = searchTerm.trim();
  if (!cleanTerm) return query;

  console.log('🔍 NUEVA BÚSQUEDA SIN ACENTOS:', {
    termino_original: cleanTerm
  });
  
  // Crear todas las variaciones del término
  const variations = createAllAccentVariations(cleanTerm);
  console.log('🔤 Variaciones creadas:', variations);
  
  // MÉTODO SIMPLIFICADO: usar textSearch que es más robusto
  // En lugar de múltiples ilike, usamos una búsqueda de texto completo
  try {
    // Probar primero con textSearch
    const searchQuery = variations.join(' | ');
    console.log('🔍 Query de búsqueda de texto:', searchQuery);
    
    return query.textSearch('name', searchQuery, {
      type: 'websearch',
      config: 'spanish'
    });
  } catch (error) {
    console.warn('⚠️ textSearch falló, usando método alternativo:', error);
    
    // FALLBACK: Usar OR con múltiples ilike de forma más simple
    return query.or(
      variations.map(variation => 
        `name.ilike.%${variation}%,name_en.ilike.%${variation}%,description.ilike.%${variation}%`
      ).join(',')
    );
  }
};

/**
 * @deprecated - mantenido solo para compatibilidad
 */
export const createAccentInsensitiveSearchQuery = (searchTerm: string) => {
  const variations = createAllAccentVariations(searchTerm);
  return variations.map(variation => 
    `name.ilike.%${variation}%,name_en.ilike.%${variation}%,description.ilike.%${variation}%`
  ).join(',');
};
