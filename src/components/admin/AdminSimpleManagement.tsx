
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useIngredients } from "@/hooks/useIngredients";
import SimpleIngredientTable from "./SimpleIngredientTable";
import IngredientDeleteDialog from "./IngredientDeleteDialog";
import { Ingredient } from "@/hooks/useIngredients";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminSimpleManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingIngredient, setDeletingIngredient] = useState<Ingredient | null>(null);
  
  const { data: ingredients = [], isLoading } = useIngredients(searchTerm);

  const handleDelete = (ingredient: Ingredient) => {
    setDeletingIngredient(ingredient);
  };

  const handleCloseDelete = () => {
    setDeletingIngredient(null);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Solo eliminación:</strong> Para modificar un ingrediente, elimínalo aquí y regenera uno nuevo con el Generador AI con las especificaciones correctas.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Gestión Simple de Ingredientes</CardTitle>
          <CardDescription>
            Solo permite eliminar ingredientes problemáticos. Para cambios, usa el Generador AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Buscar ingredientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <div className="text-sm text-muted-foreground">
              {ingredients.length} ingrediente{ingredients.length !== 1 ? 's' : ''} encontrado{ingredients.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <SimpleIngredientTable
            ingredients={ingredients}
            isLoading={isLoading}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <IngredientDeleteDialog
        ingredient={deletingIngredient}
        open={!!deletingIngredient}
        onClose={handleCloseDelete}
      />
    </div>
  );
};

export default AdminSimpleManagement;
