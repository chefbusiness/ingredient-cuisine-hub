
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIngredients } from "@/hooks/useIngredients";
import IngredientTable from "./IngredientTable";
import IngredientEditDialog from "./IngredientEditDialog";
import IngredientDeleteDialog from "./IngredientDeleteDialog";
import DataRecoveryPanel from "./DataRecoveryPanel";
import { Ingredient } from "@/hooks/useIngredients";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Edit } from "lucide-react";

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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Gestión de Ingredientes
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
                Edita, elimina y gestiona los ingredientes existentes en la base de datos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Buscar ingredientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
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
