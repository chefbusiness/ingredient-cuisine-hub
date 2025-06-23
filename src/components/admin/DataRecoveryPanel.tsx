import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Database, RefreshCw, CheckCircle, PlayCircle } from "lucide-react";
import { useDataStatus, useCompleteIngredientsData } from "@/hooks/useDataRecovery";
import { useToast } from "@/hooks/use-toast";

const DataRecoveryPanel = () => {
  const { data: statusData, isLoading: isLoadingStatus, refetch } = useDataStatus();
  const { mutate: completeData, isPending: isCompleting } = useCompleteIngredientsData();
  const [selectedAction, setSelectedAction] = useState<'languages' | 'prices' | 'all' | null>(null);
  const { toast } = useToast();

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
        // Buscar ingredientes que faltan francés, italiano, portugués o chino
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
        refetch(); // Actualizar estadísticas después de completar
      }
    });
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
            Análisis del estado actual de los datos de ingredientes y herramientas de recuperación automática
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
            <p className="text-xs text-muted-foreground">
              {stats.total - stats.missingAllData} de {stats.total} ingredientes con datos completos
            </p>
          </div>

          {/* Estadísticas detalladas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Ingredientes</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.withMultipleLanguages}</div>
              <div className="text-xs text-muted-foreground">Con Todos los Idiomas</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.withPrices}</div>
              <div className="text-xs text-muted-foreground">Con Precios</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.withUses}</div>
              <div className="text-xs text-muted-foreground">Con Usos Culinarios</div>
            </div>
          </div>

          {/* Acciones de recuperación */}
          {needsRecovery && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Recuperación de Datos Disponible</span>
              </div>
              
              <div className="grid gap-3">
                {stats.missingLanguages > 0 && (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-white">{stats.missingLanguages}</Badge>
                      <div>
                        <p className="font-medium">Idiomas Faltantes</p>
                        <p className="text-sm text-muted-foreground">Completar francés, italiano, portugués y chino</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRecovery('languages')}
                      disabled={isCompleting}
                      className="bg-white hover:bg-blue-50"
                    >
                      {isCompleting && selectedAction === 'languages' ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <PlayCircle className="h-4 w-4 mr-1" />
                      )}
                      Completar Idiomas
                    </Button>
                  </div>
                )}

                {stats.missingPrices > 0 && (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-orange-100">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-white">{stats.missingPrices}</Badge>
                      <div>
                        <p className="font-medium">Precios Faltantes</p>
                        <p className="text-sm text-muted-foreground">Generar precios por países y unidades</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRecovery('prices')}
                      disabled={isCompleting}
                      className="bg-white hover:bg-orange-50"
                    >
                      {isCompleting && selectedAction === 'prices' ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <PlayCircle className="h-4 w-4 mr-1" />
                      )}
                      Completar Precios
                    </Button>
                  </div>
                )}

                {stats.missingAllData > 0 && (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-red-50 to-red-100">
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive" className="bg-white text-red-600">{stats.missingAllData}</Badge>
                      <div>
                        <p className="font-medium">Datos Críticos Faltantes</p>
                        <p className="text-sm text-muted-foreground">Completar todos los datos: idiomas, precios, usos y recetas</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRecovery('all')}
                      disabled={isCompleting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isCompleting && selectedAction === 'all' ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <PlayCircle className="h-4 w-4 mr-1" />
                      )}
                      Recuperación Completa
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Nota:</strong> La recuperación usa IA (Perplexity) para generar datos faltantes con información real de internet. 
                  El proceso puede tomar varios minutos dependiendo de la cantidad de ingredientes.
                </p>
              </div>
            </div>
          )}

          {/* Estado saludable */}
          {!needsRecovery && (
            <div className="flex items-center gap-2 text-green-600 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">¡Datos Completos!</p>
                <p className="text-sm">Todos los ingredientes tienen la información necesaria</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataRecoveryPanel;
