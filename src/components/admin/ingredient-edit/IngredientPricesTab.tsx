
import { useState } from "react";
import { Control, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Edit, Save, X, AlertTriangle } from "lucide-react";
import { useCountries } from "@/hooks/useCountries";
import { useUpdateIngredientPrice, useDeleteIngredientPrice } from "@/hooks/useUpdateIngredientPrice";
import { Ingredient } from "@/hooks/useIngredients";
import { IngredientFormData } from "./types";

interface IngredientPricesTabProps {
  control: Control<IngredientFormData>;
  ingredient: Ingredient | null;
}

interface PriceEditData {
  priceId?: string;
  countryId: string;
  countryName: string;
  price: number;
  unit: string;
  seasonVariation?: string;
}

const IngredientPricesTab = ({ control, ingredient }: IngredientPricesTabProps) => {
  const { data: countries = [] } = useCountries();
  const { mutate: updatePrice, isPending: isUpdating } = useUpdateIngredientPrice();
  const { mutate: deletePrice, isPending: isDeleting } = useDeleteIngredientPrice();
  
  const [editingPrice, setEditingPrice] = useState<PriceEditData | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Obtener precios actuales del ingrediente con validaciones de seguridad
  const currentPrices = (ingredient?.ingredient_prices || []).filter(price => 
    price && 
    typeof price.price === 'number' && 
    price.unit &&
    price.country_id // Usar country_id en lugar de countries?.id
  );

  console.log('🔍 Current prices data:', currentPrices);
  console.log('🌍 Countries data:', countries);

  // Detectar precios potencialmente erróneos
  const isPriceErroneous = (price: number, unit: string) => {
    if (unit === 'kg') {
      return price < 0.5 || price > 100; // Fuera del rango típico para kg
    }
    if (unit === 'l' || unit === 'litro') {
      return price < 0.3 || price > 50; // Fuera del rango típico para litros
    }
    if (unit === 'g') {
      return price > 5; // Muy caro para gramos (debería ser kg)
    }
    return false;
  };

  const getCountryName = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    return country?.name || 'País no especificado';
  };

  const handleEditPrice = (priceData: any) => {
    console.log('📝 Editing price:', priceData);
    
    if (!priceData || !priceData.country_id) {
      console.error('❌ Invalid price data for editing:', priceData);
      return;
    }

    const countryName = getCountryName(priceData.country_id);
    
    setEditingPrice({
      priceId: priceData.id,
      countryId: priceData.country_id,
      countryName: countryName,
      price: priceData.price || 0,
      unit: priceData.unit || 'kg',
      seasonVariation: priceData.season_variation || ''
    });
  };

  const handleSavePrice = () => {
    if (!editingPrice || !ingredient) {
      console.error('❌ Missing data for saving price');
      return;
    }

    if (!editingPrice.countryId) {
      console.error('❌ Country ID is required');
      return;
    }

    console.log('💾 Saving price:', editingPrice);

    updatePrice({
      priceId: editingPrice.priceId,
      ingredientId: ingredient.id,
      countryId: editingPrice.countryId,
      price: editingPrice.price,
      unit: editingPrice.unit,
      seasonVariation: editingPrice.seasonVariation
    }, {
      onSuccess: () => {
        console.log('✅ Price saved successfully');
        setEditingPrice(null);
        setIsAddingNew(false);
      },
      onError: (error) => {
        console.error('❌ Error saving price:', error);
      }
    });
  };

  const handleDeletePrice = (priceId: string) => {
    if (!ingredient || !priceId) {
      console.error('❌ Missing data for deleting price');
      return;
    }
    
    console.log('🗑️ Deleting price:', priceId);
    
    deletePrice({
      priceId,
      ingredientId: ingredient.id
    });
  };

  const handleAddNew = () => {
    console.log('➕ Adding new price');
    setIsAddingNew(true);
    setEditingPrice({
      countryId: '',
      countryName: '',
      price: 0,
      unit: 'kg',
      seasonVariation: ''
    });
  };

  const availableCountries = countries.filter(country => 
    !currentPrices.some(price => price.country_id === country.id)
  );

  // Mostrar estado de error si no se pueden cargar los datos básicos
  if (!ingredient) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-500">No se puede cargar la información del ingrediente</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Gestión de Precios por País
          <Button 
            onClick={handleAddNew} 
            disabled={isAddingNew || availableCountries.length === 0}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir País
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentPrices.length === 0 && !isAddingNew ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💰</div>
            <p>No hay precios configurados para este ingrediente</p>
            <p className="text-sm mt-1">Añade precios por país para completar la información</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>País</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Variación Estacional</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPrices.map((priceData) => {
                const isEditing = editingPrice?.priceId === priceData.id;
                const isErroneous = isPriceErroneous(priceData.price, priceData.unit);
                const countryName = getCountryName(priceData.country_id);
                
                return (
                  <TableRow key={priceData.id || `price-${Math.random()}`}>
                    <TableCell className="font-medium">
                      {countryName}
                      {countryName === 'España' && (
                        <Badge className="ml-2 bg-green-100 text-green-700 text-xs">
                          Principal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editingPrice.price}
                          onChange={(e) => setEditingPrice({
                            ...editingPrice,
                            price: parseFloat(e.target.value) || 0
                          })}
                          className="w-24"
                        />
                      ) : (
                        <span className={isErroneous ? 'text-red-600 font-semibold' : ''}>
                          €{priceData.price.toFixed(2)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select 
                          value={editingPrice.unit} 
                          onValueChange={(value) => setEditingPrice({
                            ...editingPrice,
                            unit: value
                          })}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="l">l</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        priceData.unit
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editingPrice.seasonVariation || ''}
                          onChange={(e) => setEditingPrice({
                            ...editingPrice,
                            seasonVariation: e.target.value
                          })}
                          placeholder="Ej: Más caro en invierno"
                          className="w-32"
                        />
                      ) : (
                        priceData.season_variation || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {isErroneous && (
                        <Badge variant="destructive" className="text-xs">
                          Revisar
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={handleSavePrice}
                              disabled={isUpdating}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingPrice(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditPrice(priceData)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePrice(priceData.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Fila para añadir nuevo precio */}
              {isAddingNew && editingPrice && (
                <TableRow className="bg-blue-50">
                  <TableCell>
                    <Select 
                      value={editingPrice.countryId} 
                      onValueChange={(value) => {
                        const country = countries.find(c => c.id === value);
                        setEditingPrice({
                          ...editingPrice,
                          countryId: value,
                          countryName: country?.name || ''
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar país" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCountries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingPrice.price}
                      onChange={(e) => setEditingPrice({
                        ...editingPrice,
                        price: parseFloat(e.target.value) || 0
                      })}
                      placeholder="0.00"
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={editingPrice.unit} 
                      onValueChange={(value) => setEditingPrice({
                        ...editingPrice,
                        unit: value
                      })}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="l">l</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={editingPrice.seasonVariation || ''}
                      onChange={(e) => setEditingPrice({
                        ...editingPrice,
                        seasonVariation: e.target.value
                      })}
                      placeholder="Opcional"
                      className="w-32"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      Nuevo
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleSavePrice}
                        disabled={isUpdating || !editingPrice.countryId}
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPrice(null);
                          setIsAddingNew(false);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {/* Información adicional */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700 mb-1">
            <strong>💡 Información sobre precios:</strong>
          </p>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• Los precios se muestran en euros por unidad especificada</li>
            <li>• Los precios marcados como "Revisar" están fuera del rango típico HORECA</li>
            <li>• España se marca como país principal para referencia</li>
            <li>• Las variaciones estacionales son opcionales pero recomendadas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default IngredientPricesTab;
