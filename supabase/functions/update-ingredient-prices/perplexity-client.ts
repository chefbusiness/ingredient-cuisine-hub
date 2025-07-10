
export class PerplexityClient {
  private apiKey: string;

  constructor() {
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    console.log('🔑 Verificando configuración de PERPLEXITY_API_KEY...');
    console.log('🔑 API Key existe:', !!apiKey);
    console.log('🔑 API Key longitud:', apiKey ? apiKey.length : 0);
    console.log('🔑 API Key primeros 10 chars:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
    
    if (!apiKey) {
      console.error('❌ PERPLEXITY_API_KEY no está configurada en los secrets de Edge Functions');
      throw new Error('PERPLEXITY_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  async generateContent(prompt: string): Promise<any[]> {
    console.log('🔍 === INVESTIGACIÓN MASIVA CON SONAR DEEP RESEARCH PARA HOSTELERÍA ===');
    
    // PRIMER INTENTO: Sonar Deep Research con timeout extendido para generación masiva
    try {
      return await this.tryDeepResearch(prompt);
    } catch (error) {
      console.log('🔄 Sonar Deep Research falló, intentando con modelo estándar online...');
      console.log('📄 Error Deep Research:', error.message);
      
      // FALLBACK: Usar modelo estándar online CORREGIDO
      return await this.tryStandardOnline(prompt);
    }
  }

  private async tryDeepResearch(prompt: string): Promise<any[]> {
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
          
          🚀 GENERACIÓN MASIVA OPTIMIZADA:
          - Puedes generar múltiples ingredientes por respuesta (hasta 50)
          - Mantén la calidad de datos para cada ingrediente individual
          - Estructura el JSON como array de objetos
          - Evita duplicados consultando la lista proporcionada
          
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
      max_tokens: 20000, // AUMENTADO: Para soportar múltiples ingredientes
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

    console.log('📡 Enviando consulta masiva a Sonar Deep Research (timeout: 450s)...');
    console.log('🔑 Usando API Key configurada correctamente');
    const startTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ TIMEOUT: Sonar Deep Research superó los 450 segundos');
      controller.abort();
    }, 450000); // AUMENTADO: 7.5 minutos para generación masiva

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
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`⏱️ Sonar Deep Research completado en ${elapsedTime} segundos`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error de Sonar Deep Research:', response.status, response.statusText, errorText);
        throw new Error(`Error de Sonar Deep Research: ${response.status} ${response.statusText}. Detalles: ${errorText}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      
      console.log('📦 Respuesta masiva recibida de Sonar Deep Research (longitud):', generatedContent.length);
      console.log('📦 Primeros 400 chars:', generatedContent.substring(0, 400));
      
      return this.parseContent(generatedContent);
    } catch (error) {
      clearTimeout(timeoutId);
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (error.name === 'AbortError') {
        console.log(`⏰ TIMEOUT tras ${elapsedTime}s: Sonar Deep Research superó 7.5 minutos - Muy complejo para Deep Research`);
        throw new Error('TIMEOUT_DEEP_RESEARCH: Investigación masiva demasiado compleja para Deep Research');
      }
      
      console.error('❌ Error detallado en Deep Research:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  private async tryStandardOnline(prompt: string): Promise<any[]> {
    console.log('🔄 === FALLBACK: Usando modelo estándar masivo ===');
    
    const requestBody = {
      model: 'sonar-pro', // ACTUALIZADO: modelo correcto según nueva API de Perplexity
      messages: [
        {
          role: 'system',
          content: `Eres un investigador de precios HORECA con acceso a internet en tiempo real.

          Busca precios mayoristas para restaurantes y chefs profesionales.
          Evita precios de supermercados minoristas.
          
          Consulta fuentes como:
          - Frutas Eloy (España)
          - Makro (España)
          - Restaurant Depot (EEUU)
          - Metro (Francia)
          
          Puedes generar múltiples ingredientes por respuesta manteniendo calidad.
          
          Responde SOLO con JSON válido, sin comentarios.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 15000, // AUMENTADO: Para múltiples ingredientes en fallback
      top_p: 0.9,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: 'month',
      frequency_penalty: 1.0
    };

    console.log('📡 Ejecutando consulta masiva con modelo estándar (timeout: 120s)...');
    const startTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // AUMENTADO: 2 minutos

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
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`⚡ Modelo estándar masivo completado en ${elapsedTime} segundos`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del modelo estándar:', response.status, response.statusText, errorText);
        throw new Error(`Error del modelo estándar: ${response.status} ${response.statusText}. Detalles: ${errorText}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      
      console.log('📦 Respuesta masiva recibida del modelo estándar (longitud):', generatedContent.length);
      console.log('📦 Primeros 400 chars:', generatedContent.substring(0, 400));
      
      return this.parseContent(generatedContent);
    } catch (error) {
      clearTimeout(timeoutId);
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (error.name === 'AbortError') {
        console.log(`⏰ TIMEOUT tras ${elapsedTime}s: Incluso el modelo estándar masivo falló`);
        throw new Error('TIMEOUT_ALL_MODELS: Todos los modelos de Perplexity fallaron por timeout en generación masiva');
      }
      
      console.error('❌ Error detallado en modelo estándar:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  private parseContent(content: string): any[] {
    try {
      let cleanContent = content;
      
      // Remover bloques de código markdown
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanContent = jsonMatch[1];
      }
      
      // Limpiar comentarios
      cleanContent = cleanContent.replace(/\/\/[^\n\r]*/g, '');
      cleanContent = cleanContent.replace(/\/\*[\s\S]*?\*\//g, '');
      
      const parsed = JSON.parse(cleanContent);
      const result = Array.isArray(parsed) ? parsed : [parsed];
      
      console.log('✅ Contenido masivo parseado:', result.length, 'ingredientes');
      return result;
    } catch (error) {
      console.error('❌ Error parsing JSON masivo:', error);
      console.error('📄 Contenido completo recibido (primeros 1500 chars):', content.substring(0, 1500));
      return [];
    }
  }
}
