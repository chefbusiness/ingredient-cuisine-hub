
export function buildSuccessResponse(
  generatedData: any[],
  aiProvider: string,
  generationMode: string,
  message: string
) {
  return {
    success: true,
    data: generatedData,
    generated_count: generatedData.length,
    ai_provider: aiProvider,
    research_quality: aiProvider === 'perplexity_sonar_deep_research' ? 'professional_web_research' : 'fallback',
    generation_mode: generationMode,
    message: message
  };
}

export function buildFallbackResponse(
  fallbackData: any[],
  generationMode: string,
  warning?: string
) {
  return {
    success: true,
    data: fallbackData,
    generated_count: fallbackData.length,
    ai_provider: 'fallback_after_perplexity_error',
    research_quality: 'fallback',
    generation_mode: generationMode,
    message: 'Contenido generado con datos de fallback debido a error temporal de Perplexity',
    warning: warning || 'Error temporal con Perplexity API, se usaron datos de prueba'
  };
}

export function buildErrorResponse(error: any, code: string) {
  return {
    error: error.message || 'Internal server error',
    code: code,
    ai_provider: 'error_state'
  };
}
