
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, PlayCircle } from "lucide-react";

interface DataRecoveryActionsProps {
  stats: {
    missingLanguages: number;
    missingPrices: number;
    missingAllData: number;
  };
  isCompleting: boolean;
  selectedAction: 'languages' | 'prices' | 'all' | null;
  onRecovery: (action: 'languages' | 'prices' | 'all') => void;
}

const DataRecoveryActions = ({ stats, isCompleting, selectedAction, onRecovery }: DataRecoveryActionsProps) => {
  return (
    <div className="space-y-4">
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
              onClick={() => onRecovery('languages')}
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
              onClick={() => onRecovery('prices')}
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
              onClick={() => onRecovery('all')}
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
  );
};

export default DataRecoveryActions;
