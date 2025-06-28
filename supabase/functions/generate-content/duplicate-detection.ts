
export async function checkForDuplicates(
  ingredientsList: string[],
  existingIngredientsData: any[]
): Promise<{ ingredient: string; isDuplicate: boolean; reason?: string }[]> {
  console.log('🔍 Enhanced duplicate detection starting...');
  
  return ingredientsList.map(ingredient => {
    const isExactDuplicate = existingIngredientsData.some(existing => {
      const allExistingNames = [
        existing.name?.toLowerCase().trim(),
        existing.name_en?.toLowerCase().trim(),
        existing.name_fr?.toLowerCase().trim(),
        existing.name_it?.toLowerCase().trim(),
        existing.name_pt?.toLowerCase().trim(),
        existing.name_la?.toLowerCase().trim()
      ].filter(Boolean);
      
      const searchName = ingredient.toLowerCase().trim();
      
      // Solo coincidencia EXACTA o muy específica (no contención general)
      return allExistingNames.some(existingName => {
        // Coincidencia exacta
        if (existingName === searchName) return true;
        
        // Para nombres compuestos, verificar coincidencia específica
        const existingWords = existingName.split(/\s+/);
        const searchWords = searchName.split(/\s+/);
        
        // Solo si ambos son nombres compuestos y coinciden exactamente
        if (existingWords.length > 1 && searchWords.length > 1) {
          return existingWords.every(word => searchWords.includes(word)) ||
                 searchWords.every(word => existingWords.includes(word));
        }
        
        return false;
      });
    });
    
    return {
      ingredient,
      isDuplicate: isExactDuplicate,
      reason: isExactDuplicate ? 'Ya existe exactamente en la base de datos' : undefined
    };
  });
}
