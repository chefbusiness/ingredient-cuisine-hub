
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface DataRecoveryStatsProps {
  stats: {
    total: number;
    withMultipleLanguages: number;
    withPrices: number;
    withUses: number;
    missingAllData: number;
  };
}

const DataRecoveryStats = ({ stats }: DataRecoveryStatsProps) => {
  const completenessPercentage = stats.total > 0 
    ? Math.round(((stats.total - stats.missingAllData) / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default DataRecoveryStats;
