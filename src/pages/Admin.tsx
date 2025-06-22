
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2, Trash2 } from "lucide-react";
import AdminContentGenerator from "@/components/AdminContentGenerator";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminStatusBanner from "@/components/admin/AdminStatusBanner";
import AdminStatsOverview from "@/components/admin/AdminStatsOverview";
import AdminSimpleManagement from "@/components/admin/AdminSimpleManagement";
import { useIngredients } from "@/hooks/useIngredients";
import { useCategories } from "@/hooks/useCategories";

const Admin = () => {
  const { data: ingredients = [] } = useIngredients();
  const { data: categories = [] } = useCategories();

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <div className="container mx-auto px-6 py-8">
        <AdminStatusBanner />
        
        <AdminStatsOverview 
          ingredientsCount={ingredients.length}
          categoriesCount={categories.length}
        />

        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="flex w-full">
            <TabsTrigger value="generator" className="flex-1">
              <Wand2 className="h-4 w-4 mr-2" />
              Generador AI
            </TabsTrigger>
            <TabsTrigger value="management" className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" />
              Gestión Simple
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Generador de Contenido AI</h2>
              <p className="text-muted-foreground">
                Usa DeepSeek para generar ingredientes, categorías y precios, y Flux 1.1 Pro para crear imágenes realistas de calidad profesional.
              </p>
            </div>
            <AdminContentGenerator />
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Gestión Simple</h2>
              <p className="text-muted-foreground">
                Solo eliminación de ingredientes. Para cambios, elimina y regenera con IA.
              </p>
            </div>
            <AdminSimpleManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
