
import { getAdvancedDescriptionInstructions } from './advanced-description-instructions.ts';

export const getResearchInstructions = (region: string) => `
🌐 INVESTIGACIÓN WEB OBLIGATORIA - USA TU ACCESO A INTERNET:

⚠️ VERIFICACIÓN HISTÓRICA CRÍTICA:
- VERIFICA orígenes geográficos con fuentes académicas confiables
- El TOMATE es de origen AMERICANO (México/Perú), NO mediterráneo
- La PATATA es de origen ANDINO (Perú/Bolivia), NO europeo
- El MAÍZ es de origen MESOAMERICANO (México), NO del Viejo Mundo
- CONSULTA múltiples fuentes históricas antes de afirmar orígenes

PASO 1 - BÚSQUEDA DE INFORMACIÓN REAL:
- Consulta mercados mayoristas (Mercamadrid, Mercabarna, USDA, etc.) para PRECIOS ACTUALES
- Busca en sitios profesionales de hostelería para DATOS DE MERMA reales
- Consulta BEDCA, USDA, FAO para información nutricional OFICIAL
- Revisa publicaciones gastronómicas para RECETAS AUTÉNTICAS
- Verifica TEMPORADAS en calendarios agrícolas oficiales
- CONFIRMA orígenes históricos en fuentes académicas (National Geographic, Smithsonian, universidades)

PASO 2 - VALIDACIÓN CRUZADA:
- Compara datos de AL MENOS 2-3 fuentes diferentes
- Prioriza fuentes oficiales y profesionales
- Descarta información que parezca desactualizada
- Anota las fuentes consultadas para cada dato
- RECHAZA información histórica sin verificación académica`;

export const getDescriptionInstructions = () => {
  return getAdvancedDescriptionInstructions();
};

export const getModeInstructions = (isSpecificIngredient: boolean, ingredient?: string, region: string = 'España') => {
  if (isSpecificIngredient && ingredient) {
    return `
🎯 MODO MANUAL - INGREDIENTE ESPECÍFICO:
- Debes investigar EXACTAMENTE el ingrediente: "${ingredient}"
- NO cambies el nombre del ingrediente solicitado
- Si el ingrediente tiene variantes regionales, usa la variante de ${region}
- Investiga datos específicos para este ingrediente particular
- Asegúrate de que toda la información corresponda exactamente a "${ingredient}"
- VERIFICA el origen histórico del ingrediente con fuentes académicas`;
  } else {
    return `
🤖 MODO AUTOMÁTICO - PERPLEXITY DECIDE:
- Selecciona ingredientes interesantes y útiles para profesionales
- Prioriza ingredientes comunes en cocina profesional de ${region}
- Evita ingredientes demasiado exóticos o difíciles de conseguir
- Asegúrate de que sean ingredientes realmente utilizados en hostelería
- VERIFICA orígenes históricos antes de incluir información`;
  }
};
