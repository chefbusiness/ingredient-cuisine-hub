
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGenerateMissingImages } from "@/hooks/useGenerateMissingImages";
import { useToast } from "@/hooks/use-toast";
import { Image, Wand2, RefreshCw, AlertTriangle, Zap } from "lucide-react";

interface BatchOperationsProps {
  totalIngredients: number;
}

interface ImageGenerationProgress {
  current: number;
  total: number;
  isGenerating: boolean;
}

const BatchOperations = ({ totalIngredients }: BatchOperationsProps) => {
  const [imageProgress, setImageProgress] = useState<ImageGenerationProgress>({ 
    current: 0, 
    total: 0, 
    isGenerating: false 
  });
  
  const { toast } = useToast();
  
  const { mutate: generateMissingImages, isPending } = useGenerateMissingImages(
    (progress) => setImageProgress(progress)
  );

  const handleRegenerateAllImages = () => {
    toast({
      title: "🚀 Iniciando regeneración masiva",
      description: "Esto puede tomar varios minutos...",
    });
    
    generateMissingImages();
  };

  const progressPercentage = imageProgress.total > 0 
    ? (imageProgress.current / imageProgress.total) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Operaciones en Lote
          <div className="ml-auto flex items-center gap-1 text-sm text-green-600">
            <Zap className="h-4 w-4" />
            Flux 1.1 Pro
          </div>
        </CardTitle>
        <CardDescription>
          Ejecuta acciones masivas sobre múltiples ingredientes usando IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {(isPending || imageProgress.isGenerating) && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {imageProgress.isGenerating ? 
                  `Generando imágenes con Flux 1.1 Pro...` : 
                  'Iniciando regeneración...'
                }
              </span>
              <span className="text-muted-foreground">
                {imageProgress.current}/{imageProgress.total}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="w-full h-2"
            />
            <div className="text-xs text-muted-foreground">
              Cada imagen toma ~10-15 segundos en generarse con Flux 1.1 Pro
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleRegenerateAllImages}
            disabled={isPending || imageProgress.isGenerating}
            className="h-auto p-6 flex flex-col items-center gap-3 bg-green-600 hover:bg-green-700"
          >
            <div className="flex items-center gap-2">
              <Image className="h-6 w-6" />
              <Zap className="h-4 w-4" />
            </div>
            <div className="text-center">
              <div className="font-medium">Regenerar Todas las Imágenes</div>
              <div className="text-xs opacity-90 mt-1">
                Con Flux 1.1 Pro - Ingredientes sin imagen
              </div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            disabled={true}
            className="h-auto p-6 flex flex-col items-center gap-3"
          >
            <Wand2 className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Mejorar Contenido</div>
              <div className="text-xs text-muted-foreground mt-1">
                Próximamente
              </div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            disabled={true}
            className="h-auto p-6 flex flex-col items-center gap-3"
          >
            <AlertTriangle className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Validar Datos</div>
              <div className="text-xs text-muted-foreground mt-1">
                Próximamente
              </div>
            </div>
          </Button>
        </div>
        
        <div className="flex justify-between items-center text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <span>Total de ingredientes: {totalIngredients}</span>
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Flux 1.1 Pro
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchOperations;
