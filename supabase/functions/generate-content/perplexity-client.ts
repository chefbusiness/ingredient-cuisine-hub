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
    console.log('🔍 === INVESTIGACIÓN CON PERPLEXITY SONAR PARA HOSTELERÍA ===');
    
    const requestBody: PerplexityRequest = {
      model: 'llama-3.1-sonar-large-128k-online',
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
      temperature: 0.2, // Más determinístico para mejor precisión
      max_tokens: 8000,
      top_p: 0.9,
      return_images: false,
      return_related_questions: false,
      search_domain_filter: [
        // Distribuidores HORECA España
        'makro.es',
        'metro.es', 
        'mercamadrid.es',
        'mercabarna.es',
        
        // Distribuidores HORECA internacionales
        'metro.fr',
        'metro.it',
        'restaurantdepot.com',
        'usfoods.com',
        'sysco.com',
        
        // Fuentes profesionales y de investigación
        'fao.org',
        'usda.gov',
        'bedca.net',
        'alimentacion.es',
        'profesionalhoreca.com',
        'gastronomiayvino.com',
        
        // Mercados mayoristas
        'rungis-market.com',
        'mercatiagricoli.it',
        
        // Plataformas B2B
        'alibaba.com',
        'europages.com'
      ],
      search_recency_filter: 'month',
      frequency_penalty: 1.2 // Evitar repetición de fuentes
    };

    console.log('📡 Llamando a Perplexity API con enfoque HORECA...');
    console.log('🎯 Modelo:', requestBody.model);
    console.log('🏢 Filtros HORECA:', requestBody.search_domain_filter?.length, 'fuentes mayoristas');

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
    if (data.citations && data.citations.length > 0) {
      console.log('📚 Fuentes consultadas:', data.citations.length);
      console.log('🏢 === VERIFICACIÓN DE FUENTES HORECA ===');
      data.citations.forEach((citation, index) => {
        const isHorecaSource = this.isHorecaSource(citation);
        console.log(`  ${index + 1}. ${citation} ${isHorecaSource ? '✅ HORECA' : '⚠️  NO-HORECA'}`);
      });
    }

    return this.parseContent(generatedContent);
  }

  private isHorecaSource(citation: string): boolean {
    const horecaKeywords = [
      'makro', 'metro', 'cash', 'carry', 'restaurant', 'depot', 
      'sysco', 'foods', 'mercamadrid', 'rungis', 'horeca', 
      'mayorista', 'wholesale', 'professional', 'b2b'
    ];
    
    const retailKeywords = [
      'amazon', 'ebay', 'carrefour', 'mercadona', 'alcampo',
      'corte', 'inglés', 'lidl', 'aldi', 'dia'
    ];
    
    const citationLower = citation.toLowerCase();
    
    // Si contiene palabras de retail, no es HORECA
    if (retailKeywords.some(keyword => citationLower.includes(keyword))) {
      return false;
    }
    
    // Si contiene palabras de HORECA, sí es válido
    return horecaKeywords.some(keyword => citationLower.includes(keyword));
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

    // VALIDACIÓN DE PRECIOS HORECA
    console.log('🏢 === VALIDANDO PRECIOS HORECA ===');
    parsedContent.forEach((item, index) => {
      if (item.prices_by_country && Array.isArray(item.prices_by_country)) {
        console.log(`📊 Validando precios para: ${item.name}`);
        item.prices_by_country.forEach((priceData: any) => {
          const price = parseFloat(priceData.price);
          const category = this.guessCategory(item.name);
          const isValidPrice = this.validateHorecaPrice(price, category, item.name);
          
          console.log(`   ${priceData.country}: €${price}/${priceData.unit} ${isValidPrice ? '✅ VÁLIDO' : '❌ SOSPECHOSO'}`);
          
          if (!isValidPrice) {
            console.log(`   ⚠️  PRECIO FUERA DE RANGO HORECA para ${category}: €${price}/${priceData.unit}`);
          }
        });
      }
    });

    console.log('🎉 Contenido final parseado:', parsedContent.length, 'elementos');
    return parsedContent;
  }

  private guessCategory(ingredientName: string): string {
    const name = ingredientName.toLowerCase();
    
    if (name.includes('pimienta') || name.includes('pepper') || name.includes('especias') || name.includes('canela') || name.includes('clavo')) {
      return 'especias';
    }
    if (name.includes('aceite') || name.includes('oil') || name.includes('vinagre') || name.includes('vinegar')) {
      return 'aceites';
    }
    if (name.includes('tomate') || name.includes('cebolla') || name.includes('patata') || name.includes('verdura')) {
      return 'verduras';
    }
    if (name.includes('romero') || name.includes('tomillo') || name.includes('albahaca') || name.includes('herbs')) {
      return 'hierbas';
    }
    if (name.includes('carne') || name.includes('meat') || name.includes('pollo') || name.includes('beef')) {
      return 'carnes';
    }
    if (name.includes('harina') || name.includes('flour') || name.includes('arroz') || name.includes('rice')) {
      return 'cereales';
    }
    
    return 'general';
  }

  private validateHorecaPrice(price: number, category: string, ingredientName: string): boolean {
    const priceRanges: { [key: string]: { min: number; max: number } } = {
      'especias': { min: 8, max: 50 },
      'aceites': { min: 2, max: 20 },
      'verduras': { min: 0.8, max: 8 },
      'hierbas': { min: 8, max: 40 },
      'carnes': { min: 8, max: 60 },
      'cereales': { min: 0.5, max: 5 },
      'general': { min: 1, max: 30 }
    };

    // Casos especiales
    if (ingredientName.toLowerCase().includes('azafrán') || ingredientName.toLowerCase().includes('saffron')) {
      return price >= 3000 && price <= 8000; // Azafrán es extremadamente caro
    }

    if (ingredientName.toLowerCase().includes('pimienta') || ingredientName.toLowerCase().includes('pepper')) {
      return price >= 15 && price <= 25; // Pimienta negra rango específico
    }

    const range = priceRanges[category] || priceRanges['general'];
    return price >= range.min && price <= range.max;
  }
}
