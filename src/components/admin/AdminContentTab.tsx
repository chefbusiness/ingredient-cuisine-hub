
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AdminContentTabProps {
  ingredientsCount: number;
  categoriesCount: number;
}

const AdminContentTab = ({ ingredientsCount, categoriesCount }: AdminContentTabProps) => {
  return (
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
  );
};

export default AdminContentTab;
