
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Función helper para crear timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, category, region = 'España', count = 1, ingredient, search_query } = await req.json();
    
    console.log('=== INICIO DE REQUEST ===');
    console.log('Parámetros recibidos:', { type, category, region, count, ingredient, search_query });
    
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

    // Validación detallada de la API key
    if (!deepseekApiKey) {
      console.error('ERROR: DEEPSEEK_API_KEY no está configurada en las variables de entorno');
      throw new Error('DEEPSEEK_API_KEY no configurada');
    }

    if (deepseekApiKey.length < 10) {
      console.error('ERROR: DEEPSEEK_API_KEY parece ser inválida (muy corta):', deepseekApiKey.substring(0, 5) + '...');
      throw new Error('DEEPSEEK_API_KEY parece ser inválida');
    }

    console.log('API Key encontrada, longitud:', deepseekApiKey.length, 'Primeros 10 chars:', deepseekApiKey.substring(0, 10) + '...');

    let prompt = '';
    
    switch (type) {
      case 'ingredient':
        prompt = `Genera ${count} ingrediente(s) ${category ? `de la categoría ${category}` : ''} típico(s) de ${region}. 
        Para cada ingrediente, proporciona la siguiente información en formato JSON:
        {
          "name": "nombre en español",
          "name_en": "nombre en inglés",
          "name_la": "nombre en latín (opcional)",
          "description": "descripción detallada (150-200 palabras)",
          "temporada": "temporada principal (ej: primavera, verano, otoño, invierno, todo el año)",
          "origen": "región de origen",
          "merma": número entre 5-30 (porcentaje de merma típico),
          "rendimiento": número entre 70-95 (porcentaje de rendimiento),
          "popularity": número entre 1-100,
          "nutritional_info": {
            "calories": número,
            "protein": número,
            "carbs": número,
            "fat": número,
            "fiber": número,
            "vitamin_c": número
          },
          "uses": ["uso culinario 1", "uso culinario 2", "uso culinario 3"],
          "recipes": [
            {
              "name": "nombre de receta",
              "type": "tipo (entrante, principal, postre, etc)",
              "difficulty": "fácil/medio/difícil",
              "time": "tiempo estimado"
            }
          ],
          "varieties": ["variedad 1", "variedad 2"],
          "price_estimate": número (precio estimado por kg en euros)
        }
        
        Responde SOLO con un array JSON válido de ingredientes, sin texto adicional.`;
        break;
        
      case 'category':
        prompt = `Genera ${count} nueva(s) categoría(s) de ingredientes culinarios que no sean comunes. 
        Formato JSON:
        {
          "name": "nombre en español (singular, minúsculas)",
          "name_en": "nombre en inglés",
          "description": "descripción de la categoría"
        }
        
        Responde SOLO con un array JSON válido, sin texto adicional.`;
        break;
        
      case 'market_research':
        prompt = `Realiza una investigación profunda sobre los precios actuales de mercado de ${ingredient || category} en ${region}. 
        Busca información de:
        - Mercados mayoristas locales
        - Precios de temporada actual
        - Factores que afectan el precio (clima, demanda, etc.)
        - Variaciones por región dentro del país
        - Tendencias de los últimos 3-6 meses
        
        Formato JSON:
        {
          "ingredient_name": "nombre del ingrediente",
          "region": "región investigada",
          "current_price": número (precio actual por kg en euros),
          "price_range": "rango de precios (ej: 2.5-4.0)",
          "seasonal_trend": "tendencia estacional actual",
          "market_factors": ["factor 1", "factor 2", "factor 3"],
          "price_history": "resumen de tendencia últimos meses",
          "regional_variations": ["región: precio", "región: precio"],
          "forecast": "pronóstico de precios próximos meses",
          "last_updated": "fecha de la información"
        }
        
        Responde SOLO con un array JSON válido, sin texto adicional.`;
        break;
        
      case 'weather_impact':
        prompt = `Investiga el impacto del clima actual y pronósticos en la disponibilidad y precios de ${ingredient || category} en ${region}.
        Busca información sobre:
        - Condiciones climáticas actuales en las zonas de cultivo
        - Pronósticos estacionales
        - Eventos climáticos recientes (sequías, heladas, lluvias excesivas)
        - Cómo estos factores afectan la oferta y demanda
        - Comparación con años anteriores
        
        Formato JSON:
        {
          "ingredient_name": "nombre del ingrediente",
          "region": "región analizada",
          "current_weather": "condiciones climáticas actuales",
          "seasonal_forecast": "pronóstico estacional",
          "weather_events": ["evento reciente 1", "evento reciente 2"],
          "supply_impact": "impacto en la oferta (bajo/medio/alto)",
          "price_impact": "impacto esperado en precios",
          "availability_status": "disponibilidad actual",
          "seasonal_comparison": "comparación con temporadas anteriores",
          "recommendations": ["recomendación 1", "recomendación 2"]
        }
        
        Responde SOLO con un array JSON válido, sin texto adicional.`;
        break;
        
      case 'cultural_variants':
        prompt = `Investiga las variaciones culturales y regionales de ${ingredient || category} en diferentes países hispanohablantes.
        Busca información sobre:
        - Nombres regionales y locales del ingrediente
        - Usos culinarios tradicionales por país/región
        - Preparaciones específicas de cada cultura
        - Variaciones en la forma de consumo
        - Significado cultural o ceremonial
        - Diferencias en temporadas por región
        
        Formato JSON:
        {
          "ingredient_name": "nombre base del ingrediente",
          "cultural_variants": [
            {
              "country": "país",
              "local_names": ["nombre local 1", "nombre local 2"],
              "traditional_uses": ["uso 1", "uso 2"],
              "typical_preparations": ["preparación 1", "preparación 2"],
              "cultural_significance": "significado cultural",
              "seasonal_pattern": "patrón estacional en esta región"
            }
          ],
          "common_variations": ["variación común 1", "variación común 2"],
          "regional_preferences": "preferencias por región"
        }
        
        Responde SOLO con un array JSON válido, sin texto adicional.`;
        break;
        
      case 'trend_analysis':
        prompt = `Realiza un análisis de tendencias para ${ingredient || category} en el mercado gastronómico de ${region}.
        Investiga:
        - Tendencias de consumo actuales
        - Popularidad en redes sociales y medios
        - Uso en restaurantes y gastronomía moderna
        - Demanda en el mercado retail
        - Innovaciones en el uso del ingrediente
        - Proyecciones futuras
        
        Formato JSON:
        {
          "ingredient_name": "nombre del ingrediente",
          "trend_status": "en alza/estable/en declive",
          "popularity_score": número del 1-100,
          "social_media_mentions": "frecuencia de menciones",
          "restaurant_usage": "uso en restaurantes",
          "retail_demand": "demanda en retail",
          "innovation_uses": ["uso innovador 1", "uso innovador 2"],
          "market_drivers": ["factor impulsor 1", "factor impulsor 2"],
          "future_outlook": "perspectiva futura",
          "target_demographics": ["demográfico 1", "demográfico 2"]
        }
        
        Responde SOLO con un array JSON válido, sin texto adicional.`;
        break;
        
      case 'supply_chain':
        prompt = `Investiga la cadena de suministro de ${ingredient || category} en ${region}.
        Busca información sobre:
        - Principales productores y regiones de cultivo
        - Canales de distribución
        - Estacionalidad de la oferta
        - Intermediarios y márgenes
        - Desafíos logísticos
        - Sostenibilidad y prácticas ambientales
        
        Formato JSON:
        {
          "ingredient_name": "nombre del ingrediente",
          "main_producers": ["productor/región 1", "productor/región 2"],
          "distribution_channels": ["canal 1", "canal 2"],
          "supply_seasonality": "patrón estacional de oferta",
          "intermediary_levels": número de intermediarios típicos,
          "profit_margins": "estructura de márgenes",
          "logistic_challenges": ["desafío 1", "desafío 2"],
          "sustainability_practices": ["práctica 1", "práctica 2"],
          "supply_reliability": "confiabilidad de suministro (alta/media/baja)",
          "quality_standards": ["estándar 1", "estándar 2"]
        }
        
        Responde SOLO con un array JSON válido, sin texto adicional.`;
        break;
    }

    console.log('Prompt generado, longitud:', prompt.length);
    console.log('Primeros 200 caracteres del prompt:', prompt.substring(0, 200) + '...');

    const requestBody = {
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
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }, 30000);

    console.log('=== RESPUESTA DE DEEPSEEK ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    // Leer el cuerpo de la respuesta como texto primero
    const responseText = await response.text();
    console.log('Cuerpo de respuesta (primeros 500 chars):', responseText.substring(0, 500));

    if (!response.ok) {
      console.error('=== ERROR DE DEEPSEEK API ===');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      console.error('Cuerpo completo del error:', responseText);
      
      // Intentar parsear el error como JSON
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

    // Parsear la respuesta exitosa
    let data;
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

    // Parsear y validar JSON del contenido generado
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
      console.log('Contenido parseado exitosamente como JSON');
      console.log('Tipo de contenido:', Array.isArray(parsedContent) ? 'Array' : typeof parsedContent);
    } catch (error) {
      console.error('Error parseando JSON del contenido generado:', error);
      console.error('Contenido que falló al parsear:', generatedContent);
      throw new Error('Respuesta de DeepSeek no es JSON válido');
    }

    // Asegurar que sea un array
    if (!Array.isArray(parsedContent)) {
      console.log('Convirtiendo contenido a array');
      parsedContent = [parsedContent];
    }

    console.log('=== RESPUESTA EXITOSA ===');
    console.log('Número de elementos generados:', parsedContent.length);

    return new Response(JSON.stringify({ 
      success: true, 
      data: parsedContent,
      type: type 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== ERROR GENERAL ===');
    console.error('Tipo de error:', error.constructor.name);
    console.error('Mensaje:', error.message);
    console.error('Stack trace:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      errorType: error.constructor.name
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
