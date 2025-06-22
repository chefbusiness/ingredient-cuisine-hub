
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
import { Form } from "@/components/ui/form";
import { Ingredient } from "@/hooks/useIngredients";
import { useUpdateIngredient } from "@/hooks/useIngredientMutations";
import { useCategories } from "@/hooks/useCategories";
import IngredientQualityBadge from "./ingredient-edit/IngredientQualityBadge";
import IngredientActionButtons from "./ingredient-edit/IngredientActionButtons";
import IngredientEditForm from "./ingredient-edit/IngredientEditForm";
import { IngredientFormData } from "./ingredient-edit/types";

interface IngredientEditDialogProps {
  ingredient: Ingredient | null;
  open: boolean;
  onClose: () => void;
}

const IngredientEditDialog = ({ ingredient, open, onClose }: IngredientEditDialogProps) => {
  const { mutate: updateIngredient, isPending } = useUpdateIngredient();
  const { data: categories = [] } = useCategories();
  
  const form = useForm<IngredientFormData>({
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
      console.log('🔄 === RESETTING FORM WITH INGREDIENT DATA ===');
      console.log('📋 Ingredient:', ingredient.name);
      console.log('📋 Current image_url:', ingredient.image_url ? ingredient.image_url.substring(0, 50) + '...' : 'NULL');
      
      const formData = {
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
      };
      
      console.log('📋 Form data being set:', {
        name: formData.name,
        image_url: formData.image_url ? formData.image_url.substring(0, 50) + '...' : 'EMPTY',
        category_id: formData.category_id
      });
      
      form.reset(formData);
    }
  }, [ingredient, form]);

  const onSubmit = (data: IngredientFormData) => {
    if (!ingredient) return;
    
    console.log('💾 === SUBMITTING FORM DATA ===');
    console.log('📋 Ingredient ID:', ingredient.id);
    console.log('📋 Form data to submit:', {
      name: data.name,
      image_url: data.image_url ? data.image_url.substring(0, 50) + '...' : 'EMPTY',
      real_image_url: data.real_image_url ? data.real_image_url.substring(0, 50) + '...' : 'EMPTY',
      category_id: data.category_id,
      description: data.description ? data.description.substring(0, 100) + '...' : 'EMPTY'
    });
    
    updateIngredient({
      id: ingredient.id,
      updates: data,
    }, {
      onSuccess: () => {
        console.log('✅ Form submission successful - closing dialog');
        onClose();
      },
      onError: (error) => {
        console.error('❌ Form submission failed:', error);
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
            Modifica todos los campos del ingrediente. Usa "Regenerar Imagen" para crear una nueva imagen, luego haz clic en "Guardar Cambios" para aplicar todo.
          </DialogDescription>
        </DialogHeader>

        <IngredientActionButtons 
          ingredient={ingredient} 
          setValue={form.setValue} 
          trigger={form.trigger}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <IngredientEditForm
              ingredient={ingredient}
              categories={categories}
              control={form.control}
              watch={form.watch}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
              >
                {isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default IngredientEditDialog;
