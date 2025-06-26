
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

    // Dividir por marcadores de sección usando regex más específico y robusto
    const parts = text.split(/###SECCION[1-5]###\s*/);
    
    // Filtrar partes vacías y procesar contenido
    const contentParts = parts.filter(part => part.trim().length > 0);
    
    contentParts.forEach((content, index) => {
      if (content.trim()) {
        // Limpiar cualquier marcador residual del contenido
        const cleanContent = content.replace(/###SECCION[1-5]###/g, '').trim();
        
        sections.push({
          title: sectionTitles[index] || `Sección ${index + 1}`,
          content: cleanContent
        });
      }
    });

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
