
/**
 * Utility functions for formatting price units
 */

// Mapeo de unidades cortas a formatos de dropdown (para el editor)
export const unitOptions = [
  { value: 'kg', label: 'Kg (kilogramos)' },
  { value: 'l', label: 'Lt (litros)' },
  { value: 'g', label: 'gr (gramos)' },
  { value: 'ml', label: 'ml (mililitros)' },
  { value: 'uni', label: 'uni (unidad)' },
  { value: 'docena', label: 'docena (12 unidades)' },
];

// Mapeo de unidades cortas a formato legible para mostrar en precios
export const formatUnitForDisplay = (unit: string): string => {
  const unitMap: { [key: string]: string } = {
    'kg': 'kilo',
    'l': 'litro',
    'g': 'gramo',
    'ml': 'mililitro',
    'uni': 'unidad',
    'docena': 'docena',
  };
  
  return unitMap[unit] || unit;
};

// Función para obtener el símbolo corto de la unidad (para badges)
export const getUnitSymbol = (unit: string): string => {
  const symbolMap: { [key: string]: string } = {
    'kg': 'Kg',
    'l': 'Lt',
    'g': 'gr',
    'ml': 'ml',
    'uni': 'uni',
    'docena': 'doc',
  };
  
  return symbolMap[unit] || unit;
};

// Función para formatear valores de variación estacional/tipo de precio
export const formatSeasonVariation = (variation: string | null | undefined): string => {
  if (!variation) return '-';
  
  // Mapeo de valores técnicos a texto legible
  const variationMap: { [key: string]: string } = {
    'REVISAR_PRECIO_mayorista': 'Mayorista (revisar)',
    'REVISAR_PRECIO_minorista': 'Minorista (revisar)',
    'general': 'General',
    'mayorista': 'Mayorista',
    'minorista': 'Minorista',
  };
  
  // Si existe un mapeo específico, usarlo
  if (variationMap[variation]) {
    return variationMap[variation];
  }
  
  // Si no, devolver el valor original (para valores como "Más caro en invierno")
  return variation;
};
