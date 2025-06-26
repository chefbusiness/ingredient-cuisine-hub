
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

🔥 PRECIOS MULTICOUNTRY - CRÍTICO PARA HOSTELERÍA Y RESTAURANTES (prices_by_country):
- EXCLUSIVAMENTE PRECIOS B2B PARA RESTAURANTES Y HOSTELERÍA
- NUNCA usar precios de supermercados o retail de consumo final
- OBLIGATORIO: Investigar en distribuidores mayoristas profesionales
- OBLIGATORIO: Especificar que son "precios para restaurantes y profesionales de la hostelería"
- FUENTES VÁLIDAS: Makro, Cash&Carry, distribuidores HORECA, mercados centrales
- RECHAZAR cualquier precio de Carrefour, Mercadona, Amazon retail, eBay
- VALIDAR coherencia: Especias finas €15-50/kg, aceites €3-15/litro, verduras €1-8/kg

RANGOS DE VALIDACIÓN OBLIGATORIOS POR CATEGORÍA:
- Especias y condimentos: €8-50/kg (pimienta negra: €15-25/kg, azafrán: €3000-8000/kg)
- Aceites y vinagres: €2-20/litro (oliva virgen extra: €4-12/litro)
- Verduras y hortalizas: €0.80-8/kg (tomates: €1.50-3/kg)
- Hierbas aromáticas: €10-40/kg (romero fresco: €8-15/kg)
- Carnes y pescados: €8-60/kg (según tipo y calidad)
- Lácteos: €2-15/litro o kg (según producto)
- Harinas y cereales: €0.50-5/kg (harina panadera: €0.80-2/kg)

PROCESO DE INVESTIGACIÓN DE PRECIOS:
1. BUSCAR EXCLUSIVAMENTE en proveedores B2B y mayoristas HORECA
2. VERIFICAR que el precio corresponde a la unidad correcta (kg o litro)
3. COMPROBAR que son precios actuales (últimos 30 días)
4. CONTRASTAR con al menos 2 fuentes diferentes del mismo país
5. APLICAR sentido común: Si parece demasiado barato o caro, RE-INVESTIGAR

FUENTES PRIORITARIAS POR PAÍS:
- España: Makro.es, mercados centrales, distribuidores HORECA profesionales
- Francia: Metro.fr, Rungis, distribuidores profesionales
- Italia: Metro Italia, mercados mayoristas, distribuidores ristorazione
- Estados Unidos: Restaurant Depot, US Foods, Sysco (precios mayoristas)
- México: Distribuidores HORECA mexicanos, mercados mayoristas
- Argentina: Distribuidores gastronómicos, mercados concentradores

UNIDADES INTELIGENTES (unit):
- LÍQUIDOS (aceites, vinagres, vinos, licores): SIEMPRE usar "litro" o "l"
- SÓLIDOS (verduras, carnes, harinas, especias): usar "kg" (o "g" para especias muy caras)
- INVESTIGAR cuál es la unidad de venta típica en distribución HORECA
- Ser consistente: mismo ingrediente = misma unidad en todos los países

EJEMPLOS DE PRECIOS CORRECTOS PARA HOSTELERÍA:
- Pimienta negra molida → €18-22/kg (NO €2.50/kg que sería retail de 40g)
- Aceite oliva virgen extra → €6-10/litro (canal HORECA)
- Tomates pera → €2-3.50/kg (mercado mayorista)
- Azafrán en hebra → €4000-7000/kg (distribución profesional)

❌ RECHAZAR AUTOMÁTICAMENTE:
- Precios de Amazon, eBay, supermercados de consumo
- Precios por unidades pequeñas (frascos de 40g, botellas de 250ml)
- Precios que no especifiquen el canal de venta
- Precios obviamente de retail convertidos a kg sin ajuste

MERMAS (merma):
- INVESTIGA estudios de rendimiento culinario profesional
- Consulta manuales de cocina profesional y estudios HORECA
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
  - VERIFICA el origen histórico real de "${ingredient}" con fuentes académicas
  - INVESTIGA precios HORECA específicos para "${ingredient}" en cada país` :
  '- ASEGÚRATE de que NINGÚN ingrediente sea duplicado de los existentes'
}
- GENERA EXACTAMENTE 6 RECETAS REALES Y VARIADAS por cada ingrediente
- INVESTIGA Y PROPORCIONA 6 PRECIOS REALES B2B/HORECA (uno por cada país)
- INCLUYE las fuentes consultadas para validación posterior
- VERIFICA RIGUROSAMENTE cualquier dato histórico antes de incluirlo

Responde SOLO con un array JSON válido de ${isSpecificIngredient ? '1 ingrediente' : `${count} ingredientes`} investigado(s), sin texto adicional.

RECORDATORIO FINAL: LA DESCRIPCIÓN DEBE SER TEXTO CONTINUO SIN MARCADORES, TODOS LOS DATOS HISTÓRICOS DEBEN ESTAR VERIFICADOS, Y LOS PRECIOS DEBEN SER EXCLUSIVAMENTE PARA RESTAURANTES Y HOSTELERÍA (B2B/MAYORISTA).
`;
