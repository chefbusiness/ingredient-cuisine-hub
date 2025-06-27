
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { Ingredient } from "@/hooks/useIngredients";
import IngredientTableHeader from "./ingredient-table/IngredientTableHeader";
import IngredientTableRow from "./ingredient-table/IngredientTableRow";

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
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <IngredientTableHeader />
          <TableBody>
            {ingredients.map((ingredient) => (
              <IngredientTableRow
                key={ingredient.id}
                ingredient={ingredient}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default IngredientTable;
