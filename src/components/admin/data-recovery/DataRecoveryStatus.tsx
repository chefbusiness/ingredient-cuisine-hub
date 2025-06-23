
import { CheckCircle, RefreshCw } from "lucide-react";

interface DataRecoveryStatusProps {
  isLoading?: boolean;
  needsRecovery: boolean;
}

const DataRecoveryStatus = ({ isLoading, needsRecovery }: DataRecoveryStatusProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Verificando estado de los datos...</span>
      </div>
    );
  }

  if (!needsRecovery) {
    return (
      <div className="flex items-center gap-2 text-green-600 p-4 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="h-5 w-5" />
        <div>
          <p className="font-medium">¡Datos Completos!</p>
          <p className="text-sm">Todos los ingredientes tienen la información necesaria</p>
        </div>
      </div>
    );
  }

  return null;
};

export default DataRecoveryStatus;
