
interface StructuredDescriptionProps {
  description: string;
  className?: string;
}

const StructuredDescription = ({ description, className = "" }: StructuredDescriptionProps) => {
  // Función para parsear la descripción con marcadores de sección
  const parseStructuredDescription = (text: string) => {
    // Si no tiene marcadores de sección, mostrar como texto normal (compatibilidad hacia atrás)
    if (!text.includes('###SECCION')) {
      return [{ title: "", content: text }];
    }

    const sections = [];
    const sectionTitles = [
      "Definición y Características Científicas",
      "Origen Geográfico y Contexto Histórico-Cultural", 
      "Análisis Organoléptico y Propiedades Físico-Químicas",
      "Aplicaciones Técnicas en Gastronomía Profesional",
      "Criterios de Calidad, Conservación y Uso Profesional"
    ];

    // Extraer cada sección individualmente
    for (let i = 1; i <= 5; i++) {
      const startMarker = `###SECCION${i}###`;
      const nextMarker = `###SECCION${i + 1}###`;
      
      const startIndex = text.indexOf(startMarker);
      if (startIndex === -1) continue;
      
      const contentStart = startIndex + startMarker.length;
      const endIndex = text.indexOf(nextMarker);
      
      let sectionContent;
      if (endIndex === -1) {
        // Es la última sección
        sectionContent = text.substring(contentStart);
      } else {
        sectionContent = text.substring(contentStart, endIndex);
      }
      
      // Limpiar el contenido
      const cleanContent = sectionContent
        .replace(/###SECCION[1-5]###/g, '') // Eliminar cualquier marcador residual
        .trim();
      
      if (cleanContent && cleanContent.length > 0) {
        sections.push({
          title: sectionTitles[i - 1] || `Sección ${i}`,
          content: cleanContent
        });
      }
    }

    // Si no se encontraron secciones válidas, devolver el texto original limpio
    if (sections.length === 0) {
      const cleanText = text.replace(/###SECCION[1-5]###/g, '').trim();
      return [{ title: "", content: cleanText }];
    }

    return sections;
  };

  const sections = parseStructuredDescription(description);

  return (
    <div className={`structured-description ${className}`}>
      {sections.map((section, index) => (
        <div key={index} className="mb-4 last:mb-0">
          {section.title && (
            <h4 className="text-base font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">
              {section.title}
            </h4>
          )}
          <p className="text-gray-700 leading-relaxed text-sm text-justify">
            {section.content}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StructuredDescription;
