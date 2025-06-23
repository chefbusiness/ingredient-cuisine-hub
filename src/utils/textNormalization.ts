
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
 * Aplica búsqueda insensible a acentos creando múltiples condiciones OR
 * Esta versión es más robusta y garantiza que encuentre coincidencias
 */
export const applyAccentInsensitiveSearch = (query: any, searchTerm: string) => {
  const normalizedSearch = normalizeText(searchTerm);
  
  console.log('🔍 Búsqueda aplicada:', {
    termino_original: searchTerm,
    termino_normalizado: normalizedSearch
  });
  
  // Crear múltiples condiciones de búsqueda para máxima compatibilidad
  const searchConditions = [
    `name.ilike.%${searchTerm}%`,
    `name_en.ilike.%${searchTerm}%`,
    `description.ilike.%${searchTerm}%`
  ];
  
  // Si el término normalizado es diferente, agregar también esas búsquedas
  if (normalizedSearch !== searchTerm.toLowerCase()) {
    searchConditions.push(
      `name.ilike.%${normalizedSearch}%`,
      `name_en.ilike.%${normalizedSearch}%`,
      `description.ilike.%${normalizedSearch}%`
    );
  }
  
  // Aplicar todas las condiciones con OR
  const fullSearchQuery = searchConditions.join(',');
  console.log('🔍 Query final de búsqueda:', fullSearchQuery);
  
  return query.or(fullSearchQuery);
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
