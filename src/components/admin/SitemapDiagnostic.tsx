import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const SitemapDiagnostic = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostic = async () => {
    setIsLoading(true);
    const diagnosticResults: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    try {
      // Test 1: Direct Edge Function call
      console.log('🔍 Testing direct Edge Function...');
      try {
        const directResponse = await fetch('https://unqhfgupcutpeyepnavl.supabase.co/functions/v1/generate-sitemap');
        diagnosticResults.tests.directFunction = {
          success: directResponse.ok,
          status: directResponse.status,
          contentType: directResponse.headers.get('content-type'),
          size: directResponse.headers.get('content-length')
        };
        
        if (directResponse.ok) {
          const content = await directResponse.text();
          diagnosticResults.tests.directFunction.preview = content.substring(0, 200) + '...';
          diagnosticResults.tests.directFunction.urlCount = (content.match(/<url>/g) || []).length;
        }
      } catch (error) {
        diagnosticResults.tests.directFunction = {
          success: false,
          error: error.message
        };
      }

      // Test 2: Site sitemap endpoint
      console.log('🔍 Testing site sitemap endpoint...');
      try {
        const siteResponse = await fetch('/sitemap.xml');
        diagnosticResults.tests.sitemap = {
          success: siteResponse.ok,
          status: siteResponse.status,
          contentType: siteResponse.headers.get('content-type'),
          redirected: siteResponse.redirected,
          url: siteResponse.url
        };

        if (siteResponse.ok) {
          const content = await siteResponse.text();
          diagnosticResults.tests.sitemap.preview = content.substring(0, 200) + '...';
          diagnosticResults.tests.sitemap.urlCount = (content.match(/<url>/g) || []).length;
        }
      } catch (error) {
        diagnosticResults.tests.sitemap = {
          success: false,
          error: error.message
        };
      }

      // Test 3: Cache busting test
      console.log('🔍 Testing with cache busting...');
      try {
        const cacheBustResponse = await fetch(`/sitemap.xml?v=${Date.now()}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        diagnosticResults.tests.cacheBust = {
          success: cacheBustResponse.ok,
          status: cacheBustResponse.status,
          contentType: cacheBustResponse.headers.get('content-type')
        };
      } catch (error) {
        diagnosticResults.tests.cacheBust = {
          success: false,
          error: error.message
        };
      }

      setResults(diagnosticResults);
      console.log('📊 Diagnostic completed:', diagnosticResults);
      
    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
      setResults({
        error: 'Diagnostic failed: ' + error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (success: boolean | undefined) => {
    if (success === true) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (success === false) return <XCircle className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Globe className="h-5 w-5" />
          Diagnóstico del Sitemap
        </CardTitle>
        <CardDescription>
          Verifica el estado del sitemap dinámico y detecta problemas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runDiagnostic}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Ejecutando diagnóstico...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Ejecutar Diagnóstico Completo
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground">
              Último test: {new Date(results.timestamp).toLocaleString()}
            </div>

            {results.tests?.directFunction && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Edge Function Directa:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.tests.directFunction.success)}
                    <Badge variant={results.tests.directFunction.success ? "default" : "destructive"}>
                      {results.tests.directFunction.status || 'ERROR'}
                    </Badge>
                  </div>
                </div>
                {results.tests.directFunction.urlCount && (
                  <div className="text-sm text-green-600">
                    ✅ URLs encontradas: {results.tests.directFunction.urlCount}
                  </div>
                )}
                {results.tests.directFunction.error && (
                  <div className="text-sm text-red-600">
                    ❌ Error: {results.tests.directFunction.error}
                  </div>
                )}
              </div>
            )}

            {results.tests?.sitemap && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Sitemap del Site:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.tests.sitemap.success)}
                    <Badge variant={results.tests.sitemap.success ? "default" : "destructive"}>
                      {results.tests.sitemap.status || 'ERROR'}
                    </Badge>
                  </div>
                </div>
                {results.tests.sitemap.urlCount && (
                  <div className="text-sm text-green-600">
                    ✅ URLs encontradas: {results.tests.sitemap.urlCount}
                  </div>
                )}
                {results.tests.sitemap.redirected && (
                  <div className="text-sm text-blue-600">
                    🔄 Redirigido a: {results.tests.sitemap.url}
                  </div>
                )}
                {results.tests.sitemap.error && (
                  <div className="text-sm text-red-600">
                    ❌ Error: {results.tests.sitemap.error}
                  </div>
                )}
              </div>
            )}

            {results.tests?.cacheBust && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Cache Busting:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.tests.cacheBust.success)}
                    <Badge variant={results.tests.cacheBust.success ? "default" : "destructive"}>
                      {results.tests.cacheBust.status || 'ERROR'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2 text-xs text-muted-foreground bg-blue-50 p-3 rounded">
          <div><strong>✅ Sitemap funcionando:</strong> Edge Function directa responde 200 + Site sitemap responde 200</div>
          <div><strong>🔄 Problema de cache:</strong> Edge Function OK pero site sitemap 404</div>
          <div><strong>❌ Edge Function rota:</strong> Edge Function directa falla</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SitemapDiagnostic;