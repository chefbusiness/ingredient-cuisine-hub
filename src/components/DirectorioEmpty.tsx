
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DirectorioEmptyProps {
  onClearFilters: () => void;
}

const DirectorioEmpty = ({ onClearFilters }: DirectorioEmptyProps) => {
  return (
    <div className="text-center py-16">
      <div className="mb-6">
        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-medium text-foreground mb-2">
          No se encontraron ingredientes
        </h3>
        <p className="text-muted-foreground">
          No se encontraron ingredientes que coincidan con tu búsqueda.
        </p>
      </div>
      <Button onClick={onClearFilters} className="btn-clean">
        Limpiar filtros
      </Button>
    </div>
  );
};

export default DirectorioEmpty;
