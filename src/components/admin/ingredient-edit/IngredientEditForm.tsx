
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ingredient } from "@/hooks/useIngredients";
import IngredientBasicTab from "./IngredientBasicTab";
import IngredientLanguagesTab from "./IngredientLanguagesTab";
import IngredientImagesTab from "./IngredientImagesTab";
import IngredientTechnicalTab from "./IngredientTechnicalTab";
import { IngredientFormData } from "./types";
import { Control, UseFormWatch } from "react-hook-form";

interface IngredientEditFormProps {
  ingredient: Ingredient | null;
  categories: any[];
  control: Control<IngredientFormData>;
  watch: UseFormWatch<IngredientFormData>;
}

const IngredientEditForm = ({ ingredient, categories, control, watch }: IngredientEditFormProps) => {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">Básico</TabsTrigger>
        <TabsTrigger value="languages">Idiomas</TabsTrigger>
        <TabsTrigger value="images">Imágenes</TabsTrigger>
        <TabsTrigger value="technical">Técnico</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <IngredientBasicTab control={control} categories={categories} />
      </TabsContent>

      <TabsContent value="languages" className="space-y-4">
        <IngredientLanguagesTab control={control} />
      </TabsContent>

      <TabsContent value="images" className="space-y-4">
        <IngredientImagesTab control={control} watch={watch} />
      </TabsContent>

      <TabsContent value="technical" className="space-y-4">
        <IngredientTechnicalTab control={control} />
      </TabsContent>
    </Tabs>
  );
};

export default IngredientEditForm;
