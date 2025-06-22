
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGenerateImage } from "@/hooks/useGenerateImage";
import { Image } from "lucide-react";
import { Ingredient } from "@/hooks/useIngredients";

interface SimpleImageGeneratorProps {
  ingredient: Ingredient;
}

const SimpleImageGenerator = ({ ingredient }: SimpleImageGeneratorProps) => {
  const { mutate: generateImage, isPending } = useGenerateImage();

  const handleGenerateImage = () => {
    console.log('🎯 SIMPLE: Generating image for:', ingredient.name);
    
    generateImage({
      ingredientName: ingredient.name,
      description: ingredient.description,
      ingredientId: ingredient.id
    });
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleGenerateImage}
        disabled={isPending}
        variant="outline"
        className="w-full"
      >
        <Image className="h-4 w-4 mr-2" />
        {isPending ? "Generando imagen..." : "Generar Nueva Imagen"}
      </Button>
      
      {ingredient.image_url && (
        <div className="mt-4">
          <img 
            src={ingredient.image_url} 
            alt={ingredient.name}
            className="w-full h-32 object-cover rounded border"
          />
        </div>
      )}
    </div>
  );
};

export default SimpleImageGenerator;
