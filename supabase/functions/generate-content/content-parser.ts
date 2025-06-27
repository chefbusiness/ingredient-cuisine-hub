
export function parseContent(content: string): any[] {
  console.log('🔍 === PARSEANDO CONTENIDO PERPLEXITY ===');
  console.log('📄 Contenido recibido (primeros 200 chars):', content.substring(0, 200));
  
  try {
    // Limpiar el contenido: remover texto antes y después del JSON
    let cleanContent = content.trim();
    
    // Buscar el inicio del JSON array o objeto
    const jsonStart = Math.max(cleanContent.indexOf('['), cleanContent.indexOf('{'));
    if (jsonStart > 0) {
      cleanContent = cleanContent.substring(jsonStart);
      console.log('🧹 Contenido limpiado, empezando desde posición:', jsonStart);
    }
    
    // Buscar el final del JSON
    let jsonEnd = -1;
    if (cleanContent.startsWith('[')) {
      jsonEnd = cleanContent.lastIndexOf(']');
    } else if (cleanContent.startsWith('{')) {
      jsonEnd = cleanContent.lastIndexOf('}');
    }
    
    if (jsonEnd > 0 && jsonEnd < cleanContent.length - 1) {
      cleanContent = cleanContent.substring(0, jsonEnd + 1);
      console.log('🧹 Contenido cortado hasta posición:', jsonEnd + 1);
    }
    
    console.log('📝 Contenido final para parsear (primeros 200 chars):', cleanContent.substring(0, 200));
    
    // Intentar parsear JSON
    const parsed = JSON.parse(cleanContent);
    
    // Asegurar que devolvemos un array
    if (!Array.isArray(parsed)) {
      console.log('📦 Convertir objeto único a array');
      return [parsed];
    }
    
    console.log('✅ JSON parseado exitosamente:', parsed.length, 'elementos');
    return parsed;
    
  } catch (error) {
    console.error('❌ Error parseando contenido:', error.message);
    console.error('📄 Contenido problemático:', content.substring(0, 500));
    
    // Intentar extraer JSON con regex como último recurso
    try {
      console.log('🔄 Intentando extracción con regex...');
      const jsonMatch = content.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON extraído con regex exitosamente');
        return Array.isArray(extracted) ? extracted : [extracted];
      }
    } catch (regexError) {
      console.error('❌ Error con extracción regex:', regexError.message);
    }
    
    throw new Error('No se pudo parsear el contenido como JSON válido: ' + error.message);
  }
}
