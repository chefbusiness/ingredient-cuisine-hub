
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Loader } from "lucide-react";
import { Ingredient } from "@/hooks/useIngredients";

interface SimpleIngredientTableProps {
  ingredients: Ingredient[];
  isLoading: boolean;
  onDelete: (ingredient: Ingredient) => void;
}

const SimpleIngredientTable = ({ ingredients, isLoading, onDelete }: SimpleIngredientTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="h-6 w-6 animate-spin" />
        <span className="ml-2">Cargando ingredientes...</span>
      </div>
    );
  }

  if (ingredients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No se encontraron ingredientes
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Popularidad</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.map((ingredient) => (
            <TableRow key={ingredient.id}>
              <TableCell>
                <img
                  src={ingredient.image_url || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=50&h=50&fit=crop"}
                  alt={ingredient.name}
                  className="w-12 h-12 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=50&h=50&fit=crop";
                  }}
                />
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{ingredient.name}</div>
                  <div className="text-sm text-muted-foreground">{ingredient.name_en}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {ingredient.categories?.name || 'Sin categoría'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{ingredient.popularity}%</Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(ingredient)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SimpleIngredientTable;
