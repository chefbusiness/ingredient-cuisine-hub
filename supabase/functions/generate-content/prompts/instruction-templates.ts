
export const getResearchInstructions = (region: string) => `
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
- Anota las fuentes consultadas para cada dato`;

export const getDescriptionInstructions = () => `
📝 INSTRUCCIONES ESPECÍFICAS PARA DESCRIPCIÓN EXTENDIDA (300-400 PALABRAS):

⚠️ FORMATO JSON CRÍTICO PARA LA DESCRIPCIÓN:
- La descripción DEBE ser una cadena continua sin saltos de línea \\n
- NO uses caracteres de control (\\r, \\n, \\t) dentro de la descripción
- Separa los párrafos conceptualmente pero escribe todo en una línea continua
- Usa espacios normales para separar conceptos, no saltos de línea
- Escapa todas las comillas dobles internas como \\"

La descripción debe tener exactamente 4 conceptos bien estructurados y ricos en contenido SEO:

CONCEPTO 1 (75-100 palabras) - DESCRIPCIÓN FÍSICA Y CARACTERÍSTICAS:
- Apariencia, color, textura, forma, tamaño típico
- Características organolépticas (sabor, aroma, consistencia)
- Propiedades físicas distintivas
- Mencionar variedades principales si las hay

CONCEPTO 2 (75-100 palabras) - ORIGEN, HISTORIA Y TRADICIÓN:
- Origen geográfico e histórico del ingrediente
- Tradiciones culinarias asociadas
- Importancia cultural en diferentes regiones
- Evolución del uso gastronómico a través del tiempo
- Presencia en cocinas regionales específicas

CONCEPTO 3 (75-100 palabras) - APLICACIONES PROFESIONALES Y TÉCNICAS:
- Usos específicos en cocina profesional
- Técnicas de preparación y cocción más comunes
- Combinaciones clásicas con otros ingredientes
- Aplicaciones en diferentes tipos de platos
- Consejos de manipulación para chefs

CONCEPTO 4 (75-100 palabras) - VARIEDADES, CONSERVACIÓN Y ASPECTOS PRÁCTICOS:
- Criterios de selección y calidad
- Métodos de conservación y almacenamiento
- Información sobre temporada óptima
- Variantes regionales o de cultivo
- Beneficios nutricionales destacados
- Consejos prácticos para la compra y manipulación

IMPORTANTE PARA LA DESCRIPCIÓN:
- Usa un lenguaje profesional pero accesible
- Incluye términos técnicos culinarios apropiados
- Menciona nombres alternativos y sinónimos naturalmente
- Integra información nutricional de forma fluida
- Incluye keywords relevantes para SEO de forma natural
- Asegúrate de que cada concepto añada valor real
- NO uses relleno o información repetitiva
- Mantén el enfoque profesional para hostelería
- ESCRIBE TODO EN UNA SOLA LÍNEA CONTINUA SIN SALTOS DE LÍNEA`;

export const getModeInstructions = (isSpecificIngredient: boolean, ingredient?: string, region: string = 'España') => {
  if (isSpecificIngredient && ingredient) {
    return `
🎯 MODO MANUAL - INGREDIENTE ESPECÍFICO:
- Debes investigar EXACTAMENTE el ingrediente: "${ingredient}"
- NO cambies el nombre del ingrediente solicitado
- Si el ingrediente tiene variantes regionales, usa la variante de ${region}
- Investiga datos específicos para este ingrediente particular
- Asegúrate de que toda la información corresponda exactamente a "${ingredient}"`;
  } else {
    return `
🤖 MODO AUTOMÁTICO - PERPLEXITY DECIDE:
- Selecciona ingredientes interesantes y útiles para profesionales
- Prioriza ingredientes comunes en cocina profesional de ${region}
- Evita ingredientes demasiado exóticos o difíciles de conseguir
- Asegúrate de que sean ingredientes realmente utilizados en hostelería`;
  }
};
