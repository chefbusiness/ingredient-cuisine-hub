
export function validateSources(citations: string[]): void {
  console.log('📚 === VALIDANDO FUENTES (MODO DEBUG) ===');
  
  if (citations && citations.length > 0) {
    console.log('📊 Fuentes encontradas:', citations.length);
    citations.forEach((citation, index) => {
      console.log(`  ${index + 1}. ${citation}`);
    });
  } else {
    console.log('⚠️ No se encontraron fuentes para validar');
  }
}
