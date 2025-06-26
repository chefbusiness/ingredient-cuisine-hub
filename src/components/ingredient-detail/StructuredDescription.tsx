
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

    // Dividir por marcadores de sección usando regex más específico
    const parts = text.split(/###SECCION[1-5]###/);
    
    // El primer elemento puede estar vacío o contener texto previo
    const contentParts = parts.filter(part => part.trim().length > 0);
    
    contentParts.forEach((content, index) => {
      if (content.trim()) {
        sections.push({
          title: sectionTitles[index] || `Sección ${index + 1}`,
          content: content.trim()
        });
      }
    });

    return sections;
  };

  const sections = parseStructuredDescription(description);

  return (
    <div className={`structured-description ${className}`}>
      {sections.map((section, index) => (
        <div key={index} className="mb-6 last:mb-0">
          {section.title && (
            <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              {section.title}
            </h4>
          )}
          <p className="text-gray-700 leading-relaxed text-justify">
            {section.content}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StructuredDescription;
