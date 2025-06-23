
import AIResearchSection from "./image-upload/AIResearchSection";
import ManualUploadSection from "./image-upload/ManualUploadSection";

interface ImageUploadSectionProps {
  ingredientId: string;
  ingredientName?: string;
  onImageUploaded: () => void;
}

const ImageUploadSection = ({ ingredientId, ingredientName = "", onImageUploaded }: ImageUploadSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Enhanced AI Research Section */}
      <AIResearchSection 
        ingredientId={ingredientId}
        ingredientName={ingredientName}
        onImageUploaded={onImageUploaded}
      />

      {/* Manual Upload Section */}
      <ManualUploadSection 
        ingredientId={ingredientId}
        ingredientName={ingredientName}
        onImageUploaded={onImageUploaded}
      />
    </div>
  );
};

export default ImageUploadSection;
