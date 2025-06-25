
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, RefreshCw, Database, Camera } from "lucide-react";
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
              <span>Gestión de Datos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Herramientas para la gestión y mantenimiento de datos del directorio.
            </p>
            <Button variant="outline" className="w-full" disabled>
              <Database className="h-4 w-4 mr-2" />
              Validar Integridad de Datos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Acciones avanzadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Acciones Avanzadas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Gestionar Imágenes Reales
            </Button>
            <Button variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar Precios
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Estas funciones permiten gestión avanzada del contenido del directorio.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContentActions;
