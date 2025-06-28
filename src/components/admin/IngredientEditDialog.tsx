
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
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
import { Ingredient, useIngredientById } from "@/hooks/useIngredients";
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
  const queryClient = useQueryClient();
  
  // Usar useIngredientById para cargar TODOS los datos del ingrediente sin filtros
  const { data: fullIngredientData, isLoading: isLoadingFullData } = useIngredientById(
    ingredient?.id || ""
  );
  
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
    console.log('🔄 === RESETTING FORM WITH FULL INGREDIENT DATA ===');
    console.log('📋 Ingredient:', ingredient.name);
    console.log('💰 ALL PRICES AVAILABLE:', ingredient.ingredient_prices?.length || 0);
    
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
    
    form.reset(formData);
  };

  // Usar los datos completos del ingrediente cuando estén disponibles
  useEffect(() => {
    if (fullIngredientData) {
      resetFormWithIngredient(fullIngredientData);
    }
  }, [fullIngredientData, form]);

  const handleIngredientUpdated = () => {
    console.log('🔄 === INGREDIENT UPDATED CALLBACK ===');
    console.log('Image was generated and saved, refreshing data');
    // Refresh the ingredient data and real images
    if (ingredient?.id) {
      queryClient.invalidateQueries({ queryKey: ['ingredient', ingredient.id] });
      queryClient.invalidateQueries({ queryKey: ['real-images', ingredient.id] });
    }
  };

  const handleImagesUpdated = () => {
    console.log('📸 === IMAGES UPDATED CALLBACK ===');
    // Refresh the real images data
    if (ingredient?.id) {
      queryClient.invalidateQueries({ queryKey: ['real-images', ingredient.id] });
      queryClient.invalidateQueries({ queryKey: ['ingredient', ingredient.id] });
    }
  };

  const onSubmit = async (data: IngredientFormData) => {
    if (!fullIngredientData) {
      console.error('❌ No full ingredient data found for update');
      return;
    }
    
    console.log('🚀 === FORM SUBMIT INITIATED ===');
    console.log('📋 Ingredient ID:', fullIngredientData.id);
    
    // Verificar si hay cambios reales comparando con los datos originales
    const hasRealChanges = Object.keys(data).some(key => {
      const formValue = data[key as keyof IngredientFormData];
      const originalValue = fullIngredientData[key as keyof Ingredient];
      
      // Manejar valores null/undefined
      const normalizedFormValue = formValue === null || formValue === undefined ? "" : String(formValue);
      const normalizedOriginalValue = originalValue === null || originalValue === undefined ? "" : String(originalValue);
      
      return normalizedFormValue !== normalizedOriginalValue;
    });

    console.log('📝 Has real changes:', hasRealChanges);
    
    if (!hasRealChanges) {
      console.log('ℹ️ No changes detected, closing dialog');
      onClose();
      return;
    }
    
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };
    
    console.log('💾 Updating ingredient with form data...');
    
    updateIngredient({
      id: fullIngredientData.id,
      updates: updateData,
    }, {
      onSuccess: (result) => {
        console.log('✅ === INGREDIENT UPDATE SUCCESS ===');
        onClose();
      },
      onError: (error) => {
        console.error('❌ === INGREDIENT UPDATE ERROR ===');
        console.error('Error details:', error);
      },
    });
  };

  // Mostrar loading si estamos cargando los datos completos
  if (isLoadingFullData && ingredient) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Cargando datos del ingrediente...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar Ingrediente
            <IngredientQualityBadge ingredient={fullIngredientData || ingredient} />
          </DialogTitle>
          <DialogDescription>
            Modifica los campos del ingrediente. En la pestaña "Precios" puedes gestionar precios de todos los países disponibles.
          </DialogDescription>
        </DialogHeader>

        <IngredientActionButtons 
          ingredient={fullIngredientData || ingredient} 
          onIngredientUpdated={handleIngredientUpdated}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <IngredientEditForm
              ingredient={fullIngredientData || ingredient}
              categories={categories}
              control={form.control}
              watch={form.watch}
              onImagesUpdated={handleImagesUpdated}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isPending || !fullIngredientData}
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
