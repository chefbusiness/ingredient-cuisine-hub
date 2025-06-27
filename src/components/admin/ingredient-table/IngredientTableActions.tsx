
import { Button } from "@/components/ui/button";
import { Ingredient } from "@/hooks/useIngredients";
import { Edit, Trash2, Wand2, Image } from "lucide-react";
import { useGenerateImage } from "@/hooks/useGenerateImage";
import { useGenerateContent } from "@/hooks/useGenerateContent";
import { useToast } from "@/hooks/use-toast";

interface IngredientTableActionsProps {
  ingredient: Ingredient;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
}

const IngredientTableActions = ({ ingredient, onEdit, onDelete }: IngredientTableActionsProps) => {
  const { mutate: generateImage } = useGenerateImage();
  const { mutate: generateContent } = useGenerateContent();
  const { toast } = useToast();

  const handleRegenerateImage = () => {
    generateImage({
      ingredientName: ingredient.name,
      description: ingredient.description,
      ingredientId: ingredient.id
    });
  };

  const handleRegenerateContent = () => {
    generateContent({
      type: 'ingredient',
      count: 1,
      category: ingredient.categories?.name || 'otros'
    }, {
      onSuccess: () => {
        toast({
          title: "🔄 Contenido regenerado",
          description: `Se ha actualizado el contenido para ${ingredient.name}`,
        });
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(ingredient)}
        className="h-8 px-2"
      >
        <Edit className="h-3 w-3" />
        <span className="sr-only">Editar</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRegenerateImage}
        className="h-8 px-2"
        title="Regenerar imagen"
      >
        <Image className="h-3 w-3" />
        <span className="sr-only">Regenerar imagen</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRegenerateContent}
        className="h-8 px-2"
        title="Regenerar contenido"
      >
        <Wand2 className="h-3 w-3" />
        <span className="sr-only">Regenerar contenido</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(ingredient)}
        className="h-8 px-2 text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-3 w-3" />
        <span className="sr-only">Eliminar</span>
      </Button>
    </div>
  );
};

export default IngredientTableActions;
