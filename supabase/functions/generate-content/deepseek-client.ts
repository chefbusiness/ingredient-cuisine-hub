
import { DeepSeekRequest, DeepSeekResponse } from './types.ts';
import { fetchWithTimeout, validateApiKey } from './utils.ts';

export class DeepSeekClient {
  private apiKey: string;

  constructor() {
    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    validateApiKey(apiKey);
    this.apiKey = apiKey!;
    
    console.log('API Key encontrada, longitud:', this.apiKey.length, 'Primeros 10 chars:', this.apiKey.substring(0, 10) + '...');
  }

  async generateContent(prompt: string): Promise<any[]> {
    const requestBody: DeepSeekRequest = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto investigador en ingredientes culinarios, mercados gastronómicos y tendencias alimentarias. Tienes acceso a información actualizada de internet y puedes realizar investigaciones profundas. Siempre respondes con JSON válido y preciso basado en investigación real.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 6000,
    };

    console.log('=== LLAMADA A DEEPSEEK API ===');
    console.log('URL:', 'https://api.deepseek.com/chat/completions');
    console.log('Modelo:', requestBody.model);
    console.log('Max tokens:', requestBody.max_tokens);
    console.log('Temperature:', requestBody.temperature);

    const response = await fetchWithTimeout('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }, 30000);

    console.log('=== RESPUESTA DE DEEPSEEK ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Cuerpo de respuesta (primeros 500 chars):', responseText.substring(0, 500));

    if (!response.ok) {
      console.error('=== ERROR DE DEEPSEEK API ===');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      console.error('Cuerpo completo del error:', responseText);
      
      let errorDetails = 'Error desconocido';
      try {
        const errorJson = JSON.parse(responseText);
        errorDetails = JSON.stringify(errorJson, null, 2);
        console.error('Error parseado como JSON:', errorDetails);
      } catch (parseError) {
        console.error('No se pudo parsear el error como JSON:', parseError);
        errorDetails = responseText;
      }
      
      throw new Error(`Error de DeepSeek API: ${response.status} ${response.statusText}. Detalles: ${errorDetails}`);
    }

    let data: DeepSeekResponse;
    try {
      data = JSON.parse(responseText);
      console.log('Respuesta parseada exitosamente');
      console.log('Estructura de la respuesta:', Object.keys(data));
    } catch (parseError) {
      console.error('Error parseando respuesta JSON exitosa:', parseError);
      console.error('Respuesta completa:', responseText);
      throw new Error('Respuesta de DeepSeek no es JSON válido');
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Estructura de respuesta inesperada:', data);
      throw new Error('Estructura de respuesta de DeepSeek inesperada');
    }

    const generatedContent = data.choices[0].message.content;
    console.log('Contenido generado (primeros 300 chars):', generatedContent.substring(0, 300));

    return this.parseContent(generatedContent);
  }

  private parseContent(content: string): any[] {
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
      console.log('Contenido parseado exitosamente como JSON');
      console.log('Tipo de contenido:', Array.isArray(parsedContent) ? 'Array' : typeof parsedContent);
    } catch (error) {
      console.error('Error parseando JSON del contenido generado:', error);
      console.error('Contenido que falló al parsear:', content);
      throw new Error('Respuesta de DeepSeek no es JSON válido');
    }

    if (!Array.isArray(parsedContent)) {
      console.log('Convirtiendo contenido a array');
      parsedContent = [parsedContent];
    }

    return parsedContent;
  }
}
