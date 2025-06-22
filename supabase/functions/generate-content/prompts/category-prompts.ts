
export const generateCategoryPrompt = (count: number): string => {
  return `Genera ${count} nueva(s) categoría(s) de ingredientes culinarios que no sean comunes. 
  Formato JSON:
  {
    "name": "nombre en español (singular, minúsculas)",
    "name_en": "nombre en inglés",
    "description": "descripción de la categoría"
  }
  
  Responde SOLO con un array JSON válido, sin texto adicional.`;
};
