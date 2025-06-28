
export function parseContent(content: string): any[] {
  console.log('🔍 === PARSEANDO CONTENIDO PERPLEXITY ===');
  console.log('📄 Contenido recibido (primeros 200 chars):', content.substring(0, 200));
  
  try {
    // Limpiar el contenido: remover <think> tags y otros elementos no-JSON
    let cleanContent = content.trim();
    
    // Remover etiquetas <think>...</think> completamente
    cleanContent = cleanContent.replace(/<think>[\s\S]*?<\/think>/gi, '');
    
    // Remover otras etiquetas XML comunes
    cleanContent = cleanContent.replace(/<[^>]+>/g, '');
    
    // Remover texto antes del JSON
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
      // Para objetos únicos, buscar el último }
      let braceCount = 0;
      for (let i = 0; i < cleanContent.length; i++) {
        if (cleanContent[i] === '{') braceCount++;
        if (cleanContent[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            jsonEnd = i;
            break;
          }
        }
      }
    }
    
    if (jsonEnd > 0 && jsonEnd < cleanContent.length - 1) {
      cleanContent = cleanContent.substring(0, jsonEnd + 1);
      console.log('🧹 Contenido cortado hasta posición:', jsonEnd + 1);
    }
    
    // Limpiar espacios y caracteres especiales
    cleanContent = cleanContent.trim();
    
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
    console.error('📄 Contenido problemático (primeros 500 chars):', content.substring(0, 500));
    
    // Intentar extracción con regex mejorado
    try {
      console.log('🔄 Intentando extracción con regex mejorado...');
      
      // Buscar JSON más específicamente
      const jsonArrayMatch = content.match(/\[[^\]]*\{[^}]*\}[^\]]*\]/s);
      const jsonObjectMatch = content.match(/\{[^{}]*"[^"]*"[^{}]*\}/s);
      
      let extracted = null;
      
      if (jsonArrayMatch) {
        console.log('📦 Array JSON encontrado con regex');
        extracted = JSON.parse(jsonArrayMatch[0]);
      } else if (jsonObjectMatch) {
        console.log('📦 Objeto JSON encontrado con regex');
        extracted = JSON.parse(jsonObjectMatch[0]);
      }
      
      if (extracted) {
        console.log('✅ JSON extraído con regex exitosamente');
        return Array.isArray(extracted) ? extracted : [extracted];
      }
    } catch (regexError) {
      console.error('❌ Error con extracción regex mejorada:', regexError.message);
    }
    
    throw new Error('No se pudo parsear el contenido como JSON válido: ' + error.message);
  }
}
