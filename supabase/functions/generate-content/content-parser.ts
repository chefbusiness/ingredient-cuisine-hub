
import { guessCategory, validateHorecaPrice } from './price-validator.ts';

export function cleanMarkdownJson(content: string): string {
  console.log('🧹 === LIMPIEZA DE MARKDOWN Y SANITIZACIÓN ===');
  
  // Buscar bloques de JSON en markdown
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
  const matches = content.match(jsonBlockRegex);
  
  let cleanedContent: string;
  
  if (matches) {
    console.log('📝 Bloques de markdown encontrados, extrayendo JSON...');
    const firstMatch = matches[0];
    cleanedContent = firstMatch.replace(/```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
  } else {
    console.log('📄 No hay bloques de markdown, usando contenido original');
    cleanedContent = content.trim();
  }
  
  // SANITIZACIÓN MEJORADA PARA CARACTERES PROBLEMÁTICOS
  console.log('🧽 Aplicando sanitización avanzada...');
  
  // 1. Reemplazar saltos de línea dentro de cadenas de texto por espacios
  cleanedContent = cleanedContent.replace(/("description":\s*"[^"]*?)\n+([^"]*?")/g, '$1 $2');
  
  // 2. Limpiar caracteres de control problemáticos
  cleanedContent = cleanedContent
    .replace(/\r\n/g, ' ')  // Saltos de línea Windows
    .replace(/\n/g, ' ')    // Saltos de línea Unix
    .replace(/\r/g, ' ')    // Retorno de carro
    .replace(/\t/g, ' ')    // Tabulaciones
    .replace(/\f/g, ' ')    // Form feed
    .replace(/\v/g, ' ');   // Vertical tab
  
  // 3. Limpiar espacios múltiples
  cleanedContent = cleanedContent.replace(/\s+/g, ' ');
  
  // 4. Escapar comillas problemáticas dentro de las descripciones
  cleanedContent = cleanedContent.replace(
    /"description":\s*"([^"]*(?:\\"[^"]*)*)"/g,
    (match, description) => {
      // Escapar comillas internas que no estén ya escapadas
      const escapedDescription = description.replace(/(?<!\\)"/g, '\\"');
      return `"description": "${escapedDescription}"`;
    }
  );
  
  // 5. Validar que las llaves estén balanceadas
  const openBraces = (cleanedContent.match(/\{/g) || []).length;
  const closeBraces = (cleanedContent.match(/\}/g) || []).length;
  const openBrackets = (cleanedContent.match(/\[/g) || []).length;
  const closeBrackets = (cleanedContent.match(/\]/g) || []).length;
  
  console.log('🔍 Validación de estructura JSON:');
  console.log(`   Llaves abiertas: ${openBraces}, cerradas: ${closeBraces}`);
  console.log(`   Corchetes abiertos: ${openBrackets}, cerrados: ${closeBrackets}`);
  
  if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
    console.log('⚠️ Estructura JSON posiblemente desbalanceada');
  }
  
  console.log('✨ Contenido limpio (primeros 200 chars):', cleanedContent.substring(0, 200));
  return cleanedContent;
}

export function parseContent(content: string): any[] {
  console.log('🔍 === PARSEANDO CONTENIDO INVESTIGADO ===');
  
  const cleanedContent = cleanMarkdownJson(content);
  
  let parsedContent;
  try {
    // Validación previa al parsing
    if (!cleanedContent.trim().startsWith('[') && !cleanedContent.trim().startsWith('{')) {
      console.log('⚠️ Contenido no parece ser JSON válido, intentando extraer...');
      // Intentar encontrar JSON válido dentro del contenido
      const jsonMatch = cleanedContent.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (jsonMatch) {
        const extractedJson = jsonMatch[1];
        console.log('🔧 JSON extraído:', extractedJson.substring(0, 100) + '...');
        parsedContent = JSON.parse(extractedJson);
      } else {
        throw new Error('No se pudo encontrar JSON válido en el contenido');
      }
    } else {
      parsedContent = JSON.parse(cleanedContent);
    }
    
    console.log('✅ Contenido parseado exitosamente');
    console.log('📊 Tipo:', Array.isArray(parsedContent) ? 'Array' : typeof parsedContent);
  } catch (error) {
    console.error('❌ Error parseando JSON:', error);
    console.error('📄 Contenido original:', content.substring(0, 500));
    console.error('🧹 Contenido limpio:', cleanedContent.substring(0, 500));
    console.error('🔍 Detalle del error:', error.message);
    
    // Intentar recuperación adicional
    try {
      // Remover caracteres problemáticos más agresivamente
      const ultraCleanContent = cleanedContent
        .replace(/[\x00-\x1F\x7F]/g, ' ')  // Remover todos los caracteres de control
        .replace(/\\n/g, ' ')              // Remover secuencias de escape literales
        .replace(/\\r/g, ' ')
        .replace(/\\t/g, ' ')
        .replace(/\s+/g, ' ')              // Consolidar espacios
        .trim();
      
      console.log('🚑 Intentando recuperación con limpieza ultra...');
      parsedContent = JSON.parse(ultraCleanContent);
      console.log('🎉 Recuperación exitosa!');
    } catch (recoveryError) {
      throw new Error('Respuesta de Perplexity no es JSON válido después de limpiar y intentar recuperación');
    }
  }

  if (!Array.isArray(parsedContent)) {
    console.log('🔄 Convirtiendo a array');
    parsedContent = [parsedContent];
  }

  // VALIDACIÓN DE PRECIOS HORECA
  console.log('🏢 === VALIDANDO PRECIOS HORECA ===');
  parsedContent.forEach((item, index) => {
    if (item.prices_by_country && Array.isArray(item.prices_by_country)) {
      console.log(`📊 Validando precios para: ${item.name}`);
      item.prices_by_country.forEach((priceData: any) => {
        const price = parseFloat(priceData.price);
        const category = guessCategory(item.name);
        const isValidPrice = validateHorecaPrice(price, category, item.name);
        
        console.log(`   ${priceData.country}: €${price}/${priceData.unit} ${isValidPrice ? '✅ VÁLIDO' : '❌ SOSPECHOSO'}`);
        
        if (!isValidPrice) {
          console.log(`   ⚠️  PRECIO FUERA DE RANGO HORECA para ${category}: €${price}/${priceData.unit}`);
        }
      });
    }
  });

  console.log('🎉 Contenido final parseado:', parsedContent.length, 'elementos');
  return parsedContent;
}
