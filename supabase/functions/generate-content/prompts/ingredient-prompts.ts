
import { GenerateContentParams } from '../types.ts';
import { getMermaInstructionsByCategory, getGeneralMermaInstructions } from './merma-instructions.ts';
import { getResearchInstructions, getDescriptionInstructions, getModeInstructions } from './instruction-templates.ts';
import { getJsonFormat } from './json-format.ts';
import { getQualityCriteria } from './quality-criteria.ts';
import { formatExistingIngredientsText } from './existing-ingredients.ts';

export const generateIngredientPrompt = (params: GenerateContentParams, existingIngredients: any[] = []): string => {
  const { category, region = 'España', count = 1, ingredient, ingredientsList } = params;
  
  // MODO MANUAL ESPECÍFICO: Procesamiento individual de ingredientes de una lista
  const isManualMode = ingredientsList && ingredientsList.length > 0;
  const isSpecificIngredient = ingredient && ingredient.trim().length > 0;
  
  let categoryInstruction: string;
  
  if (isManualMode && isSpecificIngredient) {
    // MODO MANUAL: Generar ingrediente ESPECÍFICO de la lista proporcionada
    categoryInstruction = `MODO MANUAL - INGREDIENTE ESPECÍFICO:
Debes generar información EXCLUSIVAMENTE para el ingrediente "${ingredient}" de ${region}.
Este ingrediente fue seleccionado de una lista específica proporcionada por el usuario.
NO GENERES ningún otro ingrediente. SOLO "${ingredient}".
Si "${ingredient}" ya existe en la base de datos, RECHAZA completamente la generación y responde con error de duplicado.`;
  } else if (isSpecificIngredient) {
    // MODO ESPECÍFICO INDIVIDUAL
    categoryInstruction = `Investiga y genera información detallada específicamente para el ingrediente "${ingredient}" típico de ${region}.`;
  } else {
    // MODO AUTOMÁTICO: Perplexity decide
    categoryInstruction = category 
      ? `Investiga y genera ${count} ingrediente(s) específicamente de la categoría "${category}" típico(s) de ${region}.`
      : `Investiga y genera ${count} ingrediente(s) típico(s) de ${region}.`;
  }

  // Get merma instructions by category
  const mermaInstructions = category ? getMermaInstructionsByCategory(category) : getGeneralMermaInstructions();
  
  // Format existing ingredients list with enhanced duplicate detection
  const existingIngredientsText = formatExistingIngredientsText(
    existingIngredients, 
    isSpecificIngredient || isManualMode, 
    ingredient, 
    region
  );
  
  // Get mode-specific instructions
  const modeSpecificInstructions = getModeInstructions(isSpecificIngredient || isManualMode, ingredient, region);
  
  // Get research instructions
  const researchInstructions = getResearchInstructions(region);
  
  // Get JSON format with merma instructions
  const jsonFormat = getJsonFormat(isSpecificIngredient || isManualMode, ingredient, category)
    .replace('[MERMA_INSTRUCTIONS_PLACEHOLDER]', mermaInstructions);
  
  // Get description instructions
  const descriptionInstructions = getDescriptionInstructions();
  
  // Get quality criteria
  const qualityCriteria = getQualityCriteria(isSpecificIngredient || isManualMode, ingredient, count);
  
  // INSTRUCCIONES ESPECÍFICAS PARA MODO MANUAL
  const manualModeWarnings = isManualMode ? `
🚨 MODO MANUAL - INSTRUCCIONES CRÍTICAS:
- El usuario solicita ESPECÍFICAMENTE el ingrediente "${ingredient}"
- NO generes ingredientes alternativos o similares
- Si "${ingredient}" YA EXISTE en la base de datos, DETÉN la generación inmediatamente
- Responde SOLO con el ingrediente solicitado o error de duplicado
- NO gastes tokens generando ingredientes ya existentes
- Verifica TODAS las variaciones de nombres (español, catalán, gallego, vasco, sinónimos)
` : '';

  return `${categoryInstruction}
  
  ${manualModeWarnings}
  
  ${existingIngredientsText}
  
  ${modeSpecificInstructions}
  
  ${researchInstructions}
  
  Para ${isManualMode || isSpecificIngredient ? `el ingrediente "${ingredient}"` : 'cada ingrediente'}, proporciona la siguiente información en formato JSON:
  ${jsonFormat}
  
  ${descriptionInstructions}
  
  ${qualityCriteria}`;
};
