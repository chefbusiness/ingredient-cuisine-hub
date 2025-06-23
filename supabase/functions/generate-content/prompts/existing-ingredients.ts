
export const formatExistingIngredientsText = (existingIngredients: any[], isSpecificIngredient: boolean, ingredient?: string, region: string = 'España') => {
  if (existingIngredients.length === 0) {
    return '';
  }

  const ingredientsList = existingIngredients.map(ing => {
    const categoryName = ing.categories?.name || 'sin categoría';
    return `- ${ing.name} (${ing.name_en || 'N/A'}) - Categoría: ${categoryName}`;
  }).join('\n');

  return `
INGREDIENTES YA EXISTENTES EN LA BASE DE DATOS (${existingIngredients.length} total):
${ingredientsList}

⚠️ CRÍTICO - EVITAR DUPLICADOS:
- NO generes ingredientes que ya existen en la lista anterior
- Verifica nombres en TODOS los idiomas (español, inglés, francés, italiano, portugués, sinónimos latinoamericanos)
- Si un ingrediente parece similar a uno existente, elige uno COMPLETAMENTE DIFERENTE
${isSpecificIngredient ? 
  `- Si "${ingredient}" YA EXISTE en la lista, genera los datos del ingrediente existente pero asegúrate de que sea EXACTAMENTE el mismo`
  : '- Busca ingredientes únicos y específicos que NO estén en la lista'
}
- Prioriza ingredientes menos comunes pero válidos de la región ${region}
`;
};
