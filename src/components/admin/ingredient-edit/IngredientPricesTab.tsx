
import { useState } from "react";
import { Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, AlertTriangle } from "lucide-react";
import { useCountries } from "@/hooks/useCountries";
import { useUpdateIngredientPrice, useDeleteIngredientPrice } from "@/hooks/useUpdateIngredientPrice";
import { Ingredient } from "@/hooks/useIngredients";
import { IngredientFormData } from "./types";
import { PriceEditData } from "./price-management/PriceValidation";
import PriceTableRow from "./price-management/PriceTableRow";
import PriceEditRow from "./price-management/PriceEditRow";
import PriceInfoCard from "./price-management/PriceInfoCard";

interface IngredientPricesTabProps {
  control: Control<IngredientFormData>;
  ingredient: Ingredient | null;
}

const IngredientPricesTab = ({ control, ingredient }: IngredientPricesTabProps) => {
  const { data: countries = [] } = useCountries();
  const { mutate: updatePrice, isPending: isUpdating } = useUpdateIngredientPrice();
  const { mutate: deletePrice, isPending: isDeleting } = useDeleteIngredientPrice();
  
  const [editingPrice, setEditingPrice] = useState<PriceEditData | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  console.log('🔍 IngredientPricesTab - Ingredient data:', ingredient);
  console.log('🔍 IngredientPricesTab - Raw prices:', ingredient?.ingredient_prices);

  // Obtener precios actuales del ingrediente con validaciones de seguridad
  const currentPrices = (ingredient?.ingredient_prices || []).filter(priceItem => {
    const isValid = priceItem && 
      priceItem.id &&
      typeof priceItem.price === 'number' && 
      priceItem.unit &&
      priceItem.country_id;
    
    if (!isValid) {
      console.warn('❌ Precio inválido encontrado:', priceItem);
    }
    
    return isValid;
  });

  console.log('✅ Valid current prices:', currentPrices);
  console.log('🌍 Countries data:', countries);

  const getCountryName = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    return country?.name || 'País no especificado';
  };

  const handleEditPrice = (priceData: any, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('📝 Editing price:', priceData);
    
    if (!priceData || !priceData.id || !priceData.country_id) {
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

  const handleSavePrice = (event: React.MouseEvent) => {
    event.stopPropagation();
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

  const handleDeletePrice = (priceId: string, event: React.MouseEvent) => {
    event.stopPropagation();
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

  const handleAddNew = (event: React.MouseEvent) => {
    event.stopPropagation();
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

  const handleCancelEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingPrice(null);
    setIsAddingNew(false);
  };

  const handleUpdateEditingPrice = (updates: Partial<PriceEditData>) => {
    if (editingPrice) {
      setEditingPrice({ ...editingPrice, ...updates });
    }
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
                const countryName = priceData.countries?.name || getCountryName(priceData.country_id);
                
                return isEditing && editingPrice ? (
                  <PriceEditRow
                    key={priceData.id}
                    editingPrice={editingPrice}
                    isAddingNew={false}
                    isUpdating={isUpdating}
                    availableCountries={countries}
                    onUpdateEditingPrice={handleUpdateEditingPrice}
                    onSave={handleSavePrice}
                    onCancel={handleCancelEdit}
                  />
                ) : (
                  <PriceTableRow
                    key={priceData.id}
                    priceData={priceData}
                    countryName={countryName}
                    onEdit={handleEditPrice}
                    onDelete={handleDeletePrice}
                    isDeleting={isDeleting}
                  />
                );
              })}

              {/* Fila para añadir nuevo precio */}
              {isAddingNew && editingPrice && (
                <PriceEditRow
                  editingPrice={editingPrice}
                  isAddingNew={true}
                  isUpdating={isUpdating}
                  availableCountries={availableCountries}
                  onUpdateEditingPrice={handleUpdateEditingPrice}
                  onSave={handleSavePrice}
                  onCancel={handleCancelEdit}
                />
              )}
            </TableBody>
          </Table>
        )}

        <PriceInfoCard />
      </CardContent>
    </Card>
  );
};

export default IngredientPricesTab;
