
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const AdminSettingsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de las APIs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border-green-200 bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h3 className="font-semibold text-green-800">DeepSeek API</h3>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-sm text-green-700">
              Generación de contenido de ingredientes, categorías y precios
            </p>
            <div className="mt-2 text-xs text-green-600">
              ✓ API Key configurada correctamente
            </div>
          </Card>
          
          <Card className="p-4 border-blue-200 bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h3 className="font-semibold text-blue-800">Replicate (Flux 1.1 Pro)</h3>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-sm text-blue-700">
              Generación de imágenes realistas de calidad profesional para ingredientes
            </p>
            <div className="mt-2 text-xs text-blue-600">
              ✓ API Key configurada correctamente
            </div>
          </Card>
        </div>
        
        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-2">Funcionalidades Disponibles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Generación de ingredientes por categoría</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Creación de nuevas categorías</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Actualización automática de precios</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Generación de imágenes realistas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Información nutricional detallada</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Usos culinarios profesionales</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Imágenes profesionales con Flux 1.1 Pro</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Calidad optimizada para fotografía culinaria</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSettingsTab;
