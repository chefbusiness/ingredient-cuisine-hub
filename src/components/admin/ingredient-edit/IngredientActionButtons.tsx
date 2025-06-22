
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGenerateImage } from "@/hooks/useGenerateImage";
import { useGenerateContent } from "@/hooks/useGenerateContent";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Image } from "lucide-react";
import { Ingredient } from "@/hooks/useIngredients";
import { UseFormSetValue, UseFormTrigger } from "react-hook-form";
import { IngredientFormData } from "./types";

interface IngredientActionButtonsProps {
  ingredient: Ingredient | null;
  setValue: UseFormSetValue<IngredientFormData>;
  trigger?: UseFormTrigger<IngredientFormData>;
}

const IngredientActionButtons = ({ ingredient, setValue, trigger }: IngredientActionButtonsProps) => {
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const { mutate: generateImage, isPending: isGeneratingImage } = useGenerateImage();
  const { mutate: generateContent, isPending: isGeneratingContent } = useGenerateContent();
  const { toast } = useToast();

  const handleRegenerateImage = () => {
    if (!ingredient) return;
    
    console.log('🖼️ === REGENERATE IMAGE BUTTON CLICKED ===');
    console.log('Ingredient:', ingredient.name);
    setIsRegeneratingImage(true);
    
    generateImage({
      ingredientName: ingredient.name,
      description: ingredient.description,
      ingredientId: ingredient.id
    }, {
      onSuccess: (result) => {
        console.log('✅ === IMAGE GENERATION SUCCESS ===');
        console.log('New image URL received:', result.imageUrl.substring(0, 50) + '...');
        
        // SOLO actualizar el campo del formulario - NO la base de datos
        console.log('📝 Setting form field image_url to new value...');
        setValue('image_url', result.imageUrl, { 
          shouldDirty: true, 
          shouldTouch: true,
          shouldValidate: true 
        });
        
        // Trigger validation to ensure the field is properly updated
        if (trigger) {
          console.log('🔄 Triggering form validation...');
          trigger('image_url');
        }
        
        // Verify the form field was actually updated
        setTimeout(() => {
          console.log('🔍 Checking if form field was updated...');
          // Note: We can't access form.getValues() here directly, but the parent component will log this
        }, 100);
        
        setIsRegeneratingImage(false);
        toast({
          title: "✅ Nueva imagen lista",
          description: "La imagen se ha actualizado en el formulario. Haz clic en 'Guardar Cambios' para aplicar todos los cambios.",
        });
      },
      onError: (error) => {
        console.error('❌ === IMAGE GENERATION ERROR ===');
        console.error('Error details:', error);
        setIsRegeneratingImage(false);
        toast({
          title: "❌ Error al regenerar imagen",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleRegenerateContent = () => {
    if (!ingredient) return;
    
    console.log('📝 === REGENERATE CONTENT BUTTON CLICKED ===');
    console.log('Ingredient:', ingredient.name);
    
    generateContent({
      type: 'ingredient',
      count: 1,
      category: ingredient.categories?.name || 'otros'
    });
  };

  return (
    <div className="flex gap-2 mb-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleRegenerateImage}
        disabled={isGeneratingImage || isRegeneratingImage}
      >
        <Image className="h-4 w-4 mr-1" />
        {(isGeneratingImage || isRegeneratingImage) ? "Generando..." : "Regenerar Imagen"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleRegenerateContent}
        disabled={isGeneratingContent}
      >
        <Wand2 className="h-4 w-4 mr-1" />
        {isGeneratingContent ? "Generando..." : "Regenerar Contenido"}
      </Button>
    </div>
  );
};

export default IngredientActionButtons;
