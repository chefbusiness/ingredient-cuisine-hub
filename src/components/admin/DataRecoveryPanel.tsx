
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Database, RefreshCw, CheckCircle } from "lucide-react";
import { useDataStatus, useCompleteIngredientsData } from "@/hooks/useDataRecovery";

const DataRecoveryPanel = () => {
  const { data: statusData, isLoading: isLoadingStatus } = useDataStatus();
  const { mutate: completeData, isPending: isCompleting } = useCompleteIngredientsData();
  const [selectedAction, setSelectedAction] = useState<'languages' | 'prices' | 'all' | null>(null);

  if (isLoadingStatus) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Verificando estado de los datos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = statusData?.stats;
  const ingredients = statusData?.ingredients || [];

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
        return ingredients.filter(ing => !ing.name_la && !ing.name_fr && !ing.name_it).map(ing => ing.id);
      case 'prices':
        return ingredients.filter(ing => !ing.ingredient_prices || ing.ingredient_prices.length === 0).map(ing => ing.id);
      case 'all':
        return ingredients.filter(ing => 
          (!ing.name_la && !ing.name_fr && !ing.name_it) ||
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
      return;
    }
    
    setSelectedAction(action);
    completeData({ ingredientIds });
  };

  const completenessPercentage = stats.total > 0 
    ? Math.round(((stats.total - stats.missingAllData) / stats.total) * 100)
    : 0;

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
            Análisis del estado actual de los datos de ingredientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estado general */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completitud General</span>
              <span className="text-sm text-muted-foreground">{completenessPercentage}%</span>
            </div>
            <Progress value={completenessPercentage} className="h-2" />
          </div>

          {/* Estadísticas detalladas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Ingredientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.withMultipleLanguages}</div>
              <div className="text-xs text-muted-foreground">Con Idiomas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.withPrices}</div>
              <div className="text-xs text-muted-foreground">Con Precios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.withUses}</div>
              <div className="text-xs text-muted-foreground">Con Usos</div>
            </div>
          </div>

          {/* Problemas detectados */}
          {needsRecovery && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Problemas Detectados</span>
              </div>
              
              <div className="space-y-2">
                {stats.missingLanguages > 0 && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Badge variant="outline" className="mr-2">{stats.missingLanguages}</Badge>
                      <span className="text-sm">Ingredientes sin traducciones</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRecovery('languages')}
                      disabled={isCompleting}
                    >
                      {isCompleting && selectedAction === 'languages' ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                      ) : null}
                      Completar Idiomas
                    </Button>
                  </div>
                )}

                {stats.missingPrices > 0 && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Badge variant="outline" className="mr-2">{stats.missingPrices}</Badge>
                      <span className="text-sm">Ingredientes sin precios</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRecovery('prices')}
                      disabled={isCompleting}
                    >
                      {isCompleting && selectedAction === 'prices' ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                      ) : null}
                      Completar Precios
                    </Button>
                  </div>
                )}

                {stats.missingAllData > 0 && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Badge variant="destructive" className="mr-2">{stats.missingAllData}</Badge>
                      <span className="text-sm">Ingredientes con datos incompletos</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRecovery('all')}
                      disabled={isCompleting}
                    >
                      {isCompleting && selectedAction === 'all' ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                      ) : null}
                      Recuperar Todo
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Estado saludable */}
          {!needsRecovery && (
            <div className="flex items-center gap-2 text-green-600 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Todos los datos están completos</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataRecoveryPanel;
