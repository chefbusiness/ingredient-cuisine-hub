
import { GenerateContentParams } from './types.ts';

export const generatePrompt = (params: GenerateContentParams, existingIngredients: any[] = []): string => {
  const { type, category, region = 'España', count = 1, ingredient, ingredientsList } = params;
  
  console.log('📝 Generando prompt para:', { type, category, region, count, ingredient, ingredientsList });
  
  // MODO DEBUGGING: Prompt simplificado
  if (type === 'ingredient') {
    if (ingredientsList && ingredientsList.length > 0) {
      // Modo manual con lista específica
      return `Genera información detallada para estos ingredientes específicos: ${ingredientsList.join(', ')}. 
      Región: ${region}. 
      Categoría: ${category || 'general'}.
      
      Responde con un JSON array con la información de cada ingrediente.`;
    } else {
      // Modo automático
      return `Genera ${count} ingrediente(s) de la categoría "${category || 'general'}" típicos de ${region}.
      
      Responde con un JSON array con la información de cada ingrediente.`;
    }
  }
  
  return `Genera contenido de tipo ${type} para ${region}`;
};
