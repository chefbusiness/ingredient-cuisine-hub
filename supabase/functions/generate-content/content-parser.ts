
export function parseContent(content: string): any[] {
  console.log('🔍 === PARSEANDO CONTENIDO PERPLEXITY MEJORADO PARA MANUAL ===');
  console.log('📄 Contenido recibido longitud:', content.length, 'chars');
  
  try {
    // Limpiar el contenido de manera más robusta
    let cleanContent = content.trim();
    
    // Remover bloques de código markdown si existen
    cleanContent = cleanContent.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
    
    // MEJORADO: Buscar múltiples patrones JSON
    const arrayMatch = cleanContent.match(/\[[\s\S]*\]/);
    const objectMatch = cleanContent.match(/\{[\s\S]*\}/);
    
    let jsonContent = '';
    
    if (arrayMatch && objectMatch) {
      // Elegir el más largo (probablemente el array de ingredientes)
      jsonContent = arrayMatch[0].length > objectMatch[0].length ? arrayMatch[0] : objectMatch[0];
    } else if (arrayMatch) {
      jsonContent = arrayMatch[0];
    } else if (objectMatch) {
      jsonContent = objectMatch[0];
    } else {
      throw new Error('No se encontró JSON válido en la respuesta');
    }
    
    console.log('📝 JSON extraído longitud:', jsonContent.length, 'chars');
    console.log('📝 Primeros 300 chars:', jsonContent.substring(0, 300));
    
    // MEJORADO: Limpiar más agresivamente comentarios y errores de formato
    jsonContent = jsonContent
      .replace(/\/\/[^\n\r]*/g, '') // Remover comentarios de línea
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remover comentarios de bloque
      .replace(/,(\s*[}\]])/g, '$1') // Remover comas finales
      .replace(/,\s*,/g, ',') // Remover comas dobles
      .replace(/}\s*{/g, '},{'); // Corregir objetos mal separados
    
    // Intentar parsear JSON
    const parsed = JSON.parse(jsonContent);
    
    // Asegurar que devolvemos un array
    if (!Array.isArray(parsed)) {
      console.log('📦 Convertir objeto único a array');
      return [parsed];
    }
    
    console.log('✅ JSON parseado exitosamente:', parsed.length, 'elementos');
    
    // Validar que cada elemento tenga las propiedades básicas
    const validElements = parsed.filter(item => {
      const isValid = item && typeof item === 'object' && 
                     (item.name || item.error === 'DUPLICADO_DETECTADO');
      if (!isValid) {
        console.log('⚠️ Elemento inválido filtrado:', item);
      }
      return isValid;
    });
    
    console.log('✅ Elementos válidos después de filtrado:', validElements.length);
    
    // NUEVO: Log detallado de cada ingrediente para debugging
    validElements.forEach((item, idx) => {
      console.log(`📋 Ingrediente ${idx + 1}: "${item.name}" - Categoría: "${item.category}"`);
    });
    
    return validElements;
    
  } catch (error) {
    console.error('❌ Error parseando contenido:', error.message);
    console.error('📄 Contenido problemático (primeros 1000 chars):', content.substring(0, 1000));
    
    // MEJORADO: Extracción más agresiva con regex para contenido largo
    try {
      console.log('🔄 Intentando extracción agresiva mejorada...');
      
      // Buscar múltiples objetos JSON individuales con mejor regex
      const objectMatches = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
      if (objectMatches && objectMatches.length > 0) {
        console.log('🔍 Encontrados', objectMatches.length, 'objetos JSON individuales');
        
        const parsedObjects = [];
        for (const match of objectMatches) {
          try {
            // Limpiar cada objeto individualmente
            const cleanMatch = match
              .replace(/\/\/[^\n\r]*/g, '')
              .replace(/,(\s*[}\]])/g, '$1');
              
            const obj = JSON.parse(cleanMatch);
            if (obj.name || obj.error === 'DUPLICADO_DETECTADO') {
              parsedObjects.push(obj);
              console.log(`✅ Objeto parseado: "${obj.name}"`);
            }
          } catch (parseError) {
            console.log('⚠️ Error parseando objeto individual:', parseError.message);
          }
        }
        
        if (parsedObjects.length > 0) {
          console.log('✅ Objetos extraídos individualmente:', parsedObjects.length);
          return parsedObjects;
        }
      }
      
      // Último recurso: buscar array JSON con regex más flexible
      const flexibleArrayMatch = content.match(/\[[^\[\]]*(?:\{[^{}]*\}[^\[\]]*)*\]/);
      if (flexibleArrayMatch) {
        const cleanArray = flexibleArrayMatch[0]
          .replace(/\/\/[^\n\r]*/g, '')
          .replace(/,(\s*[}\]])/g, '$1');
          
        const extracted = JSON.parse(cleanArray);
        console.log('✅ Array JSON extraído con regex flexible');
        return Array.isArray(extracted) ? extracted : [extracted];
      }
    } catch (regexError) {
      console.error('❌ Error con extracción agresiva mejorada:', regexError.message);
    }
    
    throw new Error('No se pudo parsear el contenido como JSON válido: ' + error.message);
  }
}
