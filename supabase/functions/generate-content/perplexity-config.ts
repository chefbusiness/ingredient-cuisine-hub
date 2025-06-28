
export const PERPLEXITY_CONFIG = {
  model: 'llama-3.1-sonar-large-128k-online',
  temperature: 0.2,
  max_tokens: 4000,
  top_p: 0.9,
  return_images: false,
  return_related_questions: false
} as const;

console.log('⚙️ Perplexity config cargada:', PERPLEXITY_CONFIG.model);
