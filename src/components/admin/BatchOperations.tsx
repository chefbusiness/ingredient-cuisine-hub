
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRegenerateImages } from "@/hooks/useRegenerateImages";
import { useToast } from "@/hooks/use-toast";
import { Image, Wand2, RefreshCw, AlertTriangle } from "lucide-react";

interface BatchOperationsProps {
  totalIngredients: number;
}

const BatchOperations = ({ totalIngredients }: BatchOperationsProps) => {
  const [operationProgress, setOperationProgress] = useState({ current: 0, total: 0, isRunning: false });
  const { mutate: regenerateImages, isPending } = useRegenerateImages();
  const { toast } = useToast();

  const handleRegenerateAllImages = () => {
    setOperationProgress({ current: 0, total: totalIngredients, isRunning: true });
    
    regenerateImages(undefined, {
      onSuccess: (result) => {
        setOperationProgress({ current: 0, total: 0, isRunning: false });
        toast({
          title: "✅ Regeneración completada",
          description: `Se regeneraron ${result.processed} imágenes`,
        });
      },
      onError: () => {
        setOperationProgress({ current: 0, total: 0, isRunning: false });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Operaciones en Lote
        </CardTitle>
        <CardDescription>
          Ejecuta acciones masivas sobre múltiples ingredientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {operationProgress.isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso de operación</span>
              <span>{operationProgress.current}/{operationProgress.total}</span>
            </div>
            <Progress 
              value={(operationProgress.current / operationProgress.total) * 100} 
              className="w-full"
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={handleRegenerateAllImages}
            disabled={isPending || operationProgress.isRunning}
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <Image className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Regenerar Imágenes</div>
              <div className="text-xs text-muted-foreground">
                Para ingredientes sin imagen
              </div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            disabled={true}
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <Wand2 className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Mejorar Contenido</div>
              <div className="text-xs text-muted-foreground">
                Próximamente
              </div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            disabled={true}
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <AlertTriangle className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Validar Datos</div>
              <div className="text-xs text-muted-foreground">
                Próximamente
              </div>
            </div>
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Total de ingredientes: {totalIngredients}
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchOperations;
