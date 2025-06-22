
import { CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Loader } from "lucide-react";

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
  if (!isGenerating && current === 0) return null;

  const percentage = total > 0 ? (current / total) * 100 : 0;
  const isComplete = current === total && total > 0;

  return (
    <CardContent className="pt-0">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <Loader className="h-4 w-4 animate-spin text-blue-600" />
            ) : isComplete ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            )}
            <span className="text-sm font-medium">
              {isGenerating 
                ? 'Generando imágenes con Flux 1.1 Pro...'
                : isComplete 
                  ? 'Generación de imágenes completada'
                  : 'Generación de imágenes pausada'
              }
            </span>
          </div>
          <Badge variant={isComplete ? "default" : "secondary"}>
            {current}/{total}
          </Badge>
        </div>
        
        <Progress 
          value={percentage} 
          className="w-full h-2" 
        />
        
        {isGenerating && (
          <div className="text-xs text-muted-foreground">
            Procesando ingrediente {current} de {total}. Esto puede tomar unos minutos...
          </div>
        )}
        
        {isComplete && !isGenerating && (
          <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
            ✅ Todas las imágenes han sido generadas exitosamente
          </div>
        )}
      </div>
    </CardContent>
  );
};

export default AdminImageGenerationProgress;
