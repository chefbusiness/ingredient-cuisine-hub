
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

// Función para verificar si un ingrediente es duplicado
export const isDuplicate = (newIngredient: any, existingIngredients: any[]): boolean => {
  const normalizeText = (text: string) => text?.toLowerCase().trim() || '';
  
  return existingIngredients.some(existing => {
    const existingNames = [
      normalizeText(existing.name),
      normalizeText(existing.name_en),
      normalizeText(existing.name_fr),
      normalizeText(existing.name_it),
      normalizeText(existing.name_pt),
      normalizeText(existing.name_zh)
    ].filter(Boolean);
    
    const newNames = [
      normalizeText(newIngredient.name),
      normalizeText(newIngredient.name_en),
      normalizeText(newIngredient.name_fr),
      normalizeText(newIngredient.name_it),
      normalizeText(newIngredient.name_pt),
      normalizeText(newIngredient.name_zh)
    ].filter(Boolean);
    
    return existingNames.some(existingName => 
      newNames.includes(existingName)
    );
  });
};
