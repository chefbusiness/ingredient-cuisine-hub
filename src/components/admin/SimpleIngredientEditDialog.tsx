
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ingredient } from "@/hooks/useIngredients";
import SimpleImageGenerator from "./ingredient-edit/SimpleImageGenerator";
import SimpleTextEditor from "./ingredient-edit/SimpleTextEditor";

interface SimpleIngredientEditDialogProps {
  ingredient: Ingredient | null;
  open: boolean;
  onClose: () => void;
}

const SimpleIngredientEditDialog = ({ ingredient, open, onClose }: SimpleIngredientEditDialogProps) => {
  if (!ingredient) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar: {ingredient.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Editar Texto</TabsTrigger>
            <TabsTrigger value="image">Generar Imagen</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <SimpleTextEditor 
              ingredient={ingredient} 
              onSave={onClose}
            />
          </TabsContent>

          <TabsContent value="image" className="space-y-4">
            <SimpleImageGenerator ingredient={ingredient} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleIngredientEditDialog;
