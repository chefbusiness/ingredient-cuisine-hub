
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGenerateMissingImages } from "@/hooks/useGenerateMissingImages";
import { useUpdateIngredientPrices } from "@/hooks/useUpdateIngredientPrices";
import { useToast } from "@/hooks/use-toast";
import { Image, Wand2, RefreshCw, AlertTriangle, Zap, DollarSign } from "lucide-react";

interface BatchOperationsProps {
  totalIngredients: number;
}

interface ImageGenerationProgress {
  current: number;
  total: number;
  isGenerating: boolean;
}

interface PriceUpdateProgress {
  current: number;
  total: number;
  isUpdating: boolean;
  status: string;
}

const BatchOperations = ({ totalIngredients }: BatchOperationsProps) => {
  const [imageProgress, setImageProgress] = useState<ImageGenerationProgress>({ 
    current: 0, 
    total: 0, 
    isGenerating: false 
  });
  
  const [priceProgress, setPriceProgress] = useState<PriceUpdateProgress>({ 
    current: 0, 
    total: 0, 
    isUpdating: false,
    status: ''
  });
  
  const { toast } = useToast();
  
  const { mutate: generateMissingImages, isPending: isGeneratingImages } = useGenerateMissingImages(
    (progress) => setImageProgress(progress)
  );

  const { mutate: updateIngredientPrices, isPending: isUpdatingPrices } = useUpdateIngredientPrices(
    (progress) => setPriceProgress({
      current: progress.current,
      total: progress.total,
      isUpdating: true,
      status: progress.status
    })
  );

  const handleRegenerateAllImages = () => {
    toast({
      title: "🚀 Iniciando regeneración masiva",
      description: "Esto puede tomar varios minutos...",
    });
    
    generateMissingImages();
  };

  const handleUpdateAllPrices = () => {
    toast({
      title: "💰 Iniciando actualización de precios HORECA",
      description: "Esto puede tomar varios minutos, se usarán fuentes mayoristas profesionales...",
    });
    
    setPriceProgress({
      current: 0,
      total: 100,
      isUpdating: true,
      status: 'Preparando actualización...'
    });
    
    updateIngredientPrices({ 
      mode: 'problematic',  // Solo ingredientes con precios problemáticos
      batchSize: 5 
    });
  };

  const imageProgressPercentage = imageProgress.total > 0 
    ? (imageProgress.current / imageProgress.total) * 100 
    : 0;

  const priceProgressPercentage = priceProgress.total > 0 
    ? (priceProgress.current / priceProgress.total) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Operaciones en Lote
          <div className="ml-auto flex items-center gap-1 text-sm text-green-600">
            <Zap className="h-4 w-4" />
            Flux 1.1 Pro + Perplexity Sonar
          </div>
        </CardTitle>
        <CardDescription>
          Ejecuta acciones masivas sobre múltiples ingredientes usando IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress bars */}
        {(isGeneratingImages || imageProgress.isGenerating) && (
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
              value={imageProgressPercentage} 
              className="w-full h-2"
            />
            <div className="text-xs text-muted-foreground">
              Cada imagen toma ~10-15 segundos en generarse con Flux 1.1 Pro
            </div>
          </div>
        )}

        {(isUpdatingPrices || priceProgress.isUpdating) && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                Actualizando precios HORECA con Perplexity Sonar...
              </span>
              <span className="text-muted-foreground">
                {priceProgress.current}/{priceProgress.total}
              </span>
            </div>
            <Progress 
              value={priceProgressPercentage} 
              className="w-full h-2"
            />
            <div className="text-xs text-muted-foreground">
              {priceProgress.status}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleRegenerateAllImages}
            disabled={isGeneratingImages || imageProgress.isGenerating || isUpdatingPrices}
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
            onClick={handleUpdateAllPrices}
            disabled={isUpdatingPrices || priceProgress.isUpdating || isGeneratingImages}
            className="h-auto p-6 flex flex-col items-center gap-3 bg-blue-600 hover:bg-blue-700"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              <Zap className="h-4 w-4" />
            </div>
            <div className="text-center">
              <div className="font-medium">Actualizar Precios HORECA</div>
              <div className="text-xs opacity-90 mt-1">
                Solo precios problemáticos - Fuentes mayoristas
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
        </div>
        
        <div className="flex justify-between items-center text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <span>Total de ingredientes: {totalIngredients}</span>
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Flux 1.1 Pro + Perplexity Sonar
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchOperations;
