
import { CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AdminImageGenerationProgressProps {
  current: number;
  total: number;
  isGenerating: boolean;
}

const AdminImageGenerationProgress = ({ 
  current, 
  total, 
  isGenerating 
}: AdminImageGenerationProgressProps) => {
  if (!isGenerating) return null;

  return (
    <CardContent className="pt-0">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Generando imágenes con Flux 1.1 Pro</span>
          <span>{current}/{total}</span>
        </div>
        <Progress 
          value={(current / total) * 100} 
          className="w-full" 
        />
      </div>
    </CardContent>
  );
};

export default AdminImageGenerationProgress;
