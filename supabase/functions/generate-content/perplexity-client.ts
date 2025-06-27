
import { PerplexityRequest, PerplexityResponse } from './types.ts';
import { PERPLEXITY_CONFIG } from './perplexity-config.ts';
import { parseContent } from './content-parser.ts';
import { validateSources } from './source-validator.ts';

export class PerplexityClient {
  private apiKey: string;

  constructor() {
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
    
    console.log('🔑 Perplexity API Key configurada, longitud:', this.apiKey.length);
  }

  async generateContent(prompt: string): Promise<any[]> {
    console.log('🔍 === INVESTIGACIÓN CON PERPLEXITY SONAR PARA HOSTELERÍA ===');
    
    const requestBody: PerplexityRequest = {
      model: PERPLEXITY_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: `Eres un investigador experto en ingredientes culinarios para HOSTELERÍA Y RESTAURANTES con acceso a internet.

          🏢 ENFOQUE EXCLUSIVO B2B/HORECA:
          Investiga EXCLUSIVAMENTE datos para restaurantes, chefs profesionales y distribución mayorista.
          NUNCA uses precios de supermercados de consumo final (Carrefour, Mercadona, Amazon retail).
          
          🥇 JERARQUÍA DE FUENTES CRÍTICA PARA ESPAÑA:
          1. FRUTAS ELOY (frutaseloy.com) - FUENTE PRIORITARIA para frutas, verduras, hierbas, germinados
             - Analiza SIEMPRE precios por kg (no por bandeja o unidad)
             - Verifica si indica "precio por kg" o "por bandeja de X kg"
             - Convierte bandejas a kg usando información del producto
          2. MAKRO España (makro.es) - Fuente secundaria para validación
          3. Mercamadrid - Mercado central mayorista
          
          📊 FUENTES PRIORITARIAS PARA PRECIOS POR PAÍS:
          - España: Frutas Eloy → Makro → Mercamadrid → otros HORECA
          - Francia: Metro.fr → Rungis → distribuidores professionnels
          - Italia: Metro Italia → mercados mayoristas → distribuidores ristorazione
          - EEUU: Restaurant Depot → US Foods → Sysco
          - México: Distribuidores HORECA → mercados mayoristas
          - Argentina: Distribuidores gastronómicos → mercados concentradores
          
          🔍 METODOLOGÍA DE INVESTIGACIÓN OBLIGATORIA:
          1. Para ingredientes de España: busca PRIMERO en Frutas Eloy (frutaseloy.com)
          2. Verifica que el precio sea por kilogramo, NO por bandeja o unidad
          3. Si Frutas Eloy muestra "bandeja 2kg", divide precio entre 2
          4. Contrasta con Makro España como fuente secundaria
          5. Si hay discrepancia >30%, investiga más fuentes
          6. Especifica claramente "precios para restaurantes" en búsquedas
          7. Rechaza automáticamente precios retail o de envases pequeños
          
          ⚖️ VALIDACIÓN DE PRECIOS OBLIGATORIA POR CATEGORÍA:
          - Frutas tropicales (fruta de la pasión, mango): €8-25/kg
          - Frutas comunes (manzanas, peras): €2-8/kg
          - Verduras premium (espárragos, alcachofas): €3-15/kg
          - Verduras comunes (tomates, cebollas): €0.80-5/kg
          - Hierbas frescas (albahaca, cilantro): €15-50/kg
          - Flores comestibles (pensamiento, violetas): €80-200/kg
          - Germinados (alfalfa, microgreens): €20-40/kg
          - Especias comunes: €8-30/kg
          - Aceites: €2-20/litro
          
          🚨 CASOS CRÍTICOS ESPECÍFICOS:
          - Fruta de la pasión: €12-20/kg (NO €3.50/kg - error común)
          - Pimienta negra: €15-25/kg
          - Azafrán: €3000-8000/kg
          
          💡 CONTEXTO CRÍTICO:
          Un precio de €3.50/kg para fruta de la pasión es IMPOSIBLE en canal HORECA.
          El precio realista según Frutas Eloy y Makro es €14-17/kg.
          
          🔧 INSTRUCCIONES PARA JSON VÁLIDO:
          - En las descripciones, NO uses saltos de línea dentro de las cadenas de texto
          - Escapa todas las comillas dobles dentro del texto usando \"
          - NO uses caracteres de control como \\n, \\r, \\t dentro de las cadenas
          - Mantén cada descripción como una cadena continua sin saltos de línea
          - Usa espacios en lugar de tabulaciones
          
          🎯 INSTRUCCIONES ESPECÍFICAS PARA FRUTAS ELOY:
          - Busca en frutaseloy.com para TODOS los ingredientes de sus categorías
          - Verifica disponibilidad estacional
          - Analiza si el precio es por kg, bandeja, o unidad
          - Convierte correctamente a precio por kg
          - Usa como referencia principal para precios españoles
          
          Responde SOLO con JSON válido basado en investigación real de fuentes HORECA/B2B priorizando Frutas Eloy para España.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: PERPLEXITY_CONFIG.temperature,
      max_tokens: PERPLEXITY_CONFIG.max_tokens,
      top_p: PERPLEXITY_CONFIG.top_p,
      return_images: PERPLEXITY_CONFIG.return_images,
      return_related_questions: PERPLEXITY_CONFIG.return_related_questions,
      search_domain_filter: PERPLEXITY_CONFIG.search_domain_filter,
      search_recency_filter: PERPLEXITY_CONFIG.search_recency_filter,
      frequency_penalty: PERPLEXITY_CONFIG.frequency_penalty
    };

    console.log('📡 Llamando a Perplexity API con enfoque HORECA...');
    console.log('🎯 Modelo:', requestBody.model);
    console.log('🥇 Prioridad FRUTAS ELOY para España activada');
    console.log('🏢 Filtros HORECA:', requestBody.search_domain_filter?.length, 'fuentes mayoristas');

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📊 Respuesta de Perplexity:', response.status, response.statusText);

    const responseText = await response.text();
    console.log('📝 Respuesta recibida (primeros 500 chars):', responseText.substring(0, 500));

    if (!response.ok) {
      console.error('❌ Error de Perplexity API:', response.status, response.statusText);
      console.error('📄 Detalles del error:', responseText);
      
      let errorDetails = 'Error desconocido';
      try {
        const errorJson = JSON.parse(responseText);
        errorDetails = JSON.stringify(errorJson, null, 2);
      } catch (parseError) {
        errorDetails = responseText;
      }
      
      throw new Error(`Error de Perplexity API: ${response.status} ${response.statusText}. Detalles: ${errorDetails}`);
    }

    let data: PerplexityResponse;
    try {
      data = JSON.parse(responseText);
      console.log('✅ Respuesta parseada exitosamente');
      console.log('📋 Estructura:', Object.keys(data));
    } catch (parseError) {
      console.error('❌ Error parseando respuesta JSON:', parseError);
      console.error('📄 Respuesta completa:', responseText);
      throw new Error('Respuesta de Perplexity no es JSON válido');
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Estructura de respuesta inesperada:', data);
      throw new Error('Estructura de respuesta de Perplexity inesperada');
    }

    const generatedContent = data.choices[0].message.content;
    console.log('📦 Contenido generado (primeros 300 chars):', generatedContent.substring(0, 300));

    // Log citations if available para verificar fuentes HORECA
    validateSources(data.citations || []);

    return parseContent(generatedContent);
  }
}
