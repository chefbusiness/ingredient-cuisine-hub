
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, RefreshCw, Tag, Database, Camera, AlertTriangle, CheckCircle } from "lucide-react";
import { useRegenerateImages } from "@/hooks/useRegenerateImages";
import { useFixCategorization } from "@/hooks/useFixCategorization";

const AdminContentActions = () => {
  const regenerateImages = useRegenerateImages();
  const fixCategorization = useFixCategorization();

  const handleRegenerateImages = () => {
    regenerateImages.mutate();
  };

  const handleFixCategorization = () => {
    console.log('Usuario hizo clic en corregir categorización');
    fixCategorization.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Banner de corrección de categorización */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            {fixCategorization.isPending ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : fixCategorization.isSuccess ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            {fixCategorization.isPending 
              ? 'Corrigiendo Categorización...'
              : fixCategorization.isSuccess 
                ? 'Categorización Corregida'
                : 'Corrección de Categorización de Especias'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fixCategorization.isPending ? (
            <p className="text-sm text-orange-700 mb-4">
              Procesando ingredientes de especias... Por favor espera.
            </p>
          ) : fixCategorization.isSuccess ? (
            <p className="text-sm text-green-700 mb-4">
              ✅ Categorización completada exitosamente. Los ingredientes de especias han sido movidos a la categoría correcta.
            </p>
          ) : (
            <p className="text-sm text-orange-700 mb-4">
              Se han detectado ingredientes de especias (Pimentón, Pimienta negra, Azafrán, etc.) que están mal categorizados. Haz clic para corregir automáticamente.
            </p>
          )}
          
          <Button 
            onClick={handleFixCategorization}
            disabled={fixCategorization.isPending || fixCategorization.isSuccess}
            className={fixCategorization.isSuccess 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-orange-600 hover:bg-orange-700"
            }
          >
            <Tag className={`h-4 w-4 mr-2 ${fixCategorization.isPending ? 'animate-spin' : ''}`} />
            {fixCategorization.isPending 
              ? 'Corrigiendo Categorías...' 
              : fixCategorization.isSuccess
                ? 'Categorización Completada'
                : 'Corregir Categorización de Especias'
            }
          </Button>
        </CardContent>
      </Card>

      {/* Herramientas de corrección */}
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
              <Tag className="h-5 w-5" />
              <span>Validar Categorización</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Verifica y corrige ingredientes que pueden estar mal categorizados.
            </p>
            <Button 
              onClick={handleFixCategorization}
              disabled={fixCategorization.isPending}
              variant="outline"
              className="w-full"
            >
              <Tag className="h-4 w-4 mr-2" />
              {fixCategorization.isPending ? 'Validando...' : 'Validar Categorías'}
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
