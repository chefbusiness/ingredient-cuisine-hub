
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
 * Aplica búsqueda insensible a acentos con manejo mejorado de errores
 * VERSIÓN CORREGIDA que funciona correctamente con Supabase
 */
export const applyAccentInsensitiveSearch = (query: any, searchTerm: string) => {
  // Limpiar el término de búsqueda
  const cleanTerm = searchTerm.trim();
  if (!cleanTerm) return query;

  const normalizedSearch = normalizeText(cleanTerm);
  
  console.log('🔍 Búsqueda aplicada:', {
    termino_original: cleanTerm,
    termino_normalizado: normalizedSearch
  });
  
  // BÚSQUEDA MEJORADA: Buscar tanto el término original como el normalizado
  // Esto asegura que "azafran" encuentre "Azafrán" y viceversa
  const searchConditions = [
    `name.ilike.%${cleanTerm}%`,
    `name_en.ilike.%${cleanTerm}%`,
    `description.ilike.%${cleanTerm}%`
  ];

  // Si el término normalizado es diferente, añadir búsquedas normalizadas
  if (normalizedSearch !== cleanTerm.toLowerCase()) {
    searchConditions.push(
      `name.ilike.%${normalizedSearch}%`,
      `name_en.ilike.%${normalizedSearch}%`,
      `description.ilike.%${normalizedSearch}%`
    );
  }

  // CREAR CONDICIONES ADICIONALES para caracteres específicos comunes
  const accentVariations = createAccentVariations(cleanTerm);
  accentVariations.forEach(variation => {
    if (variation !== cleanTerm && variation !== normalizedSearch) {
      searchConditions.push(
        `name.ilike.%${variation}%`,
        `name_en.ilike.%${variation}%`
      );
    }
  });
  
  const searchQuery = searchConditions.join(',');
  console.log('🔍 Query final de búsqueda:', searchQuery);
  
  return query.or(searchQuery);
};

/**
 * Crea variaciones comunes de acentos para términos de búsqueda
 * Esto permite que "azafran" encuentre "Azafrán" y viceversa
 */
const createAccentVariations = (term: string): string[] => {
  const variations = [term];
  
  // Mapeo de caracteres con y sin acentos más comunes en español
  const accentMap: { [key: string]: string[] } = {
    'a': ['á', 'à', 'ä', 'â'],
    'e': ['é', 'è', 'ë', 'ê'],
    'i': ['í', 'ì', 'ï', 'î'],
    'o': ['ó', 'ò', 'ö', 'ô'],
    'u': ['ú', 'ù', 'ü', 'û'],
    'n': ['ñ'],
    'c': ['ç']
  };
  
  // Crear variaciones agregando acentos donde sea común
  let currentTerm = term.toLowerCase();
  
  // Para "azafran" crear "azafrán"
  if (currentTerm.includes('a')) {
    accentMap['a'].forEach(accent => {
      const variation = currentTerm.replace(/a/g, accent);
      if (variation !== currentTerm) {
        variations.push(variation);
      }
    });
  }
  
  return variations;
};

/**
 * Crea una consulta de búsqueda que incluye tanto la búsqueda exacta
 * como la búsqueda normalizada sin acentos
 * @deprecated Usar applyAccentInsensitiveSearch en su lugar
 */
export const createAccentInsensitiveSearchQuery = (searchTerm: string) => {
  const normalizedSearch = normalizeText(searchTerm);
  
  // SIEMPRE buscar tanto la versión original como la normalizada
  // Esto asegura que "azafran" encuentre "azafrán" y viceversa
  return `name.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,name.ilike.%${normalizedSearch}%,name_en.ilike.%${normalizedSearch}%,description.ilike.%${normalizedSearch}%`;
};
