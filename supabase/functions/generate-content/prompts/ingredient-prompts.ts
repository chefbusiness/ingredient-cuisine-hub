
import { GenerateContentParams } from '../types.ts';
import { getMermaInstructionsByCategory, getGeneralMermaInstructions } from './merma-instructions.ts';

export const generateIngredientPrompt = (params: GenerateContentParams, existingIngredients: any[] = []): string => {
  const { category, region = 'España', count = 1 } = params;
  
  const categoryInstruction = category 
    ? `Investiga y genera ${count} ingrediente(s) específicamente de la categoría "${category}" típico(s) de ${region}.`
    : `Investiga y genera ${count} ingrediente(s) típico(s) de ${region}.`;
  
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
  
  🌐 INVESTIGACIÓN WEB OBLIGATORIA - USA TU ACCESO A INTERNET:
  
  PASO 1 - BÚSQUEDA DE INFORMACIÓN REAL:
  - Consulta mercados mayoristas (Mercamadrid, Mercabarna) para PRECIOS ACTUALES
  - Busca en sitios profesionales de hostelería para DATOS DE MERMA reales
  - Consulta BEDCA, USDA, FAO para información nutricional OFICIAL
  - Revisa publicaciones gastronómicas para RECETAS AUTÉNTICAS
  - Verifica TEMPORADAS en calendarios agrícolas oficiales
  
  PASO 2 - VALIDACIÓN CRUZADA:
  - Compara datos de AL MENOS 2-3 fuentes diferentes
  - Prioriza fuentes oficiales y profesionales
  - Descarta información que parezca desactualizada
  - Anota las fuentes consultadas para cada dato
  
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
    "description": "descripción detallada basada en fuentes consultadas (150-200 palabras)",
    "temporada": "temporada principal basada en calendarios agrícolas reales",
    "origen": "región de origen verificada en fuentes históricas/geográficas",
    "merma": ${mermaInstructions},
    "rendimiento": número entre 20-95 (100 - merma, calculado automáticamente basado en la merma real investigada),
    "popularity": número entre 1-100 basado en frecuencia de uso en recetas profesionales,
    "nutritional_info": {
      "calories": número de BEDCA/USDA,
      "protein": número de fuentes oficiales,
      "carbs": número verificado,
      "fat": número oficial,
      "fiber": número de bases de datos nutricionales,
      "vitamin_c": número de fuentes científicas
    },
    "uses": ["uso culinario profesional 1", "uso culinario profesional 2", "uso culinario profesional 3"],
    "recipes": [
      {
        "name": "nombre de receta REAL investigada",
        "type": "entrante",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado real",
        "source": "fuente de la receta (chef, libro, restaurante)"
      },
      {
        "name": "nombre de receta REAL investigada",
        "type": "principal",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado real",
        "source": "fuente de la receta"
      },
      {
        "name": "nombre de receta REAL investigada",
        "type": "guarnición",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado real",
        "source": "fuente de la receta"
      },
      {
        "name": "nombre de receta REAL investigada",
        "type": "postre",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado real",
        "source": "fuente de la receta"
      },
      {
        "name": "nombre de receta REAL investigada",
        "type": "salsa",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado real",
        "source": "fuente de la receta"
      },
      {
        "name": "nombre de receta REAL especialidad regional investigada",
        "type": "especialidad",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado real",
        "source": "fuente de la receta (región específica)"
      }
    ],
    "varieties": ["variedad real 1", "variedad real 2"],
    "price_estimate": precio_por_kg_investigado_en_euros_actuales,
    "sources_consulted": ["fuente1.com", "fuente2.com", "fuente3.com"],
    "data_confidence": "alta/media/baja basada en calidad de fuentes",
    "last_researched": "2024-XX-XX"
  }
  
  🎯 CRITERIOS DE CALIDAD PARA DATOS INVESTIGADOS:
  
  PRECIOS (price_estimate):
  - Busca precios ACTUALES de los últimos 30 días
  - Consulta mercados mayoristas profesionales
  - Usa promedio de múltiples fuentes
  - Especifica si es precio mayorista, minorista o profesional
  
  MERMAS (merma):
  - INVESTIGA estudios de rendimiento culinario profesional
  - Consulta manuales de cocina profesional
  - Busca datos específicos por tipo de procesamiento
  - Valida con experiencias de chefs profesionales documentadas
  
  INFORMACIÓN NUTRICIONAL:
  - USA EXCLUSIVAMENTE bases de datos oficiales (BEDCA España, USDA, FAO)
  - Verifica valores con múltiples fuentes oficiales
  - NO uses estimaciones genéricas
  - Anota el origen de cada valor nutricional
  
  RECETAS:
  - INVESTIGA recetas REALES de chefs reconocidos
  - Busca en libros de cocina profesional
  - Consulta sitios gastronómicos de prestigio
  - Incluye especialidades regionales auténticas
  - CADA receta debe tener fuente verificable
  
  TEMPORADAS:
  - Consulta calendarios agrícolas oficiales del país/región
  - Verifica con organismos agrarios (MAPA España, etc.)
  - Considera variaciones climáticas recientes
  
  CRÍTICO - SINÓNIMOS LATINOAMERICANOS (name_la):
  - NO uses nombres científicos en latín
  - USA SOLAMENTE sinónimos en ESPAÑOL usados en Latinoamérica
  - INVESTIGA nombres regionales específicos por país
  - Ejemplos: patata→papa, judías verdes→ejotes/chauchas, etc.
  
  IMPORTANTE: 
  - TODAS las mermas DEBEN ser investigadas y precisas, no estimaciones
  - TODOS los precios deben ser actuales y reales
  - TODA la información nutricional debe ser de fuentes oficiales
  - TODAS las recetas deben ser auténticas y tener fuente
  - ASEGÚRATE de que NINGÚN ingrediente sea duplicado de los existentes
  - GENERA EXACTAMENTE 6 RECETAS REALES Y VARIADAS por cada ingrediente
  - INCLUYE las fuentes consultadas para validación posterior
  
  Responde SOLO con un array JSON válido de ingredientes investigados, sin texto adicional.`;
};
