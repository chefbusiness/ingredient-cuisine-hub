
import { useMemo } from 'react';

export const useCleanDescription = (description: string) => {
  return useMemo(() => {
    if (!description || typeof description !== 'string') return '';
    
    // Función exhaustiva de limpieza
    let cleanText = description
      // Eliminar todos los marcadores de sección conocidos
      .replace(/###SECCION[1-9]###/g, '')
      .replace(/###SECTION[1-9]###/g, '')
      .replace(/###SECCION###/g, '')
      .replace(/###SECTION###/g, '')
      .replace(/### SECCION[1-9] ###/g, '')
      .replace(/### SECTION[1-9] ###/g, '')
      // Eliminar headers de markdown
      .replace(/^#{1,6}\s+.*$/gm, '')
      // Eliminar marcadores con asteriscos
      .replace(/\*\*\*SECCION[1-9]\*\*\*/g, '')
      .replace(/\*\*SECCION[1-9]\*\*/g, '')
      .replace(/\*SECCION[1-9]\*/g, '')
      // Eliminar marcadores con guiones
      .replace(/---SECCION[1-9]---/g, '')
      .replace(/--SECCION[1-9]--/g, '')
      // Normalizar espacios múltiples
      .replace(/\s+/g, ' ')
      // Eliminar saltos de línea múltiples
      .replace(/\n\s*\n/g, ' ')
      // Limpiar espacios al inicio y final
      .trim();
    
    return cleanText;
  }, [description]);
};
