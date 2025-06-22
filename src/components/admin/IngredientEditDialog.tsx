
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

  // Watch all form values for debugging
  const watchedValues = form.watch();

  useEffect(() => {
    console.log('🔍 === FORM VALUES CHANGED ===');
    console.log('All form values:', watchedValues);
  }, [watchedValues]);

  useEffect(() => {
    if (ingredient) {
      console.log('🔄 === RESETTING FORM WITH INGREDIENT DATA ===');
      console.log('📋 Ingredient:', ingredient.name);
      console.log('📋 Original ingredient data:', {
        id: ingredient.id,
        name: ingredient.name,
        image_url: ingredient.image_url ? ingredient.image_url.substring(0, 50) + '...' : 'NULL',
        category_id: ingredient.category_id,
        description: ingredient.description ? ingredient.description.substring(0, 100) + '...' : 'NULL'
      });
      
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
        description: formData.description ? formData.description.substring(0, 100) + '...' : 'EMPTY'
      });
      
      form.reset(formData);
      
      // Verify form was actually set
      setTimeout(() => {
        const currentValues = form.getValues();
        console.log('✅ Form values after reset:', {
          name: currentValues.name,
          image_url: currentValues.image_url ? currentValues.image_url.substring(0, 50) + '...' : 'EMPTY',
          category_id: currentValues.category_id
        });
      }, 100);
    }
  }, [ingredient, form]);

  const onSubmit = async (data: IngredientFormData) => {
    if (!ingredient) {
      console.error('❌ No ingredient found for update');
      return;
    }
    
    console.log('🚀 === FORM SUBMIT INITIATED ===');
    console.log('📋 Ingredient ID:', ingredient.id);
    console.log('📋 Raw form data received:', data);
    
    // Check if form is dirty (has changes)
    const isDirty = form.formState.isDirty;
    const dirtyFields = form.formState.dirtyFields;
    console.log('📝 Form dirty status:', { isDirty, dirtyFields });
    
    // Get current form values directly
    const currentValues = form.getValues();
    console.log('📋 Current form values:', {
      name: currentValues.name,
      image_url: currentValues.image_url ? currentValues.image_url.substring(0, 50) + '...' : 'EMPTY',
      real_image_url: currentValues.real_image_url ? currentValues.real_image_url.substring(0, 50) + '...' : 'EMPTY',
      category_id: currentValues.category_id,
      description: currentValues.description ? currentValues.description.substring(0, 100) + '...' : 'EMPTY',
      popularity: currentValues.popularity,
      merma: currentValues.merma,
      rendimiento: currentValues.rendimiento
    });
    
    // Compare with original data
    console.log('🔍 Comparing with original:', {
      nameChanged: currentValues.name !== ingredient.name,
      imageChanged: currentValues.image_url !== (ingredient.image_url || ''),
      categoryChanged: currentValues.category_id !== ingredient.category_id,
      descriptionChanged: currentValues.description !== (ingredient.description || '')
    });
    
    // Prepare update data with explicit logging
    const updateData = {
      ...currentValues,
      updated_at: new Date().toISOString()
    };
    
    console.log('💾 Final update data to send:', {
      name: updateData.name,
      image_url: updateData.image_url ? updateData.image_url.substring(0, 50) + '...' : 'EMPTY',
      real_image_url: updateData.real_image_url ? updateData.real_image_url.substring(0, 50) + '...' : 'EMPTY',
      category_id: updateData.category_id,
      description: updateData.description ? updateData.description.substring(0, 100) + '...' : 'EMPTY',
      popularity: updateData.popularity,
      merma: updateData.merma,
      rendimiento: updateData.rendimiento,
      updated_at: updateData.updated_at
    });
    
    console.log('🎯 About to call updateIngredient mutation...');
    
    updateIngredient({
      id: ingredient.id,
      updates: updateData,
    }, {
      onSuccess: (result) => {
        console.log('✅ === UPDATE SUCCESS CALLBACK ===');
        console.log('Success result:', result);
        onClose();
      },
      onError: (error) => {
        console.error('❌ === UPDATE ERROR CALLBACK ===');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
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
                onClick={() => {
                  console.log('🔴 SAVE BUTTON CLICKED');
                  console.log('Form state:', {
                    isValid: form.formState.isValid,
                    isDirty: form.formState.isDirty,
                    errors: form.formState.errors,
                    isSubmitting: form.formState.isSubmitting
                  });
                }}
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
