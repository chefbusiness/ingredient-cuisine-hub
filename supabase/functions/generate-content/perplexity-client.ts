
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
          
          📊 FUENTES PRIORITARIAS PARA PRECIOS:
          - Distribuidores mayoristas HORECA: Makro, Cash&Carry, Metro
          - Mercados centrales mayoristas (Mercamadrid, Rungis, etc.)
          - Plataformas B2B profesionales (Restaurant Depot, US Foods, Sysco)
          - Distribuidores especializados por región
          - Proveedores profesionales de hostelería
          
          🔍 METODOLOGÍA DE INVESTIGACIÓN:
          1. Busca SIEMPRE en múltiples fuentes mayoristas del mismo país
          2. Especifica claramente "precios para restaurantes" en tus búsquedas
          3. Verifica que los precios sean por kg o litro (unidades profesionales)
          4. Contrasta precios entre diferentes proveedores HORECA
          5. Rechaza automáticamente precios retail o de envases pequeños
          
          ⚖️ VALIDACIÓN DE PRECIOS OBLIGATORIA:
          - Especias: €8-50/kg (pimienta negra: €15-25/kg)
          - Aceites: €2-20/litro (oliva virgen: €4-12/litro)
          - Verduras: €0.80-8/kg (tomates: €1.50-3.50/kg)
          - Hierbas: €8-40/kg (romero: €10-20/kg)
          - SI UN PRECIO ESTÁ FUERA DEL RANGO: RE-INVESTIGA en otras fuentes HORECA
          
          📋 FUENTES CONFIABLES POR PAÍS:
          - España: Makro.es, mercados centrales, distribuidores HORECA
          - Francia: Metro.fr, Rungis, distribuidores professionnels
          - Italia: Metro, mercados mayoristas, distribuidores ristorazione
          - EEUU: Restaurant Depot, US Foods, Sysco
          - México: Distribuidores HORECA, mercados mayoristas
          - Argentina: Distribuidores gastronómicos, mercados concentradores
          
          💡 CONTEXTO CRÍTICO:
          Los precios deben ser útiles para chefs que compran ingredientes profesionalmente.
          Un precio de €2.50/kg para pimienta negra es IMPOSIBLE en canal HORECA (sería retail de 40g).
          Un precio realista de pimienta negra para restaurantes es €18-22/kg en distribución mayorista.
          
          🔧 PARA JSON VÁLIDO:
          - En las descripciones, NO uses saltos de línea dentro de las cadenas de texto
          - Escapa todas las comillas dobles dentro del texto usando \"
          - NO uses caracteres de control como \\n, \\r, \\t dentro de las cadenas
          - Mantén cada descripción como una cadena continua sin saltos de línea
          - Usa espacios en lugar de tabulaciones
          
          Responde SOLO con JSON válido basado en investigación real de fuentes HORECA/B2B.`
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
    console.log('🏢 Filtros HORECA:', requestBody.search_domain_filter?.length, 'fuentes mayoristas (límite respetado)');

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
