
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ingredient } from "@/hooks/useIngredients";
import { useUpdateIngredient } from "@/hooks/useIngredientMutations";
import { useCategories } from "@/hooks/useCategories";
import IngredientQualityBadge from "./ingredient-edit/IngredientQualityBadge";
import IngredientActionButtons from "./ingredient-edit/IngredientActionButtons";
import IngredientEditForm from "./ingredient-edit/IngredientEditForm";

interface IngredientEditDialogProps {
  ingredient: Ingredient | null;
  open: boolean;
  onClose: () => void;
}

const IngredientEditDialog = ({ ingredient, open, onClose }: IngredientEditDialogProps) => {
  const { mutate: updateIngredient, isPending } = useUpdateIngredient();
  const { data: categories = [] } = useCategories();
  
  const form = useForm({
    defaultValues: {
      name: "",
      name_en: "",
      name_la: "",
      name_fr: "",
      name_it: "",
      name_pt: "",
      name_zh: "",
      description: "",
      category_id: "",
      temporada: "",
      origen: "",
      merma: 0,
      rendimiento: 100,
      popularity: 0,
      image_url: "",
      real_image_url: "",
    },
  });

  useEffect(() => {
    if (ingredient) {
      form.reset({
        name: ingredient.name || "",
        name_en: ingredient.name_en || "",
        name_la: ingredient.name_la || "",
        name_fr: ingredient.name_fr || "",
        name_it: ingredient.name_it || "",
        name_pt: ingredient.name_pt || "",
        name_zh: ingredient.name_zh || "",
        description: ingredient.description || "",
        category_id: ingredient.category_id || "",
        temporada: ingredient.temporada || "",
        origen: ingredient.origen || "",
        merma: ingredient.merma || 0,
        rendimiento: ingredient.rendimiento || 100,
        popularity: ingredient.popularity || 0,
        image_url: ingredient.image_url || "",
        real_image_url: ingredient.real_image_url || "",
      });
    }
  }, [ingredient, form]);

  const onSubmit = (data: any) => {
    if (!ingredient) return;
    
    updateIngredient({
      id: ingredient.id,
      updates: data,
    }, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar Ingrediente
            <IngredientQualityBadge ingredient={ingredient} />
          </DialogTitle>
          <DialogDescription>
            Modifica todos los campos del ingrediente y usa herramientas de IA para mejorar el contenido
          </DialogDescription>
        </DialogHeader>

        <IngredientActionButtons 
          ingredient={ingredient} 
          setValue={form.setValue} 
        />

        <IngredientEditForm
          ingredient={ingredient}
          categories={categories}
          onSubmit={onSubmit}
          form={form}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IngredientEditDialog;
