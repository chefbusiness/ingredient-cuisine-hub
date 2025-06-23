
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
 * Aplica búsqueda insensible a acentos directamente a la query de Supabase
 */
export const applyAccentInsensitiveSearch = (query: any, searchTerm: string) => {
  const normalizedSearch = normalizeText(searchTerm);
  
  // Construir condiciones de búsqueda para el término original
  const originalConditions = [
    `name.ilike.%${searchTerm}%`,
    `name_en.ilike.%${searchTerm}%`,
    `description.ilike.%${searchTerm}%`
  ];
  
  // Construir condiciones de búsqueda para el término normalizado
  const normalizedConditions = [
    `name.ilike.%${normalizedSearch}%`,
    `name_en.ilike.%${normalizedSearch}%`,
    `description.ilike.%${normalizedSearch}%`
  ];
  
  // Combinar todas las condiciones con OR
  const allConditions = [...originalConditions, ...normalizedConditions];
  
  return query.or(allConditions.join(','));
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
