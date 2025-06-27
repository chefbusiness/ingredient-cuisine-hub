import { PerplexityRequest, PerplexityResponse } from './types.ts';

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
    console.log('🔍 === PERPLEXITY CLIENT DEBUGGING ===');
    console.log('📝 Prompt recibido (primeros 200 chars):', prompt.substring(0, 200));
    
    // MODO DEBUGGING: Por ahora lanzar error para forzar fallback
    console.log('🔧 MODO DEBUGGING: Simulando error de Perplexity para probar fallback');
    throw new Error('Perplexity deshabilitado temporalmente para debugging');
    
    // TODO: Implementar llamada real a Perplexity cuando el debugging esté completo
  }
}
