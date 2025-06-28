
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { PriceEditData } from "./PriceValidation";

interface PriceEditRowProps {
  editingPrice: PriceEditData;
  isAddingNew: boolean;
  isUpdating: boolean;
  availableCountries: any[];
  onUpdateEditingPrice: (updates: Partial<PriceEditData>) => void;
  onSave: (event: React.MouseEvent) => void;
  onCancel: (event: React.MouseEvent) => void;
}

const PriceEditRow = ({ 
  editingPrice, 
  isAddingNew, 
  isUpdating, 
  availableCountries, 
  onUpdateEditingPrice, 
  onSave, 
  onCancel 
}: PriceEditRowProps) => {
  return (
    <TableRow className={isAddingNew ? "bg-blue-50" : ""}>
      <TableCell>
        {isAddingNew ? (
          <Select 
            value={editingPrice.countryId} 
            onValueChange={(value) => {
              const country = availableCountries.find(c => c.id === value);
              onUpdateEditingPrice({
                countryId: value,
                countryName: country?.name || ''
              });
            }}
          >
            <SelectTrigger onClick={(e) => e.stopPropagation()}>
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
        ) : (
          editingPrice.countryName
        )}
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.01"
          value={editingPrice.price}
          onChange={(e) => onUpdateEditingPrice({
            price: parseFloat(e.target.value) || 0
          })}
          placeholder="0.00"
          className="w-20"
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>
      <TableCell>
        <Select 
          value={editingPrice.unit} 
          onValueChange={(value) => onUpdateEditingPrice({ unit: value })}
        >
          <SelectTrigger className="w-20" onClick={(e) => e.stopPropagation()}>
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
          onChange={(e) => onUpdateEditingPrice({
            seasonVariation: e.target.value
          })}
          placeholder={isAddingNew ? "Opcional" : "Ej: Más caro en invierno"}
          className="w-32"
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>
      <TableCell>
        <Badge variant={isAddingNew ? "secondary" : "outline"} className="text-xs">
          {isAddingNew ? "Nuevo" : "Editando"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onSave}
            disabled={isUpdating || (isAddingNew && !editingPrice.countryId)}
          >
            <Save className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default PriceEditRow;
