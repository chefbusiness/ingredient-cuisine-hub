
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ingredient } from "@/hooks/useIngredients";

interface PricesTabProps {
  ingredient: Ingredient;
}

const PricesTab = ({ ingredient }: PricesTabProps) => {
  return (
    <Card className="bg-white/90">
      <CardHeader>
        <CardTitle>Precios por País</CardTitle>
      </CardHeader>
      <CardContent>
        {ingredient.ingredient_prices && ingredient.ingredient_prices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ingredient.ingredient_prices.map((priceData, index) => (
              <div key={index} className="p-4 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {priceData.countries?.name || 'País no especificado'}
                </h4>
                <p className="text-2xl font-bold text-green-600 mb-1">
                  {priceData.countries?.currency_symbol || '€'}{priceData.price.toFixed(2)}/{priceData.unit}
                </p>
                <p className="text-sm text-gray-600">Precio actual</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No hay precios registrados para este ingrediente</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PricesTab;
