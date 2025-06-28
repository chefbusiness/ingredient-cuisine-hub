
import { generateIngredientPrompt } from './ingredient-prompts.ts';
import { generateCategoryPrompt } from './category-prompts.ts';
import { GenerateContentParams } from './types.ts';

// Este archivo mantiene compatibilidad pero redirige al sistema completo de prompts
export const generatePrompt = (params: GenerateContentParams, existingIngredients: any[] = []): string => {
  console.log('⚠️ DEPRECATED: Usando generatePrompt legacy, redirigiendo al sistema completo');
  
  if (params.type === 'ingredient') {
    return generateIngredientPrompt(params, existingIngredients);
  } else if (params.type === 'category') {
    return generateCategoryPrompt(params.count || 1);
  }
  
  throw new Error(`Tipo de contenido no soportado: ${params.type}`);
};
