
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useIngredients } from "@/hooks/useIngredients";
import { useUpdateIngredientPrices } from "@/hooks/useUpdateIngredientPrices";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface PriceData {
  price: number;
  country: string;
  currency: string;
  unit: string;
}

interface IngredientPriceSelectorProps {
  onProgress?: (progress: { current: number; total: number; status: string }) => void;
}

const IngredientPriceSelector = ({ onProgress }: IngredientPriceSelectorProps) => {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [selectedIngredientName, setSelectedIngredientName] = useState<string>("");
  const [currentPrices, setCurrentPrices] = useState<PriceData[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  
  const { data: ingredients = [] } = useIngredients("");
  const { mutate: updatePrices, isPending } = useUpdateIngredientPrices(onProgress);

  useEffect(() => {
    if (selectedIngredientId) {
      loadCurrentPrices(selectedIngredientId);
    } else {
      setCurrentPrices([]);
    }
  }, [selectedIngredientId]);

  const loadCurrentPrices = async (ingredientId: string) => {
    setLoadingPrices(true);
    try {
      const { data: pricesData, error } = await supabase
        .from('ingredient_prices')
        .select(`
          price,
          unit,
          countries!inner(name, currency)
        `)
        .eq('ingredient_id', ingredientId);

      if (error) {
        console.error('Error loading prices:', error);
        return;
      }

      const formattedPrices = pricesData?.map(item => ({
        price: Number(item.price),
        country: item.countries.name,
        currency: item.countries.currency,
        unit: item.unit
      })) || [];

      setCurrentPrices(formattedPrices);
    } catch (error) {
      console.error('Error fetching prices:', error);
      setCurrentPrices([]);
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleIngredientSelect = (value: string) => {
    const ingredient = ingredients.find(ing => ing.id === value);
    setSelectedIngredientId(value);
    setSelectedIngredientName(ingredient?.name || "");
  };

  const handleUpdateSpecificIngredient = () => {
    if (!selectedIngredientId) return;
    
    updatePrices({
      mode: 'specific',
      ingredientIds: [selectedIngredientId],
      batchSize: 1
    });
  };

  const isPriceSuspicious = (price: number, ingredientName: string) => {
    const name = ingredientName.toLowerCase();
    
    // Criterios específicos para detectar precios sospechosos
    if (name.includes('pimienta') || name.includes('pepper')) {
      return price < 10; // Pimienta menor a 10€/kg es sospechoso
    }
    if (name.includes('azafrán') || name.includes('saffron')) {
      return price < 1000; // Azafrán menor a 1000€/kg es sospechoso
    }
    if (name.includes('trufa') || name.includes('truffle')) {
      return price < 100; // Trufa menor a 100€/kg es sospechoso
    }
    
    // Criterio general: menor a 2€/kg para especias es sospechoso
    return price < 2;
  };

  const suspiciousPricesCount = currentPrices.filter(p => 
    isPriceSuspicious(p.price, selectedIngredientName)
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Actualización Manual por Ingrediente
        </CardTitle>
        <CardDescription>
          Selecciona un ingrediente específico para actualizar sus precios HORECA con Perplexity Sonar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Seleccionar Ingrediente</label>
          <Select value={selectedIngredientId} onValueChange={handleIngredientSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Buscar y seleccionar ingrediente..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {ingredients.map((ingredient) => (
                <SelectItem key={ingredient.id} value={ingredient.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{ingredient.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {ingredient.name_en}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedIngredientId && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Precios Actuales: {selectedIngredientName}</h4>
              {loadingPrices && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            
            {suspiciousPricesCount > 0 && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">
                  {suspiciousPricesCount} precio{suspiciousPricesCount > 1 ? 's' : ''} sospechoso{suspiciousPricesCount > 1 ? 's' : ''} detectado{suspiciousPricesCount > 1 ? 's' : ''}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {currentPrices.map((priceData, index) => {
                const isSuspicious = isPriceSuspicious(priceData.price, selectedIngredientName);
                return (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-medium">{priceData.country}</span>
                    <div className="flex items-center gap-1">
                      <Badge variant={isSuspicious ? "destructive" : "secondary"}>
                        {priceData.price.toFixed(2)} {priceData.currency}/{priceData.unit}
                      </Badge>
                      {isSuspicious ? (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                      ) : (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={handleUpdateSpecificIngredient}
              disabled={isPending || !selectedIngredientId}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Actualizando con Perplexity Sonar...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Actualizar Precios de "{selectedIngredientName}"
                </>
              )}
            </Button>

            <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
              🔍 Este proceso consultará Perplexity Sonar Deep Research para obtener precios HORECA actualizados 
              específicamente para "{selectedIngredientName}" desde fuentes mayoristas especializadas.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IngredientPriceSelector;
