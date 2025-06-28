
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { isPriceErroneous, PriceEditData } from "./PriceValidation";

interface PriceTableRowProps {
  priceData: any;
  countryName: string;
  onEdit: (priceData: any, event: React.MouseEvent) => void;
  onDelete: (priceId: string, event: React.MouseEvent) => void;
  isDeleting: boolean;
}

const PriceTableRow = ({ priceData, countryName, onEdit, onDelete, isDeleting }: PriceTableRowProps) => {
  const isErroneous = isPriceErroneous(priceData.price, priceData.unit);

  return (
    <TableRow key={priceData.id}>
      <TableCell className="font-medium">
        {countryName}
        {(countryName === 'España' || priceData.countries?.code === 'ES') && (
          <Badge className="ml-2 bg-green-100 text-green-700 text-xs">
            Principal
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <span className={isErroneous ? 'text-red-600 font-semibold' : ''}>
          €{priceData.price.toFixed(2)}
        </span>
      </TableCell>
      <TableCell>{priceData.unit}</TableCell>
      <TableCell>{priceData.season_variation || '-'}</TableCell>
      <TableCell>
        {isErroneous && (
          <Badge variant="destructive" className="text-xs">
            Revisar
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => onEdit(priceData, e)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => onDelete(priceData.id, e)}
            disabled={isDeleting}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default PriceTableRow;
