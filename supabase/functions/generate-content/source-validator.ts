
export function validateSources(citations: string[]): void {
  console.log('📚 === VALIDANDO FUENTES DE PERPLEXITY ===');
  
  if (citations && citations.length > 0) {
    console.log('📊 Fuentes encontradas:', citations.length);
    
    const validSources = [];
    const invalidSources = [];
    
    citations.forEach((citation, index) => {
      console.log(`  ${index + 1}. ${citation}`);
      
      // Validar que las fuentes sean legítimas
      if (citation && citation.includes('http') && citation.length > 10) {
        validSources.push(citation);
      } else {
        invalidSources.push(citation);
      }
    });
    
    console.log('✅ Fuentes válidas:', validSources.length);
    if (invalidSources.length > 0) {
      console.log('⚠️ Fuentes inválidas:', invalidSources.length);
    }
    
  } else {
    console.log('⚠️ No se encontraron fuentes para validar');
  }
}
