
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Languages, Zap } from "lucide-react";
import LanguageCorrection from "./LanguageCorrection";

const AdminSettingsTab = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configuración de Base de Datos
            </CardTitle>
            <CardDescription>
              Configuraciones relacionadas con la base de datos y el rendimiento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Caché de ingredientes</span>
              <Badge variant="outline">Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Optimización de consultas</span>
              <Badge variant="outline">Habilitado</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Índices de búsqueda</span>
              <Badge variant="outline">Optimizado</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              APIs Externas
            </CardTitle>
            <CardDescription>
              Estado de las integraciones con servicios externos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">DeepSeek API</span>
              <Badge className="bg-green-100 text-green-800">Conectado</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Replicate API (Flux)</span>
              <Badge className="bg-green-100 text-green-800">Conectado</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Generación de imágenes</span>
              <Badge className="bg-green-100 text-green-800">Operativo</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Componente de corrección de idiomas */}
      <LanguageCorrection />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración General
          </CardTitle>
          <CardDescription>
            Configuraciones generales del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Idioma predeterminado</label>
              <div className="mt-1">
                <Badge variant="outline">Español (ES)</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Moneda predeterminada</label>
              <div className="mt-1">
                <Badge variant="outline">Euro (EUR)</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Región principal</label>
              <div className="mt-1">
                <Badge variant="outline">España</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Modo de desarrollo</label>
              <div className="mt-1">
                <Badge variant="outline">Deshabilitado</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsTab;
