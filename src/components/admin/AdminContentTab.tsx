
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Image, Camera } from "lucide-react";

interface AdminContentTabProps {
  ingredientsCount: number;
  categoriesCount: number;
}

const AdminContentTab = ({ ingredientsCount, categoriesCount }: AdminContentTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Contenido Existente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Herramientas para editar y gestionar el contenido existente del directorio.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Ingredientes</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {ingredientsCount} ingredientes registrados
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/directorio">Ver Lista</Link>
              </Button>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Categorías</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {categoriesCount} categorías disponibles
              </p>
              <Button variant="outline" size="sm">Gestionar</Button>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Sistema de Imágenes Híbrido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Image className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Ilustraciones AI (Flux 1.1 Pro)</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Ilustraciones minimalistas y delicadas generadas automáticamente. 
                    <Badge variant="secondary" className="ml-2">Imagen Principal</Badge>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Fotografías Reales</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Galería de imágenes reales subidas por administradores y usuarios.
                    <Badge variant="secondary" className="ml-2">Galería Secundaria</Badge>
                  </p>
                  <div className="mt-3">
                    <Button size="sm" variant="outline">
                      Gestionar Imágenes Reales
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Nuevo sistema:</strong> Las ilustraciones AI proporcionan una representación 
                consistente y reconocible, mientras que las fotografías reales ofrecen autenticidad 
                y variedad visual.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContentTab;
