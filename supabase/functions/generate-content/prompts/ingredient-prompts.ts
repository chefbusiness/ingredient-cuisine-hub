
import { GenerateContentParams } from '../types.ts';
import { getMermaInstructionsByCategory, getGeneralMermaInstructions } from './merma-instructions.ts';
import { getResearchInstructions, getDescriptionInstructions, getModeInstructions } from './instruction-templates.ts';
import { getJsonFormat } from './json-format.ts';
import { getQualityCriteria } from './quality-criteria.ts';
import { formatExistingIngredientsText } from './existing-ingredients.ts';

export const generateIngredientPrompt = (params: GenerateContentParams, existingIngredients: any[] = []): string => {
  const { category, region = 'España', count = 1, ingredient } = params;
  
  // Check if we're generating a specific ingredient (manual mode)
  const isSpecificIngredient = ingredient && ingredient.trim().length > 0;
  
  let categoryInstruction: string;
  
  if (isSpecificIngredient) {
    // MANUAL MODE: Generate specific ingredient
    categoryInstruction = `Investiga y genera información detallada específicamente para el ingrediente "${ingredient}" típico de ${region}.`;
  } else {
    // AUTOMATIC MODE: Let Perplexity decide
    categoryInstruction = category 
      ? `Investiga y genera ${count} ingrediente(s) específicamente de la categoría "${category}" típico(s) de ${region}.`
      : `Investiga y genera ${count} ingrediente(s) típico(s) de ${region}.`;
  }

  // Get merma instructions by category
  const mermaInstructions = category ? getMermaInstructionsByCategory(category) : getGeneralMermaInstructions();
  
  // Format existing ingredients list
  const existingIngredientsText = formatExistingIngredientsText(existingIngredients, isSpecificIngredient, ingredient, region);
  
  // Get mode-specific instructions
  const modeSpecificInstructions = getModeInstructions(isSpecificIngredient, ingredient, region);
  
  // Get research instructions
  const researchInstructions = getResearchInstructions(region);
  
  // Get JSON format with merma instructions
  const jsonFormat = getJsonFormat(isSpecificIngredient, ingredient, category).replace('[MERMA_INSTRUCTIONS_PLACEHOLDER]', mermaInstructions);
  
  // Get description instructions
  const descriptionInstructions = getDescriptionInstructions();
  
  // Get quality criteria
  const qualityCriteria = getQualityCriteria(isSpecificIngredient, ingredient, count);
  
  return `${categoryInstruction}
  
  ${existingIngredientsText}
  
  ${modeSpecificInstructions}
  
  ${researchInstructions}
  
  Para ${isSpecificIngredient ? `el ingrediente "${ingredient}"` : 'cada ingrediente'}, proporciona la siguiente información en formato JSON:
  ${jsonFormat}
  
  ${descriptionInstructions}
  
  ${qualityCriteria}`;
};
