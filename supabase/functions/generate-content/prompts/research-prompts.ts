
export const generateMarketResearchPrompt = (params: { ingredient?: string; category?: string; region: string }): string => {
  const { ingredient, category, region } = params;
  
  return `Realiza una investigación profunda sobre los precios actuales de mercado HORECA de ${ingredient || category} en ${region}. 
  
  🏢 ENFOQUE EXCLUSIVO HOSTELERÍA Y RESTAURANTES:
  - SOLO precios de distribuidores mayoristas para restaurantes
  - RECHAZAR precios de supermercados de consumo (Carrefour, Mercadona, Amazon)
  - Buscar en: Makro, Cash&Carry, distribuidores HORECA, mercados centrales
  
  📊 INVESTIGAR ESPECÍFICAMENTE:
  - Mercados mayoristas locales (Mercamadrid, Rungis, etc.)
  - Precios de temporada actual en canal HORECA
  - Factores que afectan el precio (clima, demanda, calidad)
  - Variaciones por región dentro del país
  - Tendencias de los últimos 3-6 meses en distribución profesional
  
  Formato JSON:
  {
    "ingredient_name": "nombre del ingrediente",
    "region": "región investigada",
    "current_price": número (precio actual por kg en euros HORECA),
    "price_range": "rango de precios mayorista (ej: 18.0-22.0)",
    "seasonal_trend": "tendencia estacional actual",
    "market_factors": ["factor 1", "factor 2", "factor 3"],
    "price_history": "resumen de tendencia últimos meses",
    "regional_variations": ["región: precio", "región: precio"],
    "forecast": "pronóstico de precios próximos meses",
    "distribution_channel": "HORECA/Mayorista",
    "last_updated": "fecha de la información"
  }
  
  Responde SOLO con un array JSON válido, sin texto adicional.`;
};

export const generateWeatherImpactPrompt = (params: { ingredient?: string; category?: string; region: string }): string => {
  const { ingredient, category, region } = params;
  
  return `Investiga el impacto del clima actual y pronósticos en la disponibilidad y precios HORECA de ${ingredient || category} en ${region}.
  Busca información sobre:
  - Condiciones climáticas actuales en las zonas de cultivo
  - Pronósticos estacionales
  - Eventos climáticos recientes (sequías, heladas, lluvias excesivas)
  - Cómo estos factores afectan la oferta y demanda en canal profesional
  - Comparación con años anteriores
  
  Formato JSON:
  {
    "ingredient_name": "nombre del ingrediente",
    "region": "región analizada",
    "current_weather": "condiciones climáticas actuales",
    "seasonal_forecast": "pronóstico estacional",
    "weather_events": ["evento reciente 1", "evento reciente 2"],
    "supply_impact": "impacto en la oferta (bajo/medio/alto)",
    "price_impact": "impacto esperado en precios HORECA",
    "availability_status": "disponibilidad actual en mercado mayorista",
    "seasonal_comparison": "comparación con temporadas anteriores",
    "recommendations": ["recomendación 1", "recomendación 2"]
  }
  
  Responde SOLO con un array JSON válido, sin texto adicional.`;
};

export const generateCulturalVariantsPrompt = (params: { ingredient?: string; category?: string }): string => {
  const { ingredient, category } = params;
  
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
};

export const generateTrendAnalysisPrompt = (params: { ingredient?: string; category?: string; region: string }): string => {
  const { ingredient, category, region } = params;
  
  return `Realiza un análisis de tendencias para ${ingredient || category} en el mercado gastronómico profesional de ${region}.
  Investiga:
  - Tendencias de consumo actuales en restaurantes
  - Popularidad en gastronomía profesional
  - Uso en restaurantes y gastronomía moderna
  - Demanda en el mercado HORECA
  - Innovaciones en el uso del ingrediente
  - Proyecciones futuras en hostelería
  
  Formato JSON:
  {
    "ingredient_name": "nombre del ingrediente",
    "trend_status": "en alza/estable/en declive",
    "popularity_score": número del 1-100,
    "professional_usage": "frecuencia de uso en cocina profesional",
    "restaurant_usage": "uso en restaurantes de diferentes niveles",
    "horeca_demand": "demanda en sector HORECA",
    "innovation_uses": ["uso innovador 1", "uso innovador 2"],
    "market_drivers": ["factor impulsor 1", "factor impulsor 2"],
    "future_outlook": "perspectiva futura en gastronomía",
    "target_demographics": ["tipo restaurante 1", "tipo restaurante 2"]
  }
  
  Responde SOLO con un array JSON válido, sin texto adicional.`;
};

export const generateSupplyChainPrompt = (params: { ingredient?: string; category?: string; region: string }): string => {
  const { ingredient, category, region } = params;
  
  return `Investiga la cadena de suministro HORECA de ${ingredient || category} en ${region}.
  Busca información sobre:
  - Principales productores y regiones de cultivo
  - Canales de distribución mayorista para restaurantes
  - Estacionalidad de la oferta en mercado profesional
  - Intermediarios y márgenes en canal HORECA
  - Desafíos logísticos para distribución a restaurantes
  - Sostenibilidad y prácticas ambientales
  
  Formato JSON:
  {
    "ingredient_name": "nombre del ingrediente",
    "main_producers": ["productor/región 1", "productor/región 2"],
    "distribution_channels": ["Makro", "Metro", "Distribuidores HORECA"],
    "supply_seasonality": "patrón estacional de oferta",
    "intermediary_levels": número de intermediarios típicos,
    "profit_margins": "estructura de márgenes en canal HORECA",
    "logistic_challenges": ["desafío 1", "desafío 2"],
    "sustainability_practices": ["práctica 1", "práctica 2"],
    "supply_reliability": "confiabilidad de suministro (alta/media/baja)",
    "quality_standards": ["estándar HORECA 1", "estándar HORECA 2"]
  }
  
  Responde SOLO con un array JSON válido, sin texto adicional.`;
};

// Nuevo prompt específico para validación de precios HORECA
export const generatePriceValidationPrompt = (ingredient: string, suspiciousPrice: number, unit: string, country: string): string => {
  return `VALIDACIÓN URGENTE DE PRECIO HORECA para ${ingredient} en ${country}.

  🚨 PRECIO SOSPECHOSO DETECTADO: €${suspiciousPrice}/${unit}
  
  🔍 INVESTIGAR INMEDIATAMENTE:
  1. Buscar EXCLUSIVAMENTE en distribuidores HORECA del país
  2. Verificar precios en al menos 3 fuentes mayoristas diferentes
  3. Confirmar que el precio es por ${unit} y no por unidad menor
  4. Validar que es precio para restaurantes, NO retail
  
  🏢 FUENTES OBLIGATORIAS PARA ${country}:
  ${country === 'España' ? '- Makro.es, distribuidores HORECA españoles' : ''}
  ${country === 'Francia' ? '- Metro.fr, Rungis, distribuidores professionnels' : ''}
  ${country === 'Italia' ? '- Metro Italia, mercados mayoristas' : ''}
  ${country === 'Estados Unidos' ? '- Restaurant Depot, US Foods, Sysco' : ''}
  - Mercados centrales mayoristas
  - Distribuidores especializados B2B
  
  Responde con:
  {
    "ingredient": "${ingredient}",
    "country": "${country}",
    "validated_price": número (precio real HORECA),
    "price_range": "rango min-max encontrado",
    "sources_consulted": ["fuente 1", "fuente 2", "fuente 3"],
    "unit": "${unit}",
    "validation_status": "válido/inválido/corregido",
    "notes": "explicación de la corrección si aplica"
  }`;
};
