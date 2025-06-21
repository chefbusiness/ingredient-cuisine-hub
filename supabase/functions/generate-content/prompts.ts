
import { GenerateContentParams } from './types.ts';

export const generatePrompt = (params: GenerateContentParams): string => {
  const { type, category, region = 'España', count = 1, ingredient } = params;
  
  switch (type) {
    case 'ingredient':
      const categoryInstruction = category 
        ? `Genera ${count} ingrediente(s) específicamente de la categoría "${category}" típico(s) de ${region}.`
        : `Genera ${count} ingrediente(s) típico(s) de ${region}.`;
      
      const categoryResponse = category 
        ? `"category": "${category}",`
        : `"category": "determina la categoría apropiada basada en el ingrediente",`;
      
      return `${categoryInstruction}
      Para cada ingrediente, proporciona la siguiente información en formato JSON:
      {
        "name": "nombre en español",
        "name_en": "nombre en inglés",
        "name_la": "nombre en latín (opcional)",
        ${categoryResponse}
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
      
      ${category ? `IMPORTANTE: Todos los ingredientes DEBEN pertenecer a la categoría "${category}".` : ''}
      Responde SOLO con un array JSON válido de ingredientes, sin texto adicional.`;
      
    case 'category':
      return `Genera ${count} nueva(s) categoría(s) de ingredientes culinarios que no sean comunes. 
      Formato JSON:
      {
        "name": "nombre en español (singular, minúsculas)",
        "name_en": "nombre en inglés",
        "description": "descripción de la categoría"
      }
      
      Responde SOLO con un array JSON válido, sin texto adicional.`;
      
    case 'market_research':
      return `Realiza una investigación profunda sobre los precios actuales de mercado de ${ingredient || category} en ${region}. 
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
      
    case 'weather_impact':
      return `Investiga el impacto del clima actual y pronósticos en la disponibilidad y precios de ${ingredient || category} en ${region}.
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
      
    case 'cultural_variants':
      return `Investiga las variaciones culturales y regionales de ${ingredient || category} en diferentes países hispanohablantes.
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
      
    case 'trend_analysis':
      return `Realiza un análisis de tendencias para ${ingredient || category} en el mercado gastronómico de ${region}.
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
      
    case 'supply_chain':
      return `Investiga la cadena de suministro de ${ingredient || category} en ${region}.
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
      
    default:
      throw new Error(`Tipo de contenido no soportado: ${type}`);
  }
};
