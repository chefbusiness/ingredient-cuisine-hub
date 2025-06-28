
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
    console.log('🔍 === PERPLEXITY CLIENT EJECUTANDO ===');
    console.log('📝 Prompt recibido (primeros 200 chars):', prompt.substring(0, 200));
    
    try {
      console.log('🌐 Enviando solicitud a Perplexity API...');
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: PERPLEXITY_CONFIG.model,
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en investigación culinaria. Utiliza tu acceso a internet para buscar información real y actualizada sobre ingredientes, precios, recetas y datos nutricionales. Responde SIEMPRE en formato JSON válido.'
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
          return_related_questions: PERPLEXITY_CONFIG.return_related_questions
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Perplexity API error:', response.status, response.statusText);
        console.error('📄 Error response:', errorText);
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Perplexity API respondió exitosamente');
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('❌ Formato de respuesta inválido de Perplexity:', data);
        throw new Error('Invalid response format from Perplexity API');
      }

      const content = data.choices[0].message.content;
      console.log('📄 Contenido recibido de Perplexity (primeros 300 chars):', content.substring(0, 300));

      // Extraer y validar fuentes si están disponibles
      if (data.citations && data.citations.length > 0) {
        console.log('📚 Fuentes encontradas:', data.citations.length);
        validateSources(data.citations);
      }

      // Parsear el contenido JSON
      const parsedContent = parseContent(content);
      console.log('✅ Contenido parseado exitosamente:', parsedContent.length, 'elementos');

      return parsedContent;

    } catch (error) {
      console.error('❌ Error en PerplexityClient:', error.message);
      console.error('📊 Error stack:', error.stack?.substring(0, 300));
      throw error;
    }
  }
}
