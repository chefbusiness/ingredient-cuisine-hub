import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGenerateMissingImages } from "@/hooks/useGenerateMissingImages";
import { useUpdateIngredientPrices } from "@/hooks/useUpdateIngredientPrices";
import { useToast } from "@/hooks/use-toast";
import { Image, Wand2, RefreshCw, AlertTriangle, Zap, DollarSign, Clock, Settings } from "lucide-react";
import IngredientPriceSelector from "./IngredientPriceSelector";

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
    (progress) => {
      console.log('📊 Progreso recibido en BatchOperations:', progress);
      setPriceProgress({
        current: progress.current,
        total: progress.total,
        isUpdating: true,
        status: progress.status
      });
    }
  );

  const handleRegenerateAllImages = () => {
    toast({
      title: "🚀 Iniciando regeneración masiva",
      description: "Esto puede tomar varios minutos...",
    });
    
    generateMissingImages();
  };

  const handleUpdateAllPrices = () => {
    console.log('🎯 Iniciando actualización optimizada de precios HORECA con sistema de fallback...');
    
    toast({
      title: "💰 Iniciando investigación profunda de precios HORECA con sistema de fallback",
      description: "Procesando ingredientes problemáticos con Sonar Deep Research (hasta 5 min) + fallback automático a modelo estándar si es necesario...",
    });
    
    setPriceProgress({
      current: 0,
      total: 100,
      isUpdating: true,
      status: 'Preparando investigación HORECA profunda con Sonar Deep Research + sistema de fallback (Timeout: 5 min + fallback automático)...'
    });
    
    updateIngredientPrices({ 
      mode: 'problematic',
      batchSize: 1
    });
  };

  const imageProgressPercentage = imageProgress.total > 0 
    ? (imageProgress.current / imageProgress.total) * 100 
    : 0;

  const priceProgressPercentage = priceProgress.total > 0 
    ? (priceProgress.current / priceProgress.total) * 100 
    : 0;

  return (
    <div className="space-y-6">
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
            <span className="font-medium text-blue-700">
              🔍 Investigación profunda HORECA con Sonar Deep Research + Fallback Automático
            </span>
            <span className="text-muted-foreground">
              {priceProgress.current > 0 ? `${priceProgress.current} procesados` : 'Iniciando...'}
            </span>
          </div>
          <Progress 
            value={priceProgressPercentage} 
            className="w-full h-3 bg-blue-100"
          />
          <div className="text-xs text-blue-600 font-medium">
            {priceProgress.status}
          </div>
          <div className="text-xs text-muted-foreground">
            🏢 Proceso optimizado con fallback: 1 ingrediente → Deep Research (5 min) → Si falla: Modelo estándar (1 min) → Actualización → Siguiente
          </div>
        </div>
      )}

      {/* Operaciones Automáticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Operaciones Automáticas
            <div className="ml-auto flex items-center gap-1 text-sm text-green-600">
              <Zap className="h-4 w-4" />
              Flux 1.1 Pro + Sonar Deep Research + Fallback
            </div>
          </CardTitle>
          <CardDescription>
            Ejecuta acciones masivas automáticas sobre múltiples ingredientes usando IA con sistema de fallback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <Clock className="h-4 w-4" />
              </div>
              <div className="text-center">
                <div className="font-medium">Actualizar Precios Problemáticos</div>
                <div className="text-xs opacity-90 mt-1">
                  Deep Research (5 min) + Fallback automático
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
              <Clock className="h-3 w-3" />
              Sistema anti-timeout: Deep Research (300s) + Fallback automático
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Nueva Sección: Actualización Manual */}
      <IngredientPriceSelector 
        onProgress={(progress) => {
          setPriceProgress({
            current: progress.current,
            total: progress.total,
            isUpdating: true,
            status: progress.status
          });
        }}
      />

      {/* Info mejorada cuando esté actualizando precios */}
      {(isUpdatingPrices || priceProgress.isUpdating) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800">
            <div className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              🔍 Proceso Optimizado con Sistema de Fallback Inteligente:
            </div>
            <div className="mt-1 space-y-1 text-xs">
              <div>• <strong>PASO 1:</strong> Intento Sonar Deep Research (timeout: 5 minutos)</div>
              <div>• <strong>PASO 2:</strong> Si falla → Fallback automático a Sonar Online estándar (1 minuto)</div>
              <div>• Procesando 1 ingrediente cada vez para máxima estabilidad</div>
              <div>• Consulta optimizada a 4 países (reducida de 6) para mayor velocidad</div>
              <div>• Pausa de 2 segundos entre ingredientes para evitar saturación</div>
              <div>• Sistema de doble tolerancia: Deep Research + Fallback garantizan resultado</div>
              <div>• Logging detallado para monitorear tiempo de cada modelo</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchOperations;
