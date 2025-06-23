
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIngredients } from "@/hooks/useIngredients";
import IngredientTable from "./IngredientTable";
import IngredientEditDialog from "./IngredientEditDialog";
import IngredientDeleteDialog from "./IngredientDeleteDialog";
import DataRecoveryPanel from "./DataRecoveryPanel";
import BatchOperations from "./BatchOperations";
import BatchImageResearch from "./BatchImageResearch";
import ImageCleanupTools from "./ImageCleanupTools";
import { Ingredient } from "@/hooks/useIngredients";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Edit, RefreshCw, Image, Trash2 } from "lucide-react";

const AdminManualManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [deletingIngredient, setDeletingIngredient] = useState<Ingredient | null>(null);
  
  const { data: ingredients = [], isLoading } = useIngredients(searchTerm);

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
  };

  const handleDelete = (ingredient: Ingredient) => {
    setDeletingIngredient(ingredient);
  };

  const handleCloseEdit = () => {
    setEditingIngredient(null);
  };

  const handleCloseDelete = () => {
    setDeletingIngredient(null);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="management" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Gestión de Ingredientes
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Imágenes Reales
          </TabsTrigger>
          <TabsTrigger value="cleanup" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Limpieza de Imágenes
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Operaciones en Lote
          </TabsTrigger>
          <TabsTrigger value="recovery" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Recuperación de Datos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión Manual de Ingredientes</CardTitle>
              <CardDescription>
                Edita, elimina y gestiona los ingredientes existentes con herramientas avanzadas de IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Input
                  placeholder="Buscar ingredientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <div className="text-sm text-muted-foreground">
                  {ingredients.length} ingrediente{ingredients.length !== 1 ? 's' : ''} encontrado{ingredients.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <IngredientTable
                ingredients={ingredients}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Imágenes Reales</CardTitle>
              <CardDescription>
                Investigación automática y upload manual de imágenes reales para ingredientes
              </CardDescription>
            </CardHeader>
          </Card>
          <BatchImageResearch />
        </TabsContent>

        <TabsContent value="cleanup" className="space-y-6">
          <ImageCleanupTools />
        </TabsContent>

        <TabsContent value="batch" className="space-y-6">
          <BatchOperations totalIngredients={ingredients.length} />
        </TabsContent>

        <TabsContent value="recovery" className="space-y-6">
          <DataRecoveryPanel />
        </TabsContent>
      </Tabs>

      <IngredientEditDialog
        ingredient={editingIngredient}
        open={!!editingIngredient}
        onClose={handleCloseEdit}
      />

      <IngredientDeleteDialog
        ingredient={deletingIngredient}
        open={!!deletingIngredient}
        onClose={handleCloseDelete}
      />
    </div>
  );
};

export default AdminManualManagement;
