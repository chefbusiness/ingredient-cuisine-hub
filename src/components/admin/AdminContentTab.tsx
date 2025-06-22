
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wand2, Zap } from "lucide-react";
import AdminContentGenerator from "@/components/AdminContentGenerator";
import AdminContentHeader from "./AdminContentHeader";
import AdminContentStats from "./AdminContentStats";
import AdminContentActions from "./AdminContentActions";

interface AdminContentTabProps {
  ingredientsCount: number;
  categoriesCount: number;
}

const AdminContentTab = ({ ingredientsCount, categoriesCount }: AdminContentTabProps) => {
  return (
    <div className="space-y-6">
      <AdminContentHeader />

      {/* Generador de Contenido Principal */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Wand2 className="h-5 w-5" />
            Generador de Contenido con IA
            <Badge className="bg-green-100 text-green-800 ml-2">
              <Zap className="h-3 w-3 mr-1" />
              DeepSeek + Flux
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminContentGenerator />
        </CardContent>
      </Card>

      <AdminContentStats 
        ingredientsCount={ingredientsCount}
        categoriesCount={categoriesCount}
      />

      <AdminContentActions />
    </div>
  );
};

export default AdminContentTab;
