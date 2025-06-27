
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTestConnection } from "@/hooks/useTestConnection";
import { Loader2, Wrench, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const DiagnosticPanel = () => {
  const [lastTestResult, setLastTestResult] = useState<any>(null);
  const { mutate: testConnection, isPending } = useTestConnection();

  const handleTest = async () => {
    try {
      const result = await testConnection();
      setLastTestResult(result);
    } catch (error) {
      console.error('Test failed:', error);
      setLastTestResult({ success: false, error: error.message });
    }
  };

  const getStatusIcon = (status: boolean | undefined) => {
    if (status === true) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === false) return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Wrench className="h-5 w-5" />
          Diagnóstico del Sistema
        </CardTitle>
        <CardDescription>
          Verifica el estado de las Edge Functions y las conexiones API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleTest}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Ejecutando diagnóstico...
            </>
          ) : (
            <>
              <Wrench className="h-4 w-4 mr-2" />
              Ejecutar Test de Diagnóstico
            </>
          )}
        </Button>

        {lastTestResult && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Estado General:</span>
              <Badge variant={lastTestResult.success ? "default" : "destructive"}>
                {lastTestResult.success ? "FUNCIONANDO" : "CON PROBLEMAS"}
              </Badge>
            </div>

            {lastTestResult.environment_variables && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Variables de Entorno:</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Supabase URL:</span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(lastTestResult.environment_variables.supabase_url_present)}
                      <span>{lastTestResult.environment_variables.supabase_url_present ? 'Configurada' : 'Falta'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Supabase Key:</span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(lastTestResult.environment_variables.supabase_key_present)}
                      <span>{lastTestResult.environment_variables.supabase_key_present ? 'Configurada' : 'Falta'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Perplexity API Key:</span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(lastTestResult.environment_variables.perplexity_key_present)}
                      <span>
                        {lastTestResult.environment_variables.perplexity_key_present 
                          ? `Configurada (${lastTestResult.environment_variables.perplexity_key_length} chars)` 
                          : 'Falta'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {lastTestResult.connectivity_tests && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Tests de Conectividad:</h4>
                <div className="flex items-center justify-between text-sm">
                  <span>Perplexity API:</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(lastTestResult.connectivity_tests.perplexity_api)}
                    <span>{lastTestResult.connectivity_tests.perplexity_api ? 'Conectado' : 'Sin conexión'}</span>
                  </div>
                </div>
              </div>
            )}

            {lastTestResult.timestamp && (
              <div className="text-xs text-muted-foreground">
                Último test: {new Date(lastTestResult.timestamp).toLocaleString()}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
          💡 <strong>Tip:</strong> Si Perplexity API Key está configurada pero la conectividad falla, 
          puede ser un problema temporal de red o de la API externa.
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticPanel;
