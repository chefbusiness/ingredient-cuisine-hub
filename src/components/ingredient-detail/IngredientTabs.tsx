
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ingredient } from "@/hooks/useIngredients";
import NamesTab from "./tabs/NamesTab";
import UsesTab from "./tabs/UsesTab";
import PricesTab from "./tabs/PricesTab";
import TechnicalTab from "./tabs/TechnicalTab";

interface IngredientTabsProps {
  ingredient: Ingredient;
  realImagesCount: number;
}

const IngredientTabs = ({ ingredient, realImagesCount }: IngredientTabsProps) => {
  return (
    <Tabs defaultValue="nombres" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="nombres">Nombres</TabsTrigger>
        <TabsTrigger value="usos">Usos</TabsTrigger>
        <TabsTrigger value="precios">Precios</TabsTrigger>
        <TabsTrigger value="tecnico">Técnico</TabsTrigger>
      </TabsList>

      <TabsContent value="nombres" className="space-y-4">
        <NamesTab ingredient={ingredient} realImagesCount={realImagesCount} />
      </TabsContent>

      <TabsContent value="usos" className="space-y-4">
        <UsesTab ingredient={ingredient} />
      </TabsContent>

      <TabsContent value="precios" className="space-y-4">
        <PricesTab ingredient={ingredient} />
      </TabsContent>

      <TabsContent value="tecnico" className="space-y-4">
        <TechnicalTab ingredient={ingredient} />
      </TabsContent>
    </Tabs>
  );
};

export default IngredientTabs;
