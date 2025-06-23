
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ingredient } from "@/hooks/useIngredients";

interface PricesTabProps {
  ingredient: Ingredient;
}

const PricesTab = ({ ingredient }: PricesTabProps) => {
  // Mapeo de símbolos de moneda por país
  const currencySymbols: { [key: string]: string } = {
    'España': '€',
    'Estados Unidos': '$',
    'Francia': '€', 
    'Italia': '€',
    'México': '$',
    'Argentina': '$'
  };

  // Orden preferido de países para mostrar
  const preferredOrder = ['España', 'Estados Unidos', 'Francia', 'Italia', 'México', 'Argentina'];

  // Ordenar precios según el orden preferido
  const sortedPrices = ingredient.ingredient_prices?.sort((a, b) => {
    const aIndex = preferredOrder.indexOf(a.countries?.name || '');
    const bIndex = preferredOrder.indexOf(b.countries?.name || '');
    
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  }) || [];

  // Función para determinar el color del badge según el tipo de unidad
  const getUnitBadgeColor = (unit: string) => {
    if (unit === 'litro' || unit === 'l') return 'bg-blue-100 text-blue-800';
    if (unit === 'g') return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800'; // kg por defecto
  };

  return (
    <Card className="bg-white/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Precios por País
          {sortedPrices.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {sortedPrices.length} países
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedPrices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPrices.map((priceData, index) => {
              const countryName = priceData.countries?.name || 'País no especificado';
              const currencySymbol = priceData.countries?.currency_symbol || currencySymbols[countryName] || '€';
              const isSpain = countryName === 'España';
              
              return (
                <div 
                  key={index} 
                  className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                    isSpain 
                      ? 'border-green-300 bg-green-50/50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${
                      isSpain ? 'text-green-800' : 'text-gray-800'
                    }`}>
                      {countryName}
                      {isSpain && (
                        <Badge className="ml-2 bg-green-100 text-green-700 text-xs">
                          Principal
                        </Badge>
                      )}
                    </h4>
                    <Badge 
                      className={`text-xs ${getUnitBadgeColor(priceData.unit)}`}
                    >
                      por {priceData.unit}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className={`text-2xl font-bold ${
                      isSpain ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {currencySymbol}{priceData.price.toFixed(2)}
                      <span className="text-sm font-normal text-gray-500">
                        /{priceData.unit}
                      </span>
                    </p>
                    
                    {priceData.season_variation && (
                      <p className="text-xs text-gray-600 capitalize">
                        {priceData.season_variation}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Precio de referencia
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">📊</div>
            <p className="text-gray-500">No hay precios registrados para este ingrediente</p>
            <p className="text-xs text-gray-400 mt-1">
              Los precios se actualizarán con nuevas generaciones
            </p>
          </div>
        )}
        
        {sortedPrices.length > 0 && (
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 mb-1">
              <strong>💡 Información:</strong>
            </p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• Los precios son referenciales y pueden variar según la región y temporada</li>
              <li>• Las unidades se ajustan automáticamente: líquidos en litros, sólidos en kg</li>
              <li>• Los datos se actualizan mediante investigación web en tiempo real</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PricesTab;
