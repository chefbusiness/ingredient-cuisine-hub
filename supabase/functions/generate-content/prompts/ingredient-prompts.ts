
import { GenerateContentParams } from '../types.ts';
import { getMermaInstructionsByCategory, getGeneralMermaInstructions } from './merma-instructions.ts';

export const generateIngredientPrompt = (params: GenerateContentParams): string => {
  const { category, region = 'España', count = 1 } = params;
  
  const categoryInstruction = category 
    ? `Genera ${count} ingrediente(s) específicamente de la categoría "${category}" típico(s) de ${region}.`
    : `Genera ${count} ingrediente(s) típico(s) de ${region}.`;
  
  const categoryResponse = category 
    ? `"category": "${category}",`
    : `"category": "determina la categoría apropiada basada en el ingrediente",`;

  // Instrucciones específicas de merma por categoría
  const mermaInstructions = category ? getMermaInstructionsByCategory(category) : getGeneralMermaInstructions();
  
  return `${categoryInstruction}
  
  IMPORTANTE: Realiza una INVESTIGACIÓN PROFUNDA en internet para obtener datos PRECISOS y ACTUALES sobre cada ingrediente. Busca información de:
  - Manuales profesionales de gastronomía y hostelería
  - Estudios de rendimiento culinario
  - Bases de datos de la industria alimentaria
  - Publicaciones especializadas en food service
  - Datos de proveedores profesionales
  
  Para cada ingrediente, proporciona la siguiente información en formato JSON:
  {
    "name": "nombre en español",
    "name_en": "nombre en inglés",
    "name_fr": "nombre en francés",
    "name_it": "nombre en italiano", 
    "name_pt": "nombre en portugués",
    "name_zh": "nombre en chino (caracteres chinos)",
    "name_la": "nombre científico en latín (opcional)",
    ${categoryResponse}
    "description": "descripción detallada (150-200 palabras)",
    "temporada": "temporada principal (ej: primavera, verano, otoño, invierno, todo el año)",
    "origen": "región de origen",
    "merma": ${mermaInstructions},
    "rendimiento": número entre 20-95 (100 - merma, calculado automáticamente basado en la merma real),
    "popularity": número entre 1-100,
    "nutritional_info": {
      "calories": número,
      "protein": número,
      "carbs": número,
      "fat": número,
      "fiber": número,
      "vitamin_c": número
    },
    "uses": ["uso culinario 1", "uso culinario 2", "uso culinario 3"],
    "recipes": [
      {
        "name": "nombre de receta",
        "type": "tipo (entrante, principal, postre, etc)",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado"
      }
    ],
    "varieties": ["variedad 1", "variedad 2"],
    "price_estimate": número (precio estimado por kg en euros)
  }
  
  CRÍTICO - CÁLCULO DE MERMAS:
  - BUSCA DATOS REALES de mermas en internet de fuentes profesionales
  - USA RANGOS REALISTAS: pescados enteros (50-80%), carnes con hueso (30-60%), verduras (5-40%)
  - ESPECIFICA el tipo de procesamiento: limpieza, desespinado, deshuesado, pelado, etc.
  - CONSIDERA: producto fresco vs. congelado vs. procesado
  - VALIDA con múltiples fuentes profesionales antes de asignar el porcentaje
  - Si no encuentras datos específicos, usa promedios de la categoría e INDICA que es estimado
  
  IMPORTANTE: 
  - Todos los ingredientes DEBEN tener name_fr, name_it, name_pt y name_zh completados
  ${category ? `- Todos los ingredientes DEBEN pertenecer a la categoría "${category}"` : ''}
  - Usa nombres reales y precisos en cada idioma
  - Para name_zh usa caracteres chinos tradicionales o simplificados apropiados
  - Las mermas DEBEN ser precisas y basadas en investigación real, no estimaciones genéricas
  
  Responde SOLO con un array JSON válido de ingredientes, sin texto adicional.`;
};
