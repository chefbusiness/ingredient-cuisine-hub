
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Ingredient } from "@/hooks/useIngredients";
import { Edit, Trash2 } from "lucide-react";

interface IngredientTableProps {
  ingredients: Ingredient[];
  isLoading: boolean;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
}

const IngredientTable = ({ ingredients, isLoading, onEdit, onDelete }: IngredientTableProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Cargando ingredientes...</p>
      </div>
    );
  }

  if (ingredients.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No se encontraron ingredientes</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Popularidad</TableHead>
            <TableHead>Merma %</TableHead>
            <TableHead>Rendimiento %</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.map((ingredient) => (
            <TableRow key={ingredient.id}>
              <TableCell className="font-medium">
                <div>
                  <div>{ingredient.name}</div>
                  <div className="text-xs text-muted-foreground">{ingredient.name_en}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {ingredient.categories?.name || 'Sin categoría'}
                </Badge>
              </TableCell>
              <TableCell>{ingredient.popularity}</TableCell>
              <TableCell>{ingredient.merma}%</TableCell>
              <TableCell>{ingredient.rendimiento}%</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(ingredient)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(ingredient)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default IngredientTable;
