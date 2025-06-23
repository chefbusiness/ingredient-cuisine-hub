
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Zap, Globe, Search } from "lucide-react";
import LanguageCorrection from "./LanguageCorrection";
import AuditLogViewer from "./AuditLogViewer";

const AdminSettingsTab = () => {
  return (
    <div className="space-y-6">
      {/* Audit Log Viewer - Security Feature */}
      <AuditLogViewer />

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
            <div className="flex items-center justify-between">
              <span className="text-sm">Políticas RLS</span>
              <Badge className="bg-green-100 text-green-800">Habilitadas</Badge>
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
              <div className="flex items-center gap-2">
                <span className="text-sm">Perplexity API</span>
                <Badge className="bg-blue-100 text-blue-800">
                  <Globe className="h-3 w-3 mr-1" />
                  Datos Reales Web
                </Badge>
              </div>
              <Badge className="bg-green-100 text-green-800">Conectado</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">Perplexity Sonar</span>
                <Badge className="bg-green-100 text-green-800">
                  <Search className="h-3 w-3 mr-1" />
                  Investigación
                </Badge>
              </div>
              <Badge className="bg-green-100 text-green-800">Operativo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Replicate API (Flux)</span>
              <Badge className="bg-green-100 text-green-800">Conectado</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Generación de imágenes</span>
              <Badge className="bg-green-100 text-green-800">Operativo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Autenticación segura</span>
              <Badge className="bg-green-100 text-green-800">Habilitada</Badge>
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
            Configuraciones generales del sistema con investigación web real
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
              <label className="text-sm font-medium">Calidad de datos</label>
              <div className="mt-1">
                <Badge className="bg-blue-100 text-blue-800">
                  <Globe className="h-3 w-3 mr-1" />
                  Investigación Web
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800 space-y-2">
              <div className="font-medium">🌐 Fuentes de Datos Reales:</div>
              <div className="text-xs text-blue-600 space-y-1">
                <div>• Precios actuales de mercados mayoristas (Mercamadrid, Mercabarna)</div>
                <div>• Datos de merma de fuentes profesionales de hostelería</div>
                <div>• Información nutricional oficial (BEDCA, USDA, FAO)</div>
                <div>• Recetas auténticas de chefs y libros especializados</div>
                <div>• Temporadas verificadas en calendarios agrícolas oficiales</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsTab;
