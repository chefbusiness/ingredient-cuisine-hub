
export class PerplexityClient {
  private apiKey: string;

  constructor() {
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  async generateContent(prompt: string): Promise<any[]> {
    console.log('🔍 === INVESTIGACIÓN PROFUNDA CON SONAR DEEP RESEARCH PARA HOSTELERÍA ===');
    
    const requestBody = {
      model: 'sonar-deep-research',
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
          
          IMPORTANTE: Responde SOLO con JSON válido, sin comentarios adicionales ni texto explicativo.
          NO incluyas comentarios dentro del JSON (como // No disponible).
          
          Responde SOLO con JSON válido basado en investigación real de fuentes HORECA/B2B priorizando Frutas Eloy para España.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 4000,
      top_p: 0.9,
      return_images: false,
      return_related_questions: false,
      search_domain_filter: [
        'frutaseloy.com',
        'makro.es',
        'metro.fr',
        'restaurantdepot.com',
        'sysco.com',
        'usfoods.com',
        'mercamadrid.es'
      ],
      search_recency_filter: 'month',
      frequency_penalty: 1.0
    };

    console.log('📡 Enviando consulta profunda a Sonar Deep Research...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // Extendido a 60s para investigación profunda

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error de Sonar Deep Research:', response.status, response.statusText, errorText);
        throw new Error(`Error de Sonar Deep Research: ${response.status} ${response.statusText}. Detalles: ${errorText}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      
      console.log('📦 Respuesta recibida de Sonar Deep Research (primeros 200 chars):', generatedContent.substring(0, 200));
      
      return this.parseContent(generatedContent);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('TIMEOUT: Sonar Deep Research tardó más de 60 segundos en responder');
      }
      throw error;
    }
  }

  private parseContent(content: string): any[] {
    try {
      let cleanContent = content;
      
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanContent = jsonMatch[1];
      }
      
      cleanContent = cleanContent.replace(/\/\/[^\n\r]*/g, '');
      cleanContent = cleanContent.replace(/\/\*[\s\S]*?\*\//g, '');
      
      const parsed = JSON.parse(cleanContent);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error('❌ Error parsing JSON:', error);
      console.error('📄 Contenido completo recibido:', content);
      return [];
    }
  }
}
