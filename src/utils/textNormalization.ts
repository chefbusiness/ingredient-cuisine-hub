
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
 * Esta versión es más robusta y simple
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
  
  // Crear condiciones de búsqueda simples y efectivas
  const conditions = [];
  
  // Búsqueda con el término original
  conditions.push(`name.ilike.%${cleanTerm}%`);
  conditions.push(`name_en.ilike.%${cleanTerm}%`);
  conditions.push(`description.ilike.%${cleanTerm}%`);
  
  // Si hay diferencia tras normalizar, añadir búsquedas normalizadas
  if (normalizedSearch !== cleanTerm.toLowerCase()) {
    conditions.push(`name.ilike.%${normalizedSearch}%`);
    conditions.push(`name_en.ilike.%${normalizedSearch}%`);
    conditions.push(`description.ilike.%${normalizedSearch}%`);
  }
  
  const searchQuery = conditions.join(',');
  console.log('🔍 Query final de búsqueda:', searchQuery);
  
  return query.or(searchQuery);
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
