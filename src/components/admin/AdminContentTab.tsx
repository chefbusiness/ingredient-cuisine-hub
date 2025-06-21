
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Package, Image, RefreshCw, Tag, Camera } from "lucide-react";
import { useRegenerateImages, useFixCategorization } from "@/hooks/useContentGeneration";

interface AdminContentTabProps {
  ingredientsCount: number;
  categoriesCount: number;
}

const AdminContentTab = ({ ingredientsCount, categoriesCount }: AdminContentTabProps) => {
  const regenerateImages = useRegenerateImages();
  const fixCategorization = useFixCategorization();

  const handleRegenerateImages = () => {
    regenerateImages.mutate();
  };

  const handleFixCategorization = () => {
    fixCategorization.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Gestión de Contenido</h2>
        <p className="text-muted-foreground">
          Administra ingredientes, categorías, precios e imágenes del directorio.
        </p>
      </div>

      {/* Estadísticas de contenido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingredientes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ingredientsCount}</div>
            <p className="text-xs text-muted-foreground">
              Ingredientes en la base de datos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoriesCount}</div>
            <p className="text-xs text-muted-foreground">
              Categorías disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Activo
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Sistema funcionando correctamente
            </p>
          </CardContent>
        </Card>
      </div>

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
              <span>Corregir Categorización</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Corrige la categorización de especias que están mal clasificadas.
            </p>
            <Button 
              onClick={handleFixCategorization}
              disabled={fixCategorization.isPending}
              variant="outline"
              className="w-full"
            >
              <Tag className="h-4 w-4 mr-2" />
              {fixCategorization.isPending ? 'Corrigiendo...' : 'Corregir Categorías'}
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

export default AdminContentTab;
