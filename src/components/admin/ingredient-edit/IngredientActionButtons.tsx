
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGenerateImage } from "@/hooks/useGenerateImage";
import { useGenerateContent } from "@/hooks/useGenerateContent";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Image } from "lucide-react";
import { Ingredient } from "@/hooks/useIngredients";

interface IngredientActionButtonsProps {
  ingredient: Ingredient | null;
  onIngredientUpdated?: () => void;
}

const IngredientActionButtons = ({ ingredient, onIngredientUpdated }: IngredientActionButtonsProps) => {
  const { mutate: generateImage, isPending: isGeneratingImage } = useGenerateImage();
  const { mutate: generateContent, isPending: isGeneratingContent } = useGenerateContent();
  const { toast } = useToast();

  const handleRegenerateImage = () => {
    if (!ingredient) {
      toast({
        title: "Error",
        description: "No hay ingrediente seleccionado",
        variant: "destructive",
      });
      return;
    }
    
    console.log('🖼️ === REGENERATE IMAGE BUTTON CLICKED ===');
    console.log('Ingredient:', ingredient.name);
    
    generateImage({
      ingredientName: ingredient.name,
      description: ingredient.description,
      ingredientId: ingredient.id
    }, {
      onSuccess: (result) => {
        console.log('✅ === IMAGE GENERATION SUCCESS ===');
        console.log('Image saved automatically:', result.savedToDatabase);
        
        // Notificar al componente padre para cerrar el diálogo y refrescar
        if (onIngredientUpdated) {
          console.log('🔄 Notifying parent component of ingredient update...');
          onIngredientUpdated();
        }
      },
      onError: (error) => {
        console.error('❌ === IMAGE GENERATION ERROR ===');
        console.error('Error details:', error);
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
        disabled={isGeneratingImage}
      >
        <Image className="h-4 w-4 mr-1" />
        {isGeneratingImage ? "Generando imagen..." : "Regenerar Imagen"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleRegenerateContent}
        disabled={isGeneratingContent}
      >
        <Wand2 className="h-4 w-4 mr-1" />
        {isGeneratingContent ? "Generando contenido..." : "Regenerar Contenido"}
      </Button>
    </div>
  );
};

export default IngredientActionButtons;
