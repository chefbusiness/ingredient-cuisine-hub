
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

interface ProgressUpdate {
  current: number;
  total: number;
  currentIngredient?: string;
  status: 'processing' | 'success' | 'error';
  message?: string;
}

interface ContentGenerationProgressProps {
  progress: ProgressUpdate | null;
  isVisible: boolean;
}

const ContentGenerationProgress = ({ progress, isVisible }: ContentGenerationProgressProps) => {
  if (!isVisible || !progress) return null;

  const progressPercentage = (progress.current / progress.total) * 100;

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'processing':
        return <Loader className="h-4 w-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-medium text-sm">
            Procesando ingredientes ({progress.current}/{progress.total})
          </span>
        </div>
        <Badge className={getStatusColor()}>
          {Math.round(progressPercentage)}%
        </Badge>
      </div>

      <Progress value={progressPercentage} className="w-full" />

      {progress.currentIngredient && (
        <div className="text-xs text-muted-foreground">
          Procesando: <span className="font-medium">{progress.currentIngredient}</span>
        </div>
      )}

      {progress.message && (
        <div className="text-xs text-muted-foreground">
          {progress.message}
        </div>
      )}
    </div>
  );
};

export default ContentGenerationProgress;
