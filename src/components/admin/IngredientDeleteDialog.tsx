
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Ingredient } from "@/hooks/useIngredients";
import { useDeleteIngredient } from "@/hooks/useIngredientMutations";

interface IngredientDeleteDialogProps {
  ingredient: Ingredient | null;
  open: boolean;
  onClose: () => void;
}

const IngredientDeleteDialog = ({ ingredient, open, onClose }: IngredientDeleteDialogProps) => {
  const { mutate: deleteIngredient, isPending } = useDeleteIngredient();

  const handleDelete = () => {
    if (!ingredient) return;
    
    deleteIngredient(ingredient.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar ingrediente?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar permanentemente "{ingredient?.name}".
            Esta acción no se puede deshacer y eliminará todos los datos relacionados
            (precios, recetas, usos nutritivos, etc.).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default IngredientDeleteDialog;
