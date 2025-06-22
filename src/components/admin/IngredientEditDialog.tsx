
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
import { useUpdateIngredient } from "@/hooks/mutations";
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

  const resetFormWithIngredient = (ingredient: Ingredient) => {
    console.log('🔄 === RESETTING FORM WITH INGREDIENT DATA ===');
    console.log('📋 Ingredient:', ingredient.name);
    
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
      category_id: formData.category_id,
    });
    
    form.reset(formData);
  };

  useEffect(() => {
    if (ingredient) {
      resetFormWithIngredient(ingredient);
    }
  }, [ingredient, form]);

  const handleIngredientUpdated = () => {
    console.log('🔄 === INGREDIENT UPDATED CALLBACK ===');
    console.log('Ingredient updated externally, dialog will close and refresh');
    onClose();
  };

  const onSubmit = async (data: IngredientFormData) => {
    if (!ingredient) {
      console.error('❌ No ingredient found for update');
      return;
    }
    
    console.log('🚀 === FORM SUBMIT INITIATED ===');
    console.log('📋 Ingredient ID:', ingredient.id);
    
    // Verificar si hay cambios reales comparando con los datos originales
    const hasRealChanges = Object.keys(data).some(key => {
      const formValue = data[key as keyof IngredientFormData];
      const originalValue = ingredient[key as keyof Ingredient];
      return formValue !== (originalValue || "");
    });

    console.log('📝 Has real changes:', hasRealChanges);
    
    if (!hasRealChanges) {
      console.log('ℹ️ No changes detected, showing info message');
      return;
    }
    
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };
    
    console.log('💾 Final update data to send:', {
      name: updateData.name,
      image_url: updateData.image_url ? updateData.image_url.substring(0, 50) + '...' : 'EMPTY',
      category_id: updateData.category_id,
    });
    
    updateIngredient({
      id: ingredient.id,
      updates: updateData,
    }, {
      onSuccess: (result) => {
        console.log('✅ === UPDATE SUCCESS CALLBACK ===');
        onClose();
      },
      onError: (error) => {
        console.error('❌ === UPDATE ERROR CALLBACK ===');
        console.error('Error details:', error);
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
            Modifica los campos del ingrediente. La imagen se guarda automáticamente al generarla.
          </DialogDescription>
        </DialogHeader>

        <IngredientActionButtons 
          ingredient={ingredient} 
          onIngredientUpdated={handleIngredientUpdated}
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
