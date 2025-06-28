
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
    console.log('🔑 Perplexity API Key configurada para Sonar Deep Research, longitud:', this.apiKey.length);
  }

  async generateContent(prompt: string): Promise<any[]> {
    console.log('🔍 === PERPLEXITY CLIENT CON SONAR DEEP RESEARCH ===');
    console.log('📝 Prompt recibido (primeros 200 chars):', prompt.substring(0, 200));
    
    // PRIMER INTENTO: Sonar Deep Research con timeout extendido
    try {
      return await this.tryDeepResearch(prompt);
    } catch (error) {
      console.log('🔄 Sonar Deep Research falló, intentando con modelo estándar online...');
      console.log('📄 Error Deep Research:', error.message);
      
      // FALLBACK: Usar modelo estándar online
      return await this.tryStandardOnline(prompt);
    }
  }

  private async tryDeepResearch(prompt: string): Promise<any[]> {
    const requestBody = {
      model: 'sonar-deep-research',
      messages: [
        {
          role: 'system',
          content: `Eres un investigador experto en ingredientes culinarios con acceso a internet en tiempo real.

          🎯 MISIÓN ESPECÍFICA:
          - Investiga ingredientes EXACTOS solicitados por el usuario
          - Si solicitan "Queso de Cabrales", genera SOLO Queso de Cabrales
          - Si solicitan "Roquefort", genera SOLO Roquefort
          - NUNCA generes ingredientes alternativos o similares

          🔍 INVESTIGACIÓN PROFUNDA:
          - Usa tu acceso a internet para buscar información real y actualizada
          - Consulta fuentes gastronómicas especializadas
          - Verifica denominaciones de origen y características específicas
          - Obtén precios actuales de distribuidores HORECA

          📊 FUENTES PRIORITARIAS:
          - España: Frutas Eloy, Makro, Mercamadrid
          - Francia: Metro.fr, Rungis
          - Italia: Metro Italia, mercados mayoristas
          - Denominaciones de origen oficiales

          Responde SIEMPRE en formato JSON válido, sin comentarios adicionales.`
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

    console.log('📡 Enviando consulta profunda a Sonar Deep Research (timeout: 300s)...');
    console.log('🔑 Usando API Key configurada correctamente');
    const startTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ TIMEOUT: Sonar Deep Research superó los 300 segundos');
      controller.abort();
    }, 300000); // 5 minutos

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
        throw new Error(`Error de Sonar Deep Research: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      
      console.log('📦 Respuesta recibida de Sonar Deep Research (primeros 300 chars):', generatedContent.substring(0, 300));

      // Extraer y validar fuentes si están disponibles
      if (data.citations && data.citations.length > 0) {
        console.log('📚 Fuentes encontradas:', data.citations.length);
        validateSources(data.citations);
      }

      return parseContent(generatedContent);
    } catch (error) {
      clearTimeout(timeoutId);
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (error.name === 'AbortError') {
        console.log(`⏰ TIMEOUT tras ${elapsedTime}s: Sonar Deep Research superó 5 minutos`);
        throw new Error('TIMEOUT_DEEP_RESEARCH: Investigación demasiado compleja para Deep Research');
      }
      
      console.error('❌ Error detallado en Sonar Deep Research:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  private async tryStandardOnline(prompt: string): Promise<any[]> {
    console.log('🔄 === FALLBACK: Usando Sonar Online Estándar ===');
    
    const requestBody = {
      model: 'sonar-online',
      messages: [
        {
          role: 'system',
          content: `Eres un investigador de ingredientes culinarios con acceso a internet.

          🎯 IMPORTANTE:
          - Genera EXACTAMENTE el ingrediente solicitado por el usuario
          - NO generes ingredientes alternativos o similares
          - Usa tu acceso a internet para buscar información real

          Responde SOLO con JSON válido, sin comentarios.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: PERPLEXITY_CONFIG.temperature,
      max_tokens: 2000,
      top_p: PERPLEXITY_CONFIG.top_p,
      return_images: PERPLEXITY_CONFIG.return_images,
      return_related_questions: PERPLEXITY_CONFIG.return_related_questions,
      search_recency_filter: PERPLEXITY_CONFIG.search_recency_filter,
      frequency_penalty: PERPLEXITY_CONFIG.frequency_penalty
    };

    console.log('📡 Ejecutando consulta con Sonar Online estándar (timeout: 60s)...');
    const startTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

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
      console.log(`⚡ Sonar Online completado en ${elapsedTime} segundos`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error de Sonar Online:', response.status, response.statusText, errorText);
        throw new Error(`Error de Sonar Online: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      
      console.log('📦 Respuesta recibida de Sonar Online (primeros 300 chars):', generatedContent.substring(0, 300));
      
      return parseContent(generatedContent);
    } catch (error) {
      clearTimeout(timeoutId);
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (error.name === 'AbortError') {
        console.log(`⏰ TIMEOUT tras ${elapsedTime}s: Incluso Sonar Online falló`);
        throw new Error('TIMEOUT_ALL_MODELS: Todos los modelos de Perplexity fallaron por timeout');
      }
      
      console.error('❌ Error detallado en Sonar Online:', error);
      throw error;
    }
  }
}
