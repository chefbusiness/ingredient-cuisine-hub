
export function parseContent(content: string): any[] {
  console.log('🔍 === PARSEANDO CONTENIDO (MODO DEBUG) ===');
  console.log('📄 Contenido recibido (primeros 200 chars):', content.substring(0, 200));
  
  try {
    // Intentar parsear JSON directo
    const parsed = JSON.parse(content);
    
    if (!Array.isArray(parsed)) {
      return [parsed];
    }
    
    return parsed;
  } catch (error) {
    console.error('❌ Error parseando contenido:', error);
    throw new Error('No se pudo parsear el contenido como JSON válido');
  }
}
