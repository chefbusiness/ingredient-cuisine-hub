
import { HORECA_KEYWORDS, RETAIL_KEYWORDS } from './perplexity-config.ts';

export function isHorecaSource(citation: string): boolean {
  const citationLower = citation.toLowerCase();
  
  // Si contiene palabras de retail, no es HORECA
  if (RETAIL_KEYWORDS.some(keyword => citationLower.includes(keyword))) {
    return false;
  }
  
  // Si contiene palabras de HORECA, sí es válido
  return HORECA_KEYWORDS.some(keyword => citationLower.includes(keyword));
}

export function validateSources(citations: string[]): void {
  if (citations && citations.length > 0) {
    console.log('📚 Fuentes consultadas:', citations.length);
    console.log('🏢 === VERIFICACIÓN DE FUENTES HORECA ===');
    citations.forEach((citation, index) => {
      const isHoreca = isHorecaSource(citation);
      console.log(`  ${index + 1}. ${citation} ${isHoreca ? '✅ HORECA' : '⚠️  NO-HORECA'}`);
    });
  }
}
