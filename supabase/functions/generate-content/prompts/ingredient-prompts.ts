
import { GenerateContentParams } from '../types.ts';
import { getMermaInstructionsByCategory, getGeneralMermaInstructions } from './merma-instructions.ts';

export const generateIngredientPrompt = (params: GenerateContentParams, existingIngredients: any[] = []): string => {
  const { category, region = 'España', count = 1 } = params;
  
  const categoryInstruction = category 
    ? `Genera ${count} ingrediente(s) específicamente de la categoría "${category}" típico(s) de ${region}.`
    : `Genera ${count} ingrediente(s) típico(s) de ${region}.`;
  
  const categoryResponse = category 
    ? `"category": "${category}",`
    : `"category": "determina la categoría apropiada basada en el ingrediente",`;

  // Instrucciones específicas de merma por categoría
  const mermaInstructions = category ? getMermaInstructionsByCategory(category) : getGeneralMermaInstructions();
  
  // Crear lista de ingredientes existentes para evitar duplicados
  let existingIngredientsText = '';
  if (existingIngredients.length > 0) {
    const ingredientsList = existingIngredients.map(ing => {
      const categoryName = ing.categories?.name || 'sin categoría';
      return `- ${ing.name} (${ing.name_en || 'N/A'}) - Categoría: ${categoryName}`;
    }).join('\n');
    
    existingIngredientsText = `
INGREDIENTES YA EXISTENTES EN LA BASE DE DATOS (${existingIngredients.length} total):
${ingredientsList}

⚠️ CRÍTICO - EVITAR DUPLICADOS:
- NO generes ingredientes que ya existen en la lista anterior
- Verifica nombres en TODOS los idiomas (español, inglés, francés, italiano, portugués, sinónimos latinoamericanos)
- Si un ingrediente parece similar a uno existente, elige uno COMPLETAMENTE DIFERENTE
- Busca ingredientes únicos y específicos que NO estén en la lista
- Prioriza ingredientes menos comunes pero válidos de la región ${region}
`;
  }
  
  return `${categoryInstruction}
  
  ${existingIngredientsText}
  
  IMPORTANTE: Realiza una INVESTIGACIÓN PROFUNDA en internet para obtener datos PRECISOS y ACTUALES sobre cada ingrediente. Busca información de:
  - Manuales profesionales de gastronomía y hostelería
  - Estudios de rendimiento culinario
  - Bases de datos de la industria alimentaria
  - Publicaciones especializadas en food service
  - Datos de proveedores profesionales
  
  Para cada ingrediente, proporciona la siguiente información en formato JSON:
  {
    "name": "nombre en español (España)",
    "name_en": "nombre en inglés",
    "name_fr": "nombre en francés",
    "name_it": "nombre en italiano", 
    "name_pt": "nombre en portugués",
    "name_zh": "nombre en chino (caracteres chinos)",
    "name_la": "sinónimos en español de Latinoamérica (ej: papa en lugar de patata, tomate en lugar de jitomate, etc.)",
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
        "name": "nombre de receta entrante",
        "type": "entrante",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado"
      },
      {
        "name": "nombre de receta principal",
        "type": "principal",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado"
      },
      {
        "name": "nombre de receta guarnición",
        "type": "guarnición",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado"
      },
      {
        "name": "nombre de receta postre",
        "type": "postre",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado"
      },
      {
        "name": "nombre de receta salsa/condimento",
        "type": "salsa",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado"
      },
      {
        "name": "nombre de receta especialidad regional",
        "type": "especialidad",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado"
      }
    ],
    "varieties": ["variedad 1", "variedad 2"],
    "price_estimate": número (precio estimado por kg en euros)
  }
  
  CRÍTICO - RECETAS (GENERAR EXACTAMENTE 6):
  - SIEMPRE crear exactamente 6 recetas diferentes por ingrediente
  - Variar los tipos: entrante, principal, guarnición, postre, salsa, especialidad
  - Diversificar dificultades: 2 fáciles, 2 medias, 2 difíciles
  - Incluir tiempos variados: desde 15 min hasta 3+ horas
  - Usar recetas REALES y conocidas de la gastronomía profesional
  - INVESTIGAR recetas auténticas que usen este ingrediente como protagonista
  
  CRÍTICO - CÁLCULO DE MERMAS:
  - BUSCA DATOS REALES de mermas en internet de fuentes profesionales
  - USA RANGOS REALISTAS: pescados enteros (50-80%), carnes con hueso (30-60%), verduras (5-40%)
  - ESPECIFICA el tipo de procesamiento: limpieza, desespinado, deshuesado, pelado, etc.
  - CONSIDERA: producto fresco vs. congelado vs. procesado
  - VALIDA con múltiples fuentes profesionales antes de asignar el porcentaje
  - Si no encuentras datos específicos, usa promedios de la categoría e INDICA que es estimado
  
  CRÍTICO - SINÓNIMOS LATINOAMERICANOS (name_la):
  - NO uses nombres científicos en latín (ej: "Sus scrofa domesticus", "Brassica oleracea")
  - USA SOLAMENTE sinónimos en ESPAÑOL usados en Latinoamérica
  - Ejemplos correctos:
    * Patata (España) → "papa" (Latinoamérica)
    * Judías verdes (España) → "ejotes, chauchas, vainitas" (Latinoamérica)
    * Guisantes (España) → "arvejas, chícharos" (Latinoamérica)
    * Pimiento (España) → "chile, ají, pimentón" (Latinoamérica)
    * Melocotón (España) → "durazno" (Latinoamérica)
    * Zumo (España) → "jugo" (Latinoamérica)
  - Si NO existe un sinónimo específico, coloca el mismo nombre que en España
  - INVESTIGA nombres regionales específicos de México, Argentina, Colombia, Perú, Chile, etc.
  
  IMPORTANTE: 
  - Todos los ingredientes DEBEN tener name_fr, name_it, name_pt y name_zh completados
  - ASEGÚRATE de que name_la contenga SOLO sinónimos en español, NUNCA nombres científicos
  ${category ? `- Todos los ingredientes DEBEN pertenecer a la categoría "${category}"` : ''}
  - Usa nombres reales y precisos en cada idioma
  - Para name_zh usa caracteres chinos tradicionales o simplificados apropiados
  - Las mermas DEBEN ser precisas y basadas en investigación real, no estimaciones genéricas
  - ASEGÚRATE de que NINGÚN ingrediente generado sea igual o similar a los ya existentes
  - GENERA EXACTAMENTE 6 RECETAS VARIADAS Y AUTÉNTICAS por cada ingrediente
  
  Responde SOLO con un array JSON válido de ingredientes, sin texto adicional.`;
};
