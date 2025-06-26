
export const getQualityCriteria = (isSpecificIngredient: boolean, ingredient?: string, count: number = 1) => `
🎯 CRITERIOS DE CALIDAD PARA DATOS INVESTIGADOS:

DESCRIPCIÓN EXTENDIDA Y SEO OPTIMIZADA:
- DEBE tener entre 700-800 palabras para optimización SEO
- USA marcadores ###SECCION1###, ###SECCION2###, etc. para estructurar
- COMPLETA TODAS LAS 5 SECCIONES sin cortar abruptamente
- Cada sección debe tener 140-160 palabras aproximadamente
- Si el ingrediente es complejo o importante, extiende hasta 800 palabras
- NO dejes ninguna sección incompleta o cortada
- El contenido debe ser rico, detallado y técnicamente preciso

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
- LA DESCRIPCIÓN debe tener EXACTAMENTE 700-800 palabras en 5 secciones estructuradas
- USA los marcadores ###SECCIONX### para estructurar correctamente
- NO CORTES LA DESCRIPCIÓN ABRUPTAMENTE, completa todas las secciones
${isSpecificIngredient ? 
  `- El ingrediente DEBE ser exactamente "${ingredient}", no un sustituto o variante` :
  '- ASEGÚRATE de que NINGÚN ingrediente sea duplicado de los existentes'
}
- GENERA EXACTAMENTE 6 RECETAS REALES Y VARIADAS por cada ingrediente
- INVESTIGA Y PROPORCIONA 6 PRECIOS REALES (uno por cada país)
- INCLUYE las fuentes consultadas para validación posterior

Responde SOLO con un array JSON válido de ${isSpecificIngredient ? '1 ingrediente' : `${count} ingredientes`} investigado(s), sin texto adicional.`;
