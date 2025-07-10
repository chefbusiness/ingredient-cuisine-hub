
export const PERPLEXITY_CONFIG = {
  model: 'sonar-pro', // ACTUALIZADO: modelo correcto según nueva API de Perplexity
  temperature: 0.1, // Reducido para mayor consistencia con más ingredientes
  max_tokens: 30000, // AUMENTADO: de 20000 a 30000 para soportar hasta 15 ingredientes en modo manual
  top_p: 0.9,
  return_images: false,
  return_related_questions: false
} as const;

console.log('⚙️ Perplexity config mejorada para modo manual masivo:', PERPLEXITY_CONFIG.model, 'tokens:', PERPLEXITY_CONFIG.max_tokens);
