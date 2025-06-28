
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Ingredient } from "@/hooks/useIngredients";
import { Image } from "lucide-react";
import IngredientQualityScore from "./IngredientQualityScore";
import IngredientTableActions from "./IngredientTableActions";

interface IngredientTableRowProps {
  ingredient: Ingredient;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
}

const IngredientTableRow = ({ ingredient, onEdit, onDelete }: IngredientTableRowProps) => {
  return (
    <TableRow key={ingredient.id}>
      <TableCell className="sticky left-0 bg-background z-10">
        {ingredient.image_url ? (
          <img 
            src={ingredient.image_url} 
            alt={ingredient.name}
            className="w-12 h-12 object-cover rounded"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
            <Image className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium sticky left-16 bg-background z-10">
        <div>
          <div className="font-medium">{ingredient.name}</div>
          <div className="text-xs text-muted-foreground">{ingredient.name_en}</div>
          {ingredient.origen && (
            <div className="text-xs text-blue-600">{ingredient.origen}</div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">
          {ingredient.categories?.name || 'Sin categoría'}
        </Badge>
      </TableCell>
      <TableCell>
        <IngredientQualityScore ingredient={ingredient} />
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        {ingredient.temporada ? (
          <Badge variant="outline" className="text-xs">
            {ingredient.temporada}
          </Badge>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">{ingredient.merma}%</TableCell>
      <TableCell className="hidden md:table-cell">{ingredient.rendimiento}%</TableCell>
      <TableCell className="hidden lg:table-cell">{ingredient.popularity}</TableCell>
      <TableCell className="sticky right-0 bg-background z-10">
        <IngredientTableActions
          ingredient={ingredient}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};

export default IngredientTableRow;
