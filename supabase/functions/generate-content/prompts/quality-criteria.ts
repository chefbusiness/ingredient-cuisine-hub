
export const getQualityCriteria = (isSpecificIngredient: boolean, ingredient?: string, count: number = 1) => `
🎯 CRITERIOS DE CALIDAD PARA DATOS INVESTIGADOS:

DESCRIPCIÓN EXTENDIDA Y SEO OPTIMIZADA:
- DEBE tener EXACTAMENTE entre 700-800 palabras para optimización SEO
- USA ÚNICAMENTE estos marcadores: ###SECCION1###, ###SECCION2###, ###SECCION3###, ###SECCION4###, ###SECCION5###
- COMPLETA TODAS LAS 5 SECCIONES OBLIGATORIAMENTE - NO PUEDES PARAR HASTA COMPLETAR LA SECCIÓN 5
- Cada sección debe tener 140-160 palabras aproximadamente
- NUNCA CORTES EL TEXTO ABRUPTAMENTE - DEBES COMPLETAR TODAS LAS SECCIONES
- Si alcanzas límite de tokens, PRIORIZA completar la descripción antes que otros campos
- NO dejes ninguna sección incompleta o cortada
- El contenido debe ser rico, detallado y técnicamente preciso
- OBJETIVO: 700-800 palabras distribuidas en 5 secciones completas

ESTRUCTURA OBLIGATORIA DE LAS 5 SECCIONES:
1. ###SECCION1### - Definición y Características Científicas (140-160 palabras)
2. ###SECCION2### - Origen Geográfico y Contexto Histórico-Cultural (140-160 palabras)
3. ###SECCION3### - Análisis Organoléptico y Propiedades Físico-Químicas (140-160 palabras)
4. ###SECCION4### - Aplicaciones Técnicas en Gastronomía Profesional (140-160 palabras)
5. ###SECCION5### - Criterios de Calidad, Conservación y Uso Profesional (140-160 palabras)

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

IMPORTANTE - DESCRIPCIÓN COMPLETA:
- PRIORIDAD MÁXIMA: COMPLETAR LAS 5 SECCIONES DE LA DESCRIPCIÓN
- Si hay límite de tokens, reduce otros campos pero NUNCA la descripción
- La descripción DEBE alcanzar 700-800 palabras completas
- NUNCA termines una descripción a medias
- CADA SECCIÓN debe estar completa antes de continuar con la siguiente
- USA los marcadores exactos: ###SECCION1###, ###SECCION2###, ###SECCION3###, ###SECCION4###, ###SECCION5###

${isSpecificIngredient ? 
  `- El ingrediente DEBE ser exactamente "${ingredient}", no un sustituto o variante` :
  '- ASEGÚRATE de que NINGÚN ingrediente sea duplicado de los existentes'
}
- GENERA EXACTAMENTE 6 RECETAS REALES Y VARIADAS por cada ingrediente
- INVESTIGA Y PROPORCIONA 6 PRECIOS REALES (uno por cada país)
- INCLUYE las fuentes consultadas para validación posterior

Responde SOLO con un array JSON válido de ${isSpecificIngredient ? '1 ingrediente' : `${count} ingredientes`} investigado(s), sin texto adicional.

RECORDATORIO FINAL: LA DESCRIPCIÓN DEBE TENER 5 SECCIONES COMPLETAS CON 700-800 PALABRAS TOTALES. NO PUEDES ENTREGAR CONTENIDO INCOMPLETO.`;
