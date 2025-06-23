
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
          
          CRÍTICO PARA JSON VÁLIDO:
          - En las descripciones, NO uses saltos de línea dentro de las cadenas de texto
          - Escapa todas las comillas dobles dentro del texto usando \"
          - NO uses caracteres de control como \\n, \\r, \\t dentro de las cadenas
          - Mantén cada descripción como una cadena continua sin saltos de línea
          - Usa espacios en lugar de tabulaciones
          
          Responde SOLO con JSON válido y preciso basado en investigación real de internet.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
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
    console.log('🧹 === LIMPIEZA DE MARKDOWN Y SANITIZACIÓN ===');
    
    // Buscar bloques de JSON en markdown
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
    const matches = content.match(jsonBlockRegex);
    
    let cleanedContent: string;
    
    if (matches) {
      console.log('📝 Bloques de markdown encontrados, extrayendo JSON...');
      const firstMatch = matches[0];
      cleanedContent = firstMatch.replace(/```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
    } else {
      console.log('📄 No hay bloques de markdown, usando contenido original');
      cleanedContent = content.trim();
    }
    
    // SANITIZACIÓN MEJORADA PARA CARACTERES PROBLEMÁTICOS
    console.log('🧽 Aplicando sanitización avanzada...');
    
    // 1. Reemplazar saltos de línea dentro de cadenas de texto por espacios
    cleanedContent = cleanedContent.replace(/("description":\s*"[^"]*?)\n+([^"]*?")/g, '$1 $2');
    
    // 2. Limpiar caracteres de control problemáticos
    cleanedContent = cleanedContent
      .replace(/\r\n/g, ' ')  // Saltos de línea Windows
      .replace(/\n/g, ' ')    // Saltos de línea Unix
      .replace(/\r/g, ' ')    // Retorno de carro
      .replace(/\t/g, ' ')    // Tabulaciones
      .replace(/\f/g, ' ')    // Form feed
      .replace(/\v/g, ' ');   // Vertical tab
    
    // 3. Limpiar espacios múltiples
    cleanedContent = cleanedContent.replace(/\s+/g, ' ');
    
    // 4. Escapar comillas problemáticas dentro de las descripciones
    cleanedContent = cleanedContent.replace(
      /"description":\s*"([^"]*(?:\\"[^"]*)*)"/g,
      (match, description) => {
        // Escapar comillas internas que no estén ya escapadas
        const escapedDescription = description.replace(/(?<!\\)"/g, '\\"');
        return `"description": "${escapedDescription}"`;
      }
    );
    
    // 5. Validar que las llaves estén balanceadas
    const openBraces = (cleanedContent.match(/\{/g) || []).length;
    const closeBraces = (cleanedContent.match(/\}/g) || []).length;
    const openBrackets = (cleanedContent.match(/\[/g) || []).length;
    const closeBrackets = (cleanedContent.match(/\]/g) || []).length;
    
    console.log('🔍 Validación de estructura JSON:');
    console.log(`   Llaves abiertas: ${openBraces}, cerradas: ${closeBraces}`);
    console.log(`   Corchetes abiertos: ${openBrackets}, cerrados: ${closeBrackets}`);
    
    if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
      console.log('⚠️ Estructura JSON posiblemente desbalanceada');
    }
    
    console.log('✨ Contenido limpio (primeros 200 chars):', cleanedContent.substring(0, 200));
    return cleanedContent;
  }

  private parseContent(content: string): any[] {
    console.log('🔍 === PARSEANDO CONTENIDO INVESTIGADO ===');
    
    const cleanedContent = this.cleanMarkdownJson(content);
    
    let parsedContent;
    try {
      // Validación previa al parsing
      if (!cleanedContent.trim().startsWith('[') && !cleanedContent.trim().startsWith('{')) {
        console.log('⚠️ Contenido no parece ser JSON válido, intentando extraer...');
        // Intentar encontrar JSON válido dentro del contenido
        const jsonMatch = cleanedContent.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
        if (jsonMatch) {
          const extractedJson = jsonMatch[1];
          console.log('🔧 JSON extraído:', extractedJson.substring(0, 100) + '...');
          parsedContent = JSON.parse(extractedJson);
        } else {
          throw new Error('No se pudo encontrar JSON válido en el contenido');
        }
      } else {
        parsedContent = JSON.parse(cleanedContent);
      }
      
      console.log('✅ Contenido parseado exitosamente');
      console.log('📊 Tipo:', Array.isArray(parsedContent) ? 'Array' : typeof parsedContent);
    } catch (error) {
      console.error('❌ Error parseando JSON:', error);
      console.error('📄 Contenido original:', content.substring(0, 500));
      console.error('🧹 Contenido limpio:', cleanedContent.substring(0, 500));
      console.error('🔍 Detalle del error:', error.message);
      
      // Intentar recuperación adicional
      try {
        // Remover caracteres problemáticos más agresivamente
        const ultraCleanContent = cleanedContent
          .replace(/[\x00-\x1F\x7F]/g, ' ')  // Remover todos los caracteres de control
          .replace(/\\n/g, ' ')              // Remover secuencias de escape literales
          .replace(/\\r/g, ' ')
          .replace(/\\t/g, ' ')
          .replace(/\s+/g, ' ')              // Consolidar espacios
          .trim();
        
        console.log('🚑 Intentando recuperación con limpieza ultra...');
        parsedContent = JSON.parse(ultraCleanContent);
        console.log('🎉 Recuperación exitosa!');
      } catch (recoveryError) {
        throw new Error('Respuesta de Perplexity no es JSON válido después de limpiar y intentar recuperación');
      }
    }

    if (!Array.isArray(parsedContent)) {
      console.log('🔄 Convirtiendo a array');
      parsedContent = [parsedContent];
    }

    console.log('🎉 Contenido final parseado:', parsedContent.length, 'elementos');
    return parsedContent;
  }
}
