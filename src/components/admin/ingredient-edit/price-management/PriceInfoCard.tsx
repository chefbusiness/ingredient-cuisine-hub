
import { Card, CardContent } from "@/components/ui/card";

const PriceInfoCard = () => {
  return (
    <div className="mt-6 p-3 bg-blue-50 rounded-lg">
      <p className="text-xs text-blue-700 mb-1">
        <strong>💡 Información sobre precios:</strong>
      </p>
      <ul className="text-xs text-blue-600 space-y-1">
        <li>• Los precios se muestran en euros por unidad especificada</li>
        <li>• Los precios marcados como "Revisar" están fuera del rango típico HORECA</li>
        <li>• España se marca como país principal para referencia</li>
        <li>• Las variaciones estacionales son opcionales pero recomendadas</li>
      </ul>
    </div>
  );
};

export default PriceInfoCard;
