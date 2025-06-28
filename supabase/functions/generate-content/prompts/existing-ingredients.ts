
export const formatExistingIngredientsText = (existingIngredients: any[], isSpecificIngredient: boolean, ingredient?: string, region: string = 'España') => {
  if (existingIngredients.length === 0) {
    return '';
  }

  // Crear lista más detallada para mejor detección de duplicados
  const ingredientsList = existingIngredients.map(ing => {
    const categoryName = ing.categories?.name || 'sin categoría';
    const allNames = [
      ing.name,
      ing.name_en,
      ing.name_fr,
      ing.name_it, 
      ing.name_pt,
      ing.name_zh,
      ing.name_la
    ].filter(Boolean).join(' / ');
    
    return `- ${ing.name} (${allNames}) - Categoría: ${categoryName}`;
  }).join('\n');

  // Verificación específica si estamos en modo manual
  const duplicateWarning = isSpecificIngredient ? `
🔍 VERIFICACIÓN DE DUPLICADO ESPECÍFICO:
${ingredient ? `Estás buscando generar: "${ingredient}"` : ''}
Revisa cuidadosamente si "${ingredient}" o cualquier variación ya existe en la lista de arriba.
Variaciones a verificar: nombres en español, catalán, gallego, vasco, inglés, francés, italiano, portugués.
Si encuentras ANY coincidencia, DETÉN la generación inmediatamente.` : '';

  return `
INGREDIENTES YA EXISTENTES EN LA BASE DE DATOS (${existingIngredients.length} total):
${ingredientsList}

⚠️ CRÍTICO - DETECCIÓN AVANZADA DE DUPLICADOS:
- NO generes ingredientes que ya existen en la lista anterior
- Verifica nombres en TODOS los idiomas disponibles
- Incluye variaciones regionales (catalán: formatge, gallego: queixo, vasco: gazta)
- Verifica sinónimos y nombres alternativos
${duplicateWarning}
${isSpecificIngredient ? 
  `- Si "${ingredient}" o cualquier variación YA EXISTE, responde: {"error": "DUPLICADO_DETECTADO", "ingredient": "${ingredient}", "reason": "Ya existe en la base de datos"}`
  : '- Busca ingredientes únicos y específicos que NO estén en la lista'
}
- Prioriza ingredientes menos comunes pero válidos de la región ${region}
`;
};
