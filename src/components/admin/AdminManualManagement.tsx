
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIngredients } from "@/hooks/useIngredients";
import { useCategories } from "@/hooks/useCategories";
import { Edit, Search, Trash2 } from "lucide-react";
import SimpleIngredientEditDialog from "./SimpleIngredientEditDialog";
import IngredientDeleteDialog from "./IngredientDeleteDialog";
import { Ingredient } from "@/hooks/useIngredients";

const AdminManualManagement = () => {
  const { data: ingredients = [], isLoading } = useIngredients();
  const { data: categories = [] } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [deletingIngredient, setDeletingIngredient] = useState<Ingredient | null>(null);

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center py-8">Cargando ingredientes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar ingredientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredIngredients.map((ingredient) => (
          <div key={ingredient.id} className="border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {ingredient.image_url && (
                <img 
                  src={ingredient.image_url} 
                  alt={ingredient.name}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div>
                <h3 className="font-medium">{ingredient.name}</h3>
                <p className="text-sm text-gray-500">
                  {ingredient.categories?.name || 'Sin categoría'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingIngredient(ingredient)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeletingIngredient(ingredient)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <SimpleIngredientEditDialog
        ingredient={editingIngredient}
        open={!!editingIngredient}
        onClose={() => setEditingIngredient(null)}
      />

      <IngredientDeleteDialog
        ingredient={deletingIngredient}
        open={!!deletingIngredient}
        onClose={() => setDeletingIngredient(null)}
      />
    </div>
  );
};

export default AdminManualManagement;
