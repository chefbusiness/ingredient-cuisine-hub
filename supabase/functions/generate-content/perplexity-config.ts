
export const PERPLEXITY_CONFIG = {
  model: 'llama-3.1-sonar-large-128k-online',
  temperature: 0.1, // Reducido para mayor consistencia con más ingredientes
  max_tokens: 20000, // AUMENTADO: de 4000 a 20000 para soportar 20-30 ingredientes
  top_p: 0.9,
  return_images: false,
  return_related_questions: false
} as const;

console.log('⚙️ Perplexity config optimizada para generación masiva:', PERPLEXITY_CONFIG.model, 'tokens:', PERPLEXITY_CONFIG.max_tokens);
