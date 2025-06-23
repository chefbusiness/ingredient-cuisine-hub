
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Database } from "lucide-react";
import { useDataStatus, useCompleteIngredientsData } from "@/hooks/useDataRecovery";
import { useToast } from "@/hooks/use-toast";
import DataRecoveryStats from "./data-recovery/DataRecoveryStats";
import DataRecoveryActions from "./data-recovery/DataRecoveryActions";
import DataRecoveryStatus from "./data-recovery/DataRecoveryStatus";

const DataRecoveryPanel = () => {
  const { data: statusData, isLoading: isLoadingStatus, refetch } = useDataStatus();
  const { mutate: completeData, isPending: isCompleting } = useCompleteIngredientsData();
  const [selectedAction, setSelectedAction] = useState<'languages' | 'prices' | 'all' | null>(null);
  const { toast } = useToast();

  const stats = statusData?.stats;
  const ingredients = statusData?.ingredients || [];

  if (isLoadingStatus) {
    return (
      <Card>
        <CardContent className="p-6">
          <DataRecoveryStatus isLoading={true} needsRecovery={false} />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No se pudieron cargar las estadísticas de datos
          </div>
        </CardContent>
      </Card>
    );
  }

  const getIngredientsToComplete = (action: 'languages' | 'prices' | 'all') => {
    switch (action) {
      case 'languages':
        return ingredients.filter(ing => 
          !ing.name_fr || !ing.name_it || !ing.name_pt || !ing.name_zh
        ).map(ing => ing.id);
      case 'prices':
        return ingredients.filter(ing => !ing.ingredient_prices || ing.ingredient_prices.length === 0).map(ing => ing.id);
      case 'all':
        return ingredients.filter(ing => 
          (!ing.name_fr || !ing.name_it || !ing.name_pt || !ing.name_zh) ||
          (!ing.ingredient_prices || ing.ingredient_prices.length === 0) ||
          (!ing.ingredient_uses || ing.ingredient_uses.length === 0) ||
          (!ing.ingredient_recipes || ing.ingredient_recipes.length === 0)
        ).map(ing => ing.id);
      default:
        return [];
    }
  };

  const handleRecovery = (action: 'languages' | 'prices' | 'all') => {
    const ingredientIds = getIngredientsToComplete(action);
    if (ingredientIds.length === 0) {
      toast({
        title: "Sin ingredientes para completar",
        description: `No hay ingredientes que necesiten ${action === 'languages' ? 'idiomas' : action === 'prices' ? 'precios' : 'datos'}`,
      });
      return;
    }
    
    console.log(`🔄 Iniciando recuperación de ${action} para ${ingredientIds.length} ingredientes`);
    setSelectedAction(action);
    completeData({ 
      ingredientIds 
    }, {
      onSettled: () => {
        setSelectedAction(null);
        refetch();
      }
    });
  };

  const needsRecovery = stats.missingLanguages > 0 || stats.missingPrices > 0 || stats.missingAllData > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Estado de Integridad de Datos
          </CardTitle>
          <CardDescription>
            Análisis del estado actual de los datos de ingredientes y herramientas de recuperación automática
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <DataRecoveryStats stats={stats} />

          {needsRecovery && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Recuperación de Datos Disponible</span>
              </div>
              
              <DataRecoveryActions
                stats={stats}
                isCompleting={isCompleting}
                selectedAction={selectedAction}
                onRecovery={handleRecovery}
              />
            </div>
          )}

          <DataRecoveryStatus needsRecovery={needsRecovery} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DataRecoveryPanel;
