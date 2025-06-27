
import { useCleanDescription } from "@/hooks/useCleanDescription";

interface StructuredDescriptionProps {
  description: string;
  className?: string;
}

const StructuredDescription = ({ description, className = "" }: StructuredDescriptionProps) => {
  const cleanedText = useCleanDescription(description);

  // Si no hay contenido limpio, no mostrar nada
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
