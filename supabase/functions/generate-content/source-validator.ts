
import { HORECA_KEYWORDS, RETAIL_KEYWORDS } from './perplexity-config.ts';

export function isHorecaSource(citation: string): boolean {
  const citationLower = citation.toLowerCase();
  
  // Si contiene palabras de retail, no es HORECA
  if (RETAIL_KEYWORDS.some(keyword => citationLower.includes(keyword))) {
    return false;
  }
  
  // Frutas Eloy es fuente HORECA prioritaria
  if (citationLower.includes('frutaseloy') || citationLower.includes('frutas eloy')) {
    return true;
  }
  
  // Si contiene palabras de HORECA, sí es válido
  return HORECA_KEYWORDS.some(keyword => citationLower.includes(keyword));
}

export function validateSources(citations: string[]): void {
  if (citations && citations.length > 0) {
    console.log('📚 Fuentes consultadas:', citations.length);
    console.log('🏢 === VERIFICACIÓN DE FUENTES HORECA ===');
    
    let frutasEloyFound = false;
    
    citations.forEach((citation, index) => {
      const isHoreca = isHorecaSource(citation);
      const isFrutasEloy = citation.toLowerCase().includes('frutaseloy') || 
                          citation.toLowerCase().includes('frutas eloy');
      
      if (isFrutasEloy) {
        frutasEloyFound = true;
        console.log(`  ${index + 1}. ${citation} 🥇 FRUTAS ELOY (PRIORITARIO)`);
      } else {
        console.log(`  ${index + 1}. ${citation} ${isHoreca ? '✅ HORECA' : '⚠️  NO-HORECA'}`);
      }
    });
    
    // Verificar si se consultó Frutas Eloy para ingredientes españoles
    if (!frutasEloyFound) {
      console.log('⚠️  ADVERTENCIA: No se encontró Frutas Eloy en las fuentes consultadas');
      console.log('🎯 Para ingredientes españoles, Frutas Eloy debería ser la fuente prioritaria');
    } else {
      console.log('🥇 EXCELENTE: Frutas Eloy consultado como fuente prioritaria');
    }
  }
}
