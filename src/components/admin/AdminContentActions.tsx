
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, RefreshCw, Database } from "lucide-react";
import { useRegenerateImages } from "@/hooks/useRegenerateImages";

const AdminContentActions = () => {
  const regenerateImages = useRegenerateImages();

  const handleRegenerateImages = () => {
    regenerateImages.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Herramientas de contenido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Image className="h-5 w-5" />
              <span>Regenerar Imágenes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Genera imágenes para ingredientes que no tienen imagen asignada.
            </p>
            <Button 
              onClick={handleRegenerateImages}
              disabled={regenerateImages.isPending}
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerateImages.isPending ? 'animate-spin' : ''}`} />
              {regenerateImages.isPending ? 'Generando...' : 'Regenerar Imágenes Faltantes'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Actualización Automática</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Los precios se actualizan automáticamente de forma semanal para mantener la información actualizada.
            </p>
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <p>✅ Actualización automática configurada</p>
              <p>📅 Próxima actualización: cada domingo a las 02:00 UTC</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminContentActions;
