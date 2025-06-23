
import { PerplexityRequest, PerplexityResponse } from './types.ts';
import { fetchWithTimeout, validateApiKey } from './utils.ts';

export class PerplexityClient {
  private apiKey: string;

  constructor() {
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    validateApiKey(apiKey);
    this.apiKey = apiKey!;
    
    console.log('🔑 Perplexity API Key configurada, longitud:', this.apiKey.length);
  }

  async generateIngredientData(prompt: string): Promise<any[]> {
    console.log('🔍 === INVESTIGACIÓN CON PERPLEXITY SONAR ===');
    
    const requestBody: PerplexityRequest = {
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        {
          role: 'system',
          content: `Eres un investigador experto en ingredientes culinarios con acceso a internet. 
          Investiga DATOS REALES y ACTUALES de fuentes confiables como:
          - Mercados mayoristas y minoristas
          - Estudios de rendimiento culinario
          - Bases de datos nutricionales oficiales
          - Publicaciones gastronómicas profesionales
          - Sitios de proveedores especializados
          
          IMPORTANTE: Siempre incluye las fuentes consultadas y verifica la información con múltiples referencias.
          Responde SOLO con JSON válido y preciso basado en investigación real de internet.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Más bajo para mayor precisión
      max_tokens: 8000,
      top_p: 0.9,
      return_images: false,
      return_related_questions: false,
      search_domain_filter: [
        'mercamadrid.es',
        'mercabarna.es',
        'fao.org',
        'usda.gov',
        'bedca.net',
        'gastronomiayvino.com',
        'profesionalhoreca.com',
        'alimentacion.es'
      ],
      search_recency_filter: 'month',
      frequency_penalty: 1,
      presence_penalty: 0
    };

    console.log('📡 Llamando a Perplexity API...');
    console.log('🎯 Modelo:', requestBody.model);
    console.log('🌐 Filtros de dominio:', requestBody.search_domain_filter?.length, 'sitios');

    const response = await fetchWithTimeout('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }, 45000); // Mayor timeout para investigación profunda

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

    // Log citations if available
    if (data.citations && data.citations.length > 0) {
      console.log('📚 Fuentes consultadas:', data.citations.length);
      data.citations.forEach((citation, index) => {
        console.log(`  ${index + 1}. ${citation}`);
      });
    }

    return this.parseContent(generatedContent);
  }

  private cleanMarkdownJson(content: string): string {
    console.log('🧹 === LIMPIEZA DE MARKDOWN ===');
    
    // Buscar bloques de JSON en markdown
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
    const matches = content.match(jsonBlockRegex);
    
    if (matches) {
      console.log('📝 Bloques de markdown encontrados, extrayendo JSON...');
      const firstMatch = matches[0];
      const cleanedContent = firstMatch.replace(/```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
      console.log('✨ Contenido limpio (primeros 200 chars):', cleanedContent.substring(0, 200));
      return cleanedContent;
    }
    
    console.log('📄 No hay bloques de markdown, usando contenido original');
    return content.trim();
  }

  private parseContent(content: string): any[] {
    console.log('🔍 === PARSEANDO CONTENIDO INVESTIGADO ===');
    
    const cleanedContent = this.cleanMarkdownJson(content);
    
    let parsedContent;
    try {
      parsedContent = JSON.parse(cleanedContent);
      console.log('✅ Contenido parseado exitosamente');
      console.log('📊 Tipo:', Array.isArray(parsedContent) ? 'Array' : typeof parsedContent);
    } catch (error) {
      console.error('❌ Error parseando JSON:', error);
      console.error('📄 Contenido original:', content);
      console.error('🧹 Contenido limpio:', cleanedContent);
      throw new Error('Respuesta de Perplexity no es JSON válido después de limpiar');
    }

    if (!Array.isArray(parsedContent)) {
      console.log('🔄 Convirtiendo a array');
      parsedContent = [parsedContent];
    }

    console.log('🎉 Contenido final parseado:', parsedContent.length, 'elementos');
    return parsedContent;
  }

  async researchPrices(ingredient: string, region: string): Promise<any> {
    console.log('💰 === INVESTIGACIÓN DE PRECIOS REALES ===');
    
    const pricePrompt = `Investiga los precios ACTUALES de mercado para "${ingredient}" en ${region}. 
    Consulta mercados mayoristas, minoristas y proveedores profesionales.
    Busca información de los últimos 30 días en sitios como Mercamadrid, Mercabarna, etc.
    
    Formato JSON requerido:
    {
      "wholesale_price": precio_mayorista_por_kg,
      "retail_price": precio_minorista_por_kg,
      "professional_price": precio_profesional_por_kg,
      "currency": "EUR",
      "last_updated": "2024-XX-XX",
      "sources": ["fuente1", "fuente2"],
      "market_trend": "estable/subida/bajada",
      "seasonal_factor": "alta/media/baja temporada"
    }`;

    const response = await this.generateIngredientData(pricePrompt);
    return response[0] || null;
  }

  async researchNutrition(ingredient: string): Promise<any> {
    console.log('🥗 === INVESTIGACIÓN NUTRICIONAL OFICIAL ===');
    
    const nutritionPrompt = `Investiga la información nutricional OFICIAL para "${ingredient}".
    Consulta bases de datos oficiales como BEDCA (España), USDA, FAO.
    
    Formato JSON requerido:
    {
      "calories_per_100g": número,
      "protein_g": número,
      "carbs_g": número,
      "fat_g": número,
      "fiber_g": número,
      "vitamin_c_mg": número,
      "iron_mg": número,
      "calcium_mg": número,
      "sodium_mg": número,
      "sources": ["BEDCA", "USDA", "etc"],
      "verified": true/false
    }`;

    const response = await this.generateIngredientData(nutritionPrompt);
    return response[0] || null;
  }
}
