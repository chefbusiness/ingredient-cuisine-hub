
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
- Revisa publicaciones gastronómicas para RECETAS AUTÉNTICAS que usen este ingrediente
- Verifica TEMPORADAS en calendarios agrícolas oficiales
- CONFIRMA orígenes históricos en fuentes académicas (National Geographic, Smithsonian, universidades)

PASO 2 - VALIDACIÓN CRUZADA:
- Compara datos de AL MENOS 2-3 fuentes diferentes
- Prioriza fuentes oficiales y profesionales
- Descarta información que parezca desactualizada
- Anota las fuentes consultadas para cada dato
- RECHAZA información histórica sin verificación académica`;

export const getDescriptionInstructions = () => `
🖋️ INSTRUCCIONES DE DESCRIPCIÓN - TEXTO CONTINUO SIN MARCADORES:

⚠️ CRÍTICO - NO USES MARCADORES DE SECCIÓN:
- NO incluyas ###SECCION1###, ###SECCION2###, etc.
- NO uses marcadores de markdown
- NO dividas en secciones numeradas
- Escribe un texto CONTINUO y FLUIDO

FORMATO REQUERIDO:
- Un párrafo largo y continuo de 400-500 palabras
- Texto natural sin divisiones artificiales
- Información organizada pero SIN marcadores visibles
- Flujo narrativo coherente y profesional

CONTENIDO A INCLUIR (en texto continuo):
- Definición científica y características DEL INGREDIENTE
- Origen geográfico e histórico verificado DEL INGREDIENTE
- Propiedades organolépticas y físico-químicas DEL INGREDIENTE
- Aplicaciones en gastronomía profesional USANDO este ingrediente
- Criterios de calidad y conservación DEL INGREDIENTE

EJEMPLO DE FORMATO CORRECTO:
"El tomate (Solanum lycopersicum) es una fruta originaria de América, específicamente de las regiones de México y Perú, donde fue domesticada hace miles de años. Esta planta de la familia Solanaceae se caracteriza por su contenido en licopeno, un antioxidante que le confiere su característico color rojo. En gastronomía profesional, el tomate es fundamental para la elaboración de salsas, conservas y platos frescos. Su versatilidad permite múltiples preparaciones, desde crudos en ensaladas hasta cocidos en guisos complejos..."

RECUERDA:
- Texto corrido sin interrupciones sobre EL INGREDIENTE
- Sin marcadores ni divisiones
- Información completa pero fluida sobre EL INGREDIENTE
- Lenguaje profesional pero accesible`;

export const getModeInstructions = (isSpecificIngredient: boolean, ingredient?: string, region: string = 'España') => {
  if (isSpecificIngredient && ingredient) {
    return `
🎯 MODO MANUAL - FICHA TÉCNICA DE INGREDIENTE ESPECÍFICO:
- Debes investigar EXACTAMENTE el ingrediente: "${ingredient}"
- NO cambies el nombre del ingrediente solicitado
- Si el ingrediente tiene variantes regionales, usa la variante de ${region}
- Investiga datos específicos para este ingrediente particular
- Asegúrate de que toda la información corresponda exactamente a "${ingredient}"
- VERIFICA el origen histórico del ingrediente con fuentes académicas
- IMPORTANTE: NO uses marcadores de sección en la descripción
- CRÍTICO: Genera información DEL ingrediente "${ingredient}", NO recetas que lo contengan`;
  } else {
    return `
🤖 MODO AUTOMÁTICO - PERPLEXITY DECIDE:
- Selecciona ingredientes interesantes y útiles para profesionales
- Prioriza ingredientes comunes en cocina profesional de ${region}
- Evita ingredientes demasiado exóticos o difíciles de conseguir
- Asegúrate de que sean ingredientes realmente utilizados en hostelería
- VERIFICA orígenes históricos antes de incluir información
- IMPORTANTE: NO uses marcadores de sección en la descripción
- CRÍTICO: Genera información DE cada ingrediente, NO recetas que los contengan`;
  }
};
