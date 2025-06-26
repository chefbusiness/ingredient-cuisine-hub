
export const PERPLEXITY_CONFIG = {
  model: 'llama-3.1-sonar-large-128k-online',
  temperature: 0.2,
  max_tokens: 8000,
  top_p: 0.9,
  return_images: false,
  return_related_questions: false,
  search_domain_filter: [
    // REDUCIDO A 10 DOMINIOS PRIORITARIOS HORECA (límite de API)
    'makro.es',               // España - mayorista HORECA
    'metro.fr',               // Francia - mayorista HORECA  
    'restaurantdepot.com',    // USA - mayorista restaurantes
    'sysco.com',              // USA - distribuidor profesional
    'usfoods.com',            // USA - distribuidor HORECA
    'fao.org',                // Datos oficiales alimentación
    'usda.gov',               // Datos oficiales USA
    'mercamadrid.es',         // Mercado central España
    'rungis-market.com',      // Mercado central Francia
    'alibaba.com'             // B2B internacional
  ],
  search_recency_filter: 'month',
  frequency_penalty: 1.2 // Evitar repetición de fuentes
} as const;

export const HORECA_KEYWORDS = [
  'makro', 'metro', 'cash', 'carry', 'restaurant', 'depot', 
  'sysco', 'foods', 'mercamadrid', 'rungis', 'horeca', 
  'mayorista', 'wholesale', 'professional', 'b2b'
] as const;

export const RETAIL_KEYWORDS = [
  'amazon', 'ebay', 'carrefour', 'mercadona', 'alcampo',
  'corte', 'inglés', 'lidl', 'aldi', 'dia'
] as const;
