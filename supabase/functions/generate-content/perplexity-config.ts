
export const PERPLEXITY_CONFIG = {
  model: 'sonar-deep-research',
  temperature: 0.2,
  max_tokens: 4000,
  top_p: 0.9,
  return_images: false,
  return_related_questions: false
} as const;

console.log('⚙️ Perplexity config cargada:', PERPLEXITY_CONFIG.model);
