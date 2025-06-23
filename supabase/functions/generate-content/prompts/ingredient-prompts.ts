
import { GenerateContentParams } from '../types.ts';
import { getMermaInstructionsByCategory, getGeneralMermaInstructions } from './merma-instructions.ts';

export const generateIngredientPrompt = (params: GenerateContentParams, existingIngredients: any[] = []): string => {
  const { category, region = 'España', count = 1, ingredient } = params;
  
  // Check if we're generating a specific ingredient (manual mode)
  const isSpecificIngredient = ingredient && ingredient.trim().length > 0;
  
  let categoryInstruction: string;
  let categoryResponse: string;
  
  if (isSpecificIngredient) {
    // MANUAL MODE: Generate specific ingredient
    categoryInstruction = `Investiga y genera información detallada específicamente para el ingrediente "${ingredient}" típico de ${region}.`;
    categoryResponse = category 
      ? `"category": "${category}",`
      : `"category": "determina la categoría apropiada para ${ingredient}",`;
  } else {
    // AUTOMATIC MODE: Let Perplexity decide
    categoryInstruction = category 
      ? `Investiga y genera ${count} ingrediente(s) específicamente de la categoría "${category}" típico(s) de ${region}.`
      : `Investiga y genera ${count} ingrediente(s) típico(s) de ${region}.`;
    categoryResponse = category 
      ? `"category": "${category}",`
      : `"category": "determina la categoría apropiada basada en el ingrediente",`;
  }

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
${isSpecificIngredient ? 
  `- Si "${ingredient}" YA EXISTE en la lista, genera los datos del ingrediente existente pero asegúrate de que sea EXACTAMENTE el mismo`
  : '- Busca ingredientes únicos y específicos que NO estén en la lista'
}
- Prioriza ingredientes menos comunes pero válidos de la región ${region}
`;
  }

  // Instrucciones específicas para modo manual vs automático
  let modeSpecificInstructions = '';
  if (isSpecificIngredient) {
    modeSpecificInstructions = `
🎯 MODO MANUAL - INGREDIENTE ESPECÍFICO:
- Debes investigar EXACTAMENTE el ingrediente: "${ingredient}"
- NO cambies el nombre del ingrediente solicitado
- Si el ingrediente tiene variantes regionales, usa la variante de ${region}
- Investiga datos específicos para este ingrediente particular
- Asegúrate de que toda la información corresponda exactamente a "${ingredient}"
`;
  } else {
    modeSpecificInstructions = `
🤖 MODO AUTOMÁTICO - PERPLEXITY DECIDE:
- Selecciona ingredientes interesantes y útiles para profesionales
- Prioriza ingredientes comunes en cocina profesional de ${region}
- Evita ingredientes demasiado exóticos o difíciles de conseguir
- Asegúrate de que sean ingredientes realmente utilizados en hostelería
`;
  }
  
  return `${categoryInstruction}
  
  ${existingIngredientsText}
  
  ${modeSpecificInstructions}
  
  🌐 INVESTIGACIÓN WEB OBLIGATORIA - USA TU ACCESO A INTERNET:
  
  PASO 1 - BÚSQUEDA DE INFORMACIÓN REAL:
  - Consulta mercados mayoristas (Mercamadrid, Mercabarna, USDA, etc.) para PRECIOS ACTUALES
  - Busca en sitios profesionales de hostelería para DATOS DE MERMA reales
  - Consulta BEDCA, USDA, FAO para información nutricional OFICIAL
  - Revisa publicaciones gastronómicas para RECETAS AUTÉNTICAS
  - Verifica TEMPORADAS en calendarios agrícolas oficiales
  
  PASO 2 - VALIDACIÓN CRUZADA:
  - Compara datos de AL MENOS 2-3 fuentes diferentes
  - Prioriza fuentes oficiales y profesionales
  - Descarta información que parezca desactualizada
  - Anota las fuentes consultadas para cada dato
  
  Para ${isSpecificIngredient ? `el ingrediente "${ingredient}"` : 'cada ingrediente'}, proporciona la siguiente información en formato JSON:
  {
    "name": "${isSpecificIngredient ? `${ingredient} (nombre en español España)` : 'nombre en español (España)'}",
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
    "prices_by_country": [
      {
        "country": "España",
        "country_code": "ES",
        "price": precio_investigado_en_euros,
        "unit": "determina_unidad_apropiada",
        "currency": "EUR",
        "market_type": "mayorista/minorista",
        "last_updated": "2024-XX-XX",
        "source": "fuente del precio"
      },
      {
        "country": "Estados Unidos", 
        "country_code": "US",
        "price": precio_investigado_en_dolares,
        "unit": "determina_unidad_apropiada",
        "currency": "USD",
        "market_type": "mayorista/minorista",
        "last_updated": "2024-XX-XX",
        "source": "fuente del precio"
      },
      {
        "country": "Francia",
        "country_code": "FR", 
        "price": precio_investigado_en_euros,
        "unit": "determina_unidad_apropiada",
        "currency": "EUR",
        "market_type": "mayorista/minorista",
        "last_updated": "2024-XX-XX",
        "source": "fuente del precio"
      },
      {
        "country": "Italia",
        "country_code": "IT",
        "price": precio_investigado_en_euros,
        "unit": "determina_unidad_apropiada", 
        "currency": "EUR",
        "market_type": "mayorista/minorista",
        "last_updated": "2024-XX-XX",
        "source": "fuente del precio"
      },
      {
        "country": "México",
        "country_code": "MX",
        "price": precio_investigado_en_pesos,
        "unit": "determina_unidad_apropiada",
        "currency": "MXN", 
        "market_type": "mayorista/minorista",
        "last_updated": "2024-XX-XX",
        "source": "fuente del precio"
      },
      {
        "country": "Argentina", 
        "country_code": "AR",
        "price": precio_investigado_en_pesos_argentinos,
        "unit": "determina_unidad_apropiada",
        "currency": "ARS",
        "market_type": "mayorista/minorista", 
        "last_updated": "2024-XX-XX",
        "source": "fuente del precio"
      }
    ],
    "sources_consulted": ["fuente1.com", "fuente2.com", "fuente3.com"],
    "data_confidence": "alta/media/baja basada en calidad de fuentes",
    "last_researched": "2024-XX-XX"
  }
  
  🎯 CRITERIOS DE CALIDAD PARA DATOS INVESTIGADOS:
  
  PRECIOS MULTICOUNTRY (prices_by_country):
  - INVESTIGA precios REALES y ACTUALES para cada país específicamente
  - Usa fuentes locales de cada país (Mercamadrid para España, USDA para USA, etc.)
  - Convierte a moneda local apropiada
  - Especifica claramente mayorista vs minorista
  - TODOS los precios deben ser de los últimos 30 días
  
  UNIDADES INTELIGENTES (unit):
  - LÍQUIDOS (aceites, vinagres, vinos, licores): SIEMPRE usar "litro" o "l"
  - SÓLIDOS (verduras, carnes, harinas, especias): usar "kg" (o "g" para especias en pequeñas cantidades)
  - INVESTIGAR cuál es la unidad de venta típica en cada país
  - Ser consistente: mismo ingrediente = misma unidad en todos los países
  
  EJEMPLOS DE UNIDADES:
  - Aceite de oliva → "litro" en todos los países
  - Vinagre balsámico → "litro" en todos los países  
  - Tomates → "kg" en todos los países
  - Azafrán → "g" en todos los países (por ser muy caro)
  - Harina → "kg" en todos los países
  
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
  - TODOS los precios deben ser actuales, reales y específicos por país
  - TODAS las unidades deben ser apropiadas (líquidos=litros, sólidos=kg)
  - TODA la información nutricional debe ser de fuentes oficiales
  - TODAS las recetas deben ser auténticas y tener fuente
  ${isSpecificIngredient ? 
    `- El ingrediente DEBE ser exactamente "${ingredient}", no un sustituto o variante` :
    '- ASEGÚRATE de que NINGÚN ingrediente sea duplicado de los existentes'
  }
  - GENERA EXACTAMENTE 6 RECETAS REALES Y VARIADAS por cada ingrediente
  - INVESTIGA Y PROPORCIONA 6 PRECIOS REALES (uno por cada país)
  - INCLUYE las fuentes consultadas para validación posterior
  
  Responde SOLO con un array JSON válido de ${isSpecificIngredient ? '1 ingrediente' : `${count} ingredientes`} investigado(s), sin texto adicional.`;
};
