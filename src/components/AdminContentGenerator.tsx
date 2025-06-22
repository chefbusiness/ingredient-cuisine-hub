
import { useState } from "react";
import AdminContentGeneratorForm from "./admin/AdminContentGeneratorForm";
import AdminContentPreview from "./admin/AdminContentPreview";

const AdminContentGenerator = () => {
  const [contentType, setContentType] = useState<'ingredient' | 'category' | 'price_update'>('ingredient');
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [imageGenerationProgress, setImageGenerationProgress] = useState({ 
    current: 0, 
    total: 0, 
    isGenerating: false 
  });

  const handleContentGenerated = (content: any[]) => {
    setGeneratedContent(content);
    setPreviewMode(true);
  };

  const handleContentCleared = () => {
    setGeneratedContent([]);
    setPreviewMode(false);
  };

  const handleContentUpdated = (updatedContent: any[]) => {
    setGeneratedContent(updatedContent);
  };

  const handleImageProgressUpdate = (progress: { current: number; total: number; isGenerating: boolean }) => {
    setImageGenerationProgress(progress);
  };

  return (
    <div className="space-y-6">
      <AdminContentGeneratorForm onContentGenerated={handleContentGenerated} />

      {previewMode && (
        <AdminContentPreview
          contentType={contentType}
          generatedContent={generatedContent}
          imageGenerationProgress={imageGenerationProgress}
          onContentCleared={handleContentCleared}
          onContentUpdated={handleContentUpdated}
          onImageProgressUpdate={handleImageProgressUpdate}
        />
      )}
    </div>
  );
};

export default AdminContentGenerator;
