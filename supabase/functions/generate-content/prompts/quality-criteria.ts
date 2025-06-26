
export const getQualityCriteria = (isSpecificIngredient: boolean, ingredient?: string, count: number = 1) => `
🎯 CRITERIOS DE CALIDAD PARA DATOS INVESTIGADOS:

⚠️ VERIFICACIÓN HISTÓRICA OBLIGATORIA:
- VERIFICA orígenes geográficos con fuentes académicas (National Geographic, Smithsonian, universidades)
- TOMATE: Origen AMERICANO (México/Perú), NO mediterráneo - Llegó a Europa s. XVI
- PATATA: Origen ANDINO (Perú/Bolivia), NO europeo - Introducida en Europa s. XVI
- MAÍZ: Origen MESOAMERICANO (México), NO del Viejo Mundo
- RECHAZA información histórica sin verificación académica sólida
- CONSULTA múltiples fuentes históricas antes de afirmar cualquier origen

🚫 DESCRIPCIÓN - PROHIBIDO USAR MARCADORES:
- ABSOLUTAMENTE PROHIBIDO usar ###SECCION1###, ###SECCION2###, etc.
- ABSOLUTAMENTE PROHIBIDO usar marcadores de markdown (###, ##, #)
- ABSOLUTAMENTE PROHIBIDO usar **SECCION**, *SECCION*, ---SECCION---
- ABSOLUTAMENTE PROHIBIDO dividir en secciones numeradas
- ABSOLUTAMENTE PROHIBIDO usar cualquier tipo de marcador visual

✅ DESCRIPCIÓN CORRECTA - TEXTO CONTINUO:
- DEBE ser un texto completamente continuo de 400-500 palabras
- SIN INTERRUPCIONES ni marcadores de ningún tipo
- Información organizada pero en formato de párrafo corrido
- Transiciones naturales entre temas usando conectores
- Ejemplo: "Desde el punto de vista científico... Históricamente... En cuanto a sus propiedades... En gastronomía profesional... Para su conservación..."

ESTRUCTURA DEL CONTENIDO (SIN MARCADORES VISIBLES):
1. Definición científica y características básicas
2. Origen geográfico e histórico verificado
3. Propiedades organolépticas y físico-químicas
4. Aplicaciones en gastronomía profesional
5. Criterios de calidad y conservación

LONGITUD OBJETIVO:
- Mínimo: 400 palabras
- Óptimo: 450-500 palabras
- Máximo: 500 palabras

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

${isSpecificIngredient ? 
  `- El ingrediente DEBE ser exactamente "${ingredient}", no un sustituto o variante
  - VERIFICA el origen histórico real de "${ingredient}" con fuentes académicas` :
  '- ASEGÚRATE de que NINGÚN ingrediente sea duplicado de los existentes'
}
- GENERA EXACTAMENTE 6 RECETAS REALES Y VARIADAS por cada ingrediente
- INVESTIGA Y PROPORCIONA 6 PRECIOS REALES (uno por cada país)
- INCLUYE las fuentes consultadas para validación posterior
- VERIFICA RIGUROSAMENTE cualquier dato histórico antes de incluirlo

Responde SOLO con un array JSON válido de ${isSpecificIngredient ? '1 ingrediente' : `${count} ingredientes`} investigado(s), sin texto adicional.

RECORDATORIO FINAL: LA DESCRIPCIÓN DEBE SER TEXTO CONTINUO SIN MARCADORES Y TODOS LOS DATOS HISTÓRICOS DEBEN ESTAR VERIFICADOS. PROHIBIDO USAR CUALQUIER TIPO DE MARCADOR EN LA DESCRIPCIÓN.`;
