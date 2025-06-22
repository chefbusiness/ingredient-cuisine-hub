
// Función auxiliar para obtener instrucciones específicas de merma por categoría
export const getMermaInstructionsByCategory = (category: string): string => {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('pescado') || categoryLower.includes('mariscos')) {
    return `número entre 35-80 (INVESTIGAR: pescados enteros 50-80%, filetes 10-25%, mariscos con cáscara 40-70%, buscar datos específicos por especie y presentación)`;
  }
  
  if (categoryLower.includes('carne') || categoryLower.includes('aves')) {
    return `número entre 15-60 (INVESTIGAR: carnes con hueso 25-50%, sin hueso 5-20%, aves enteras 30-45%, buscar datos por corte específico)`;
  }
  
  if (categoryLower.includes('verdura') || categoryLower.includes('hortaliza')) {
    return `número entre 5-40 (INVESTIGAR: verduras de hoja 15-30%, raíces 10-25%, frutos 5-15%, buscar datos por tipo de limpieza requerida)`;
  }
  
  if (categoryLower.includes('fruta')) {
    return `número entre 8-35 (INVESTIGAR: frutas con hueso 15-25%, cítricas 20-35%, tropicales 25-45%, buscar datos por método de pelado/procesamiento)`;
  }
  
  if (categoryLower.includes('legumbre') || categoryLower.includes('cereal')) {
    return `número entre 2-15 (INVESTIGAR: productos secos 2-8%, frescos 10-20%, buscar datos específicos por preparación)`;
  }
  
  if (categoryLower.includes('lácteo') || categoryLower.includes('queso')) {
    return `número entre 2-10 (INVESTIGAR: productos procesados 2-5%, quesos con corteza 8-15%, buscar datos específicos)`;
  }
  
  // Categoría general o no específica
  return `número entre 5-70 (INVESTIGAR en internet: buscar datos reales de merma profesional, considerar tipo de procesamiento, limpieza, desecho, etc.)`;
};

// Función auxiliar para instrucciones generales de merma
export const getGeneralMermaInstructions = (): string => {
  return `número entre 5-80 (INVESTIGAR PROFUNDAMENTE: buscar datos reales de merma profesional en internet, considerar categoría del ingrediente, tipo de procesamiento, nivel de limpieza requerido, descartes, etc. Usar rangos específicos por tipo)`;
};
