
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
    // MODO MANUAL: Instrucciones ultra-claras y directas
    categoryInstruction = `🎯 INSTRUCCIÓN PRINCIPAL - LEE CUIDADOSAMENTE:

Debes generar una ficha técnica COMPLETA del ingrediente específico: "${ingredient}"

CRÍTICO - QUÉ GENERAR:
✅ Información técnica DEL ingrediente "${ingredient}"
✅ Propiedades, características y datos científicos DE "${ingredient}"
✅ Cómo se USA "${ingredient}" en cocina profesional

CRÍTICO - QUÉ NO GENERAR:
❌ NO generes recetas QUE CONTENGAN "${ingredient}"
❌ NO generes platos QUE LLEVEN "${ingredient}" como componente
❌ NO cambies el nombre del ingrediente solicitado

EJEMPLO CORRECTO:
- Si solicito "Queso de Cabrales" → Generas información DEL "Queso de Cabrales"
- Si solicito "Harina de maíz precocida" → Generas información DE LA "Harina de maíz precocida"

IMPORTANTE: El campo name debe ser exactamente "${ingredient}"`;
  } else if (isSpecificIngredient) {
    // MODO ESPECÍFICO INDIVIDUAL
    categoryInstruction = `Genera una ficha técnica específica para el ingrediente "${ingredient}" de ${region}.`;
  } else {
    // MODO AUTOMÁTICO: Perplexity decide
    categoryInstruction = category 
      ? `Genera ${count} ficha(s) técnica(s) de ingrediente(s) de la categoría "${category}" de ${region}.`
      : `Genera ${count} ficha(s) técnica(s) de ingrediente(s) de ${region}.`;
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
  
  // Get mode-specific instructions (simplified for manual mode)
  const modeSpecificInstructions = isManualMode && isSpecificIngredient ? 
    `🔍 INVESTIGACIÓN REQUERIDA:
- Usa tu acceso a internet para investigar "${ingredient}"
- Busca precios HORECA/mayoristas actuales
- Verifica denominaciones de origen si aplica
- Confirma datos nutricionales oficiales` : 
    getModeInstructions(isSpecificIngredient || isManualMode, ingredient, region);
  
  // Get research instructions
  const researchInstructions = getResearchInstructions(region);
  
  // Get JSON format with merma instructions
  const jsonFormat = getJsonFormat(isSpecificIngredient || isManualMode, ingredient, category)
    .replace('[MERMA_INSTRUCTIONS_PLACEHOLDER]', mermaInstructions);
  
  // Get description instructions
  const descriptionInstructions = getDescriptionInstructions();
  
  // Get quality criteria (simplified for manual mode)
  const qualityCriteria = isManualMode && isSpecificIngredient ?
    `📋 CRITERIOS DE CALIDAD:
- EXACTITUD: Genera información precisamente para "${ingredient}"
- PRECIOS: Solo precios B2B/HORECA de distribuidores profesionales
- FUENTES: Usa fuentes oficiales y especializadas
- FORMATO: Responde SOLO con JSON válido sin comentarios adicionales

Responde con 1 ingrediente investigado en formato JSON.` :
    getQualityCriteria(isSpecificIngredient || isManualMode, ingredient, count);

  return `${categoryInstruction}

${existingIngredientsText}

${modeSpecificInstructions}

${researchInstructions}

Para ${isManualMode || isSpecificIngredient ? `el ingrediente "${ingredient}"` : 'cada ingrediente'}, proporciona la información en formato JSON:
${jsonFormat}

${descriptionInstructions}

${qualityCriteria}`;
};
