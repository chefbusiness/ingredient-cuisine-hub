
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { isPriceErroneous } from "./PriceValidation";
import { getUnitSymbol } from "@/utils/unitFormatting";

interface PriceTableRowProps {
  priceData: any;
  countryName: string;
  onEdit: (priceData: any, event: React.MouseEvent) => void;
  onDelete: (priceId: string, event: React.MouseEvent) => void;
  isDeleting: boolean;
}

const PriceTableRow = ({ priceData, countryName, onEdit, onDelete, isDeleting }: PriceTableRowProps) => {
  const isErroneous = isPriceErroneous(priceData.price, priceData.unit);
  const isSpanishPrice = countryName === 'España' || priceData.countries?.code === 'ES';

  return (
    <TableRow key={priceData.id} className={isSpanishPrice ? 'bg-green-50/30' : ''}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {countryName}
          {isSpanishPrice && (
            <Badge className="bg-green-100 text-green-700 text-xs">
              Principal
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className={isErroneous ? 'text-red-600 font-semibold' : isSpanishPrice ? 'text-green-600 font-medium' : ''}>
          €{priceData.price.toFixed(2)}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {getUnitSymbol(priceData.unit)}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {priceData.season_variation || '-'}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {isErroneous && (
            <Badge variant="destructive" className="text-xs">
              Revisar
            </Badge>
          )}
          {isSpanishPrice && (
            <Badge variant="secondary" className="text-xs">
              Referencia
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => onEdit(priceData, e)}
            className="h-7 px-2"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => onDelete(priceData.id, e)}
            disabled={isDeleting}
            className="h-7 px-2"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default PriceTableRow;
