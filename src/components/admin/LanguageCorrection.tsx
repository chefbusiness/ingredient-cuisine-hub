
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Languages, AlertTriangle, CheckCircle, Loader } from "lucide-react";
import { useFixLatinoamericaNames } from "@/hooks/useFixLatinoamericaNames";

const LanguageCorrection = () => {
  const fixNames = useFixLatinoamericaNames();

  const handleFixNames = () => {
    fixNames.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Corrección de Nombres Latinoamericanos
        </CardTitle>
        <CardDescription>
          Corrige los nombres científicos incorrectos en el campo "Latinoamérica" y los reemplaza con sinónimos en español apropiados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-800 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Problema Detectado</span>
          </div>
          <p className="text-sm text-yellow-700 mb-3">
            Algunos ingredientes tienen nombres científicos en latín en el campo "Latinoamérica" en lugar de sinónimos en español.
          </p>
          <div className="space-y-1 text-sm">
            <div><strong>❌ Incorrecto:</strong> "Sus scrofa domesticus" (nombre científico)</div>
            <div><strong>✅ Correcto:</strong> "cochino, marrano, chancho" (sinónimos latinoamericanos)</div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Lo que hará esta corrección:</span>
          </div>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Identificar nombres científicos en el campo "Latinoamérica"</li>
            <li>Reemplazarlos con sinónimos apropiados en español</li>
            <li>Conservar nombres que ya estén correctos</li>
            <li>Usar el nombre español como fallback si no hay sinónimo</li>
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={handleFixNames}
            disabled={fixNames.isPending}
            className="flex items-center gap-2"
          >
            {fixNames.isPending ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Languages className="h-4 w-4" />
            )}
            {fixNames.isPending ? 'Corrigiendo...' : 'Corregir Nombres'}
          </Button>
          
          <Badge variant="outline" className="text-xs">
            Proceso seguro - conserva datos correctos
          </Badge>
        </div>

        {fixNames.isSuccess && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-green-800 text-sm">
              <strong>✅ Corrección completada:</strong>
              <br />
              • {fixNames.data?.corrected_count || 0} ingredientes corregidos
              <br />
              • {fixNames.data?.skipped_count || 0} ya estaban correctos
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LanguageCorrection;
