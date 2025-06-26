
interface StructuredDescriptionProps {
  description: string;
  className?: string;
}

const StructuredDescription = ({ description, className = "" }: StructuredDescriptionProps) => {
  // Función simple para limpiar todos los marcadores y mostrar texto continuo
  const cleanDescription = (text: string) => {
    // Eliminar todos los marcadores de sección
    const cleanText = text
      .replace(/###SECCION[1-5]###/g, '') // Eliminar marcadores
      .replace(/\s+/g, ' ') // Normalizar espacios múltiples
      .trim(); // Limpiar espacios al inicio y final
    
    return cleanText;
  };

  const cleanedText = cleanDescription(description);

  // Si no hay contenido, no mostrar nada
  if (!cleanedText || cleanedText.length === 0) {
    return null;
  }

  return (
    <div className={`structured-description ${className}`}>
      <p className="text-gray-700 leading-relaxed text-sm text-justify">
        {cleanedText}
      </p>
    </div>
  );
};

export default StructuredDescription;
