
export const PERPLEXITY_CONFIG = {
  model: 'sonar-pro',
  fallback_model: 'llama-3.1-sonar-small-128k-online',
  temperature: 0.1,
  max_tokens: 4000,
  top_p: 0.9,
  return_images: false,
  return_related_questions: false,
  search_recency_filter: 'month',
  frequency_penalty: 1.0,
  search_domain_filter: [
    'frutaseloy.com',
    'makro.es',
    'metro.fr',
    'restaurantdepot.com',
    'sysco.com',
    'usfoods.com',
    'mercamadrid.es',
    'gastronomiavasca.net',
    'quesos.org',
    'denominaciondeorigen.es'
  ]
} as const;

console.log('⚙️ Perplexity config actualizada para Sonar Pro:', PERPLEXITY_CONFIG.model);
