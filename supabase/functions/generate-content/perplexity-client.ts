
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
    console.log('🔑 Perplexity API Key configurada para Sonar Pro, longitud:', this.apiKey.length);
  }

  async generateContent(prompt: string): Promise<any[]> {
    console.log('🔍 === PERPLEXITY CLIENT CON SONAR PRO ===');
    console.log('📝 Prompt recibido (primeros 200 chars):', prompt.substring(0, 200));
    
    // PRIMER INTENTO: Sonar Pro (modelo principal)
    try {
      return await this.trySonarPro(prompt);
    } catch (error) {
      console.log('🔄 Sonar Pro falló, intentando con modelo fallback...');
      console.log('📄 Error Sonar Pro:', error.message);
      
      // FALLBACK: Usar modelo LLaMA
      return await this.tryLlamaFallback(prompt);
    }
  }

  private async trySonarPro(prompt: string): Promise<any[]> {
    const requestBody = {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: `Eres un investigador experto en ingredientes culinarios con acceso a internet en tiempo real.

          🎯 MISIÓN ESPECÍFICA:
          - Investiga ingredientes EXACTOS solicitados por el usuario
          - Si solicitan "Queso de Cabrales", genera SOLO Queso de Cabrales
          - Si solicitan "Roquefort", genera SOLO Roquefort
          - NUNCA generes ingredientes alternativos o similares

          🔍 INVESTIGACIÓN WEB:
          - Usa tu acceso a internet para buscar información real y actualizada
          - Consulta fuentes gastronómicas especializadas
          - Verifica denominaciones de origen y características específicas
          - Obtén precios actuales de distribuidores HORECA

          📊 FUENTES PRIORITARIAS:
          - España: Frutas Eloy, Makro, Mercamadrid
          - Francia: Metro.fr, Rungis
          - Italia: Metro Italia, mercados mayoristas
          - Denominaciones de origen oficiales

          Responde SIEMPRE en formato JSON válido, sin comentarios adicionales.
          NO uses etiquetas <think> ni otros elementos no-JSON.`
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

    console.log('📡 Enviando consulta a Sonar Pro (timeout: 120s)...');
    console.log('🔑 Usando API Key configurada correctamente');
    const startTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ TIMEOUT: Sonar Pro superó los 120 segundos');
      controller.abort();
    }, 120000); // 2 minutos para Sonar Pro

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
      console.log(`⏱️ Sonar Pro completado en ${elapsedTime} segundos`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error de Sonar Pro:', response.status, response.statusText, errorText);
        throw new Error(`Error de Sonar Pro: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      
      console.log('📦 Respuesta recibida de Sonar Pro (primeros 300 chars):', generatedContent.substring(0, 300));

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
        console.log(`⏰ TIMEOUT tras ${elapsedTime}s: Sonar Pro superó 2 minutos`);
        throw new Error('TIMEOUT_SONAR_PRO: Investigación demasiado compleja para Sonar Pro');
      }
      
      console.error('❌ Error detallado en Sonar Pro:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  private async tryLlamaFallback(prompt: string): Promise<any[]> {
    console.log('🔄 === FALLBACK: Usando LLaMA Sonar ===');
    
    const requestBody = {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: `Eres un investigador de ingredientes culinarios con acceso a internet.

          🎯 IMPORTANTE:
          - Genera EXACTAMENTE el ingrediente solicitado por el usuario
          - NO generes ingredientes alternativos o similares
          - Usa tu acceso a internet para buscar información real

          Responde SOLO con JSON válido, sin comentarios ni etiquetas adicionales.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: PERPLEXITY_CONFIG.temperature,
      max_tokens: 2500,
      top_p: PERPLEXITY_CONFIG.top_p,
      return_images: PERPLEXITY_CONFIG.return_images,
      return_related_questions: PERPLEXITY_CONFIG.return_related_questions,
      search_recency_filter: PERPLEXITY_CONFIG.search_recency_filter,
      frequency_penalty: PERPLEXITY_CONFIG.frequency_penalty
    };

    console.log('📡 Ejecutando consulta con LLaMA Sonar (timeout: 60s)...');
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
      console.log(`⚡ LLaMA Sonar completado en ${elapsedTime} segundos`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error de LLaMA Sonar:', response.status, response.statusText, errorText);
        throw new Error(`Error de LLaMA Sonar: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      
      console.log('📦 Respuesta recibida de LLaMA Sonar (primeros 300 chars):', generatedContent.substring(0, 300));
      
      return parseContent(generatedContent);
    } catch (error) {
      clearTimeout(timeoutId);
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (error.name === 'AbortError') {
        console.log(`⏰ TIMEOUT tras ${elapsedTime}s: LLaMA Sonar también falló`);
        throw new Error('TIMEOUT_ALL_MODELS: Todos los modelos de Perplexity fallaron por timeout');
      }
      
      console.error('❌ Error detallado en LLaMA Sonar:', error);
      throw error;
    }
  }
}
