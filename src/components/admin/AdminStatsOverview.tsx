
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Wand2, BarChart3, Zap } from "lucide-react";

interface AdminStatsOverviewProps {
  ingredientsCount: number;
  categoriesCount: number;
}

const AdminStatsOverview = ({ ingredientsCount, categoriesCount }: AdminStatsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ingredientes</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ingredientsCount}</div>
          <p className="text-xs text-muted-foreground">En la base de datos</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categorías</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{categoriesCount}</div>
          <p className="text-xs text-muted-foreground">Categorías disponibles</p>
        </CardContent>
      </Card>
      
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">DeepSeek AI</CardTitle>
          <Wand2 className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-800">Activo</div>
          <p className="text-xs text-green-600">Generación de contenido</p>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Flux 1.1 Pro</CardTitle>
          <Zap className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800">Activo</div>
          <p className="text-xs text-blue-600">Imágenes profesionales</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatsOverview;
