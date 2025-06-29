
import { GenerateContentParams } from '../types.ts';
import { getMermaInstructionsByCategory, getGeneralMermaInstructions } from './merma-instructions.ts';
import { getResearchInstructions, getDescriptionInstructions, getModeInstructions } from './instruction-templates.ts';
import { getJsonFormat } from './json-format.ts';
import { getQualityCriteria } from './quality-criteria.ts';
import { formatExistingIngredientsText } from './existing-ingredients.ts';

export const generateIngredientPrompt = (params: GenerateContentParams, existingIngredients: any[] = []): string => {
  const { category, region = 'España', count = 1, ingredient, ingredientsList } = params;
  
  // CORREGIDO: Detección correcta del modo manual
  const isManualMode = ingredientsList && ingredientsList.length > 0;
  const isSpecificIngredient = ingredient && ingredient.trim().length > 0;
  
  let categoryInstruction: string;
  
  if (isManualMode) {
    // MODO MANUAL MASIVO: Lista específica de ingredientes
    const ingredientsText = ingredientsList.join(', ');
    categoryInstruction = `MODO MANUAL MASIVO - LISTA ESPECÍFICA:
Debes generar información EXCLUSIVAMENTE para estos ${ingredientsList.length} ingredientes de ${region}:
${ingredientsText}

INSTRUCCIONES CRÍTICAS:
- Genera información para CADA UNO de estos ${ingredientsList.length} ingredientes específicos
- NO generes ingredientes alternativos o similares
- Si algún ingrediente YA EXISTE en la base de datos, OMÍTELO del resultado
- Responde con un array JSON con información detallada de cada ingrediente solicitado
- NO gastes tokens generando ingredientes ya existentes`;
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
  
  // INSTRUCCIONES ESPECÍFICAS PARA MODO MANUAL MASIVO
  const manualModeWarnings = isManualMode ? `
🚨 MODO MANUAL MASIVO - INSTRUCCIONES CRÍTICAS:
- El usuario solicita ESPECÍFICAMENTE estos ${ingredientsList.length} ingredientes: ${ingredientsList.join(', ')}
- Genera información completa para CADA ingrediente de la lista
- NO generes ingredientes alternativos o similares
- Si algún ingrediente YA EXISTE en la base de datos, OMÍTELO completamente del resultado
- Responde con un array JSON que contenga SOLO los ingredientes solicitados que no existan ya
- NO gastes tokens generando ingredientes ya existentes
- Verifica TODAS las variaciones de nombres (español, catalán, gallego, vasco, sinónimos)
` : '';

  return `${categoryInstruction}
  
  ${manualModeWarnings}
  
  ${existingIngredientsText}
  
  ${modeSpecificInstructions}
  
  ${researchInstructions}
  
  Para ${isManualMode ? `cada uno de los ingredientes solicitados` : isSpecificIngredient ? `el ingrediente "${ingredient}"` : 'cada ingrediente'}, proporciona la siguiente información en formato JSON:
  ${jsonFormat}
  
  ${descriptionInstructions}
  
  ${qualityCriteria}`;
};
