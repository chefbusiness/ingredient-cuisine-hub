
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGenerateImage } from "@/hooks/useGenerateImage";
import { useGenerateContent } from "@/hooks/useGenerateContent";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Image } from "lucide-react";
import { Ingredient } from "@/hooks/useIngredients";
import { UseFormSetValue } from "react-hook-form";

interface IngredientActionButtonsProps {
  ingredient: Ingredient | null;
  setValue: UseFormSetValue<any>;
}

const IngredientActionButtons = ({ ingredient, setValue }: IngredientActionButtonsProps) => {
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const { mutate: generateImage, isPending: isGeneratingImage } = useGenerateImage();
  const { mutate: generateContent, isPending: isGeneratingContent } = useGenerateContent();
  const { toast } = useToast();

  const handleRegenerateImage = () => {
    if (!ingredient) return;
    
    setIsRegeneratingImage(true);
    generateImage({
      ingredientName: ingredient.name,
      description: ingredient.description,
      ingredientId: ingredient.id
    }, {
      onSuccess: (result) => {
        setValue('image_url', result.imageUrl);
        setIsRegeneratingImage(false);
        toast({
          title: "✅ Imagen regenerada",
          description: "La nueva imagen se ha aplicado al formulario",
        });
      },
      onError: () => {
        setIsRegeneratingImage(false);
      }
    });
  };

  const handleRegenerateContent = () => {
    if (!ingredient) return;
    
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
