
import { useForm } from "react-hook-form";
import {
  Form,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ingredient } from "@/hooks/useIngredients";
import IngredientBasicTab from "./IngredientBasicTab";
import IngredientLanguagesTab from "./IngredientLanguagesTab";
import IngredientImagesTab from "./IngredientImagesTab";
import IngredientTechnicalTab from "./IngredientTechnicalTab";
import { IngredientFormData } from "./types";

interface IngredientEditFormProps {
  ingredient: Ingredient | null;
  categories: any[];
  onSubmit: (data: IngredientFormData) => void;
  form: ReturnType<typeof useForm<IngredientFormData>>;
}

const IngredientEditForm = ({ ingredient, categories, onSubmit, form }: IngredientEditFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="languages">Idiomas</TabsTrigger>
            <TabsTrigger value="images">Imágenes</TabsTrigger>
            <TabsTrigger value="technical">Técnico</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <IngredientBasicTab control={form.control} categories={categories} />
          </TabsContent>

          <TabsContent value="languages" className="space-y-4">
            <IngredientLanguagesTab control={form.control} />
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <IngredientImagesTab control={form.control} watch={form.watch} />
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <IngredientTechnicalTab control={form.control} />
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};

export default IngredientEditForm;
