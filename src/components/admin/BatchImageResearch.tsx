
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Zap, CheckCircle, XCircle, Clock } from "lucide-react";
import { useResearchRealImages } from "@/hooks/useResearchRealImages";
import { useIngredients } from "@/hooks/useIngredients";

const BatchImageResearch = () => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  
  const { data: ingredients = [], isLoading } = useIngredients();
  const researchMutation = useResearchRealImages();

  // Filter ingredients that don't have real images or have few images
  const ingredientsWithoutImages = ingredients.filter(ingredient => {
    // This is a simplified check - in a real app you'd want to query the actual count
    return !ingredient.real_image_url;
  });

  const toggleIngredientSelection = (ingredientId: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredientId)
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  const selectAll = () => {
    setSelectedIngredients(ingredientsWithoutImages.slice(0, 20).map(i => i.id));
  };

  const clearSelection = () => {
    setSelectedIngredients([]);
  };

  const handleBatchResearch = async () => {
    if (selectedIngredients.length === 0) return;

    try {
      await researchMutation.mutateAsync({
        ingredientIds: selectedIngredients,
        mode: 'batch'
      });
      
      // Clear selection after successful research
      setSelectedIngredients([]);
    } catch (error) {
      // Error handling is in the mutation
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <span>Cargando ingredientes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          Investigación en Lote de Imágenes Reales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {ingredientsWithoutImages.length} ingredientes sin imágenes reales detectados
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={selectAll}
              disabled={researchMutation.isPending}
            >
              Seleccionar Top 20
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearSelection}
              disabled={researchMutation.isPending}
            >
              Limpiar
            </Button>
          </div>
        </div>

        {!isSelecting && selectedIngredients.length === 0 && (
          <Button
            onClick={() => setIsSelecting(true)}
            variant="outline"
            className="w-full"
          >
            <Search className="h-4 w-4 mr-2" />
            Seleccionar Ingredientes para Investigar
          </Button>
        )}

        {(isSelecting || selectedIngredients.length > 0) && (
          <div className="space-y-3">
            <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
              {ingredientsWithoutImages.slice(0, 50).map((ingredient) => (
                <div key={ingredient.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIngredients.includes(ingredient.id)}
                    onChange={() => toggleIngredientSelection(ingredient.id)}
                    disabled={researchMutation.isPending}
                    className="h-4 w-4"
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm">{ingredient.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {ingredient.categories?.name || 'Sin categoría'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {selectedIngredients.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-800">
                    {selectedIngredients.length} ingredientes seleccionados
                  </span>
                  <Badge className="bg-blue-600">
                    ~{selectedIngredients.length * 4} imágenes esperadas
                  </Badge>
                </div>
                
                <Button
                  onClick={handleBatchResearch}
                  disabled={researchMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {researchMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Investigando {selectedIngredients.length} ingredientes...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Iniciar Investigación en Lote
                    </div>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {researchMutation.isPending && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Proceso estimado: ~{selectedIngredients.length * 15} segundos
            </div>
            <Progress value={33} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchImageResearch;
