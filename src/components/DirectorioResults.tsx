
import { Grid, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DirectorioResultsProps {
  resultsCount: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  isSearching?: boolean;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
}

const DirectorioResults = ({ 
  resultsCount, 
  viewMode, 
  onViewModeChange, 
  isSearching = false,
  totalCount = 0,
  currentPage = 1,
  totalPages = 1
}: DirectorioResultsProps) => {
  const displayCount = totalCount > 0 ? totalCount : resultsCount;
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-3">
        <Search className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">
            {isSearching ? (
              "Buscando ingredientes..."
            ) : (
              <>
                {displayCount} ingrediente{displayCount !== 1 ? 's' : ''} encontrado{displayCount !== 1 ? 's' : ''}
                {totalPages > 1 && (
                  <span className="text-muted-foreground ml-2">
                    (Página {currentPage} de {totalPages})
                  </span>
                )}
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {isSearching ? (
              "Aplicando filtros y ordenamiento..."
            ) : totalPages > 1 ? (
              `Mostrando ${resultsCount} resultados en esta página`
            ) : (
              "Utiliza los filtros para refinar tu búsqueda"
            )}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">Vista:</span>
        <Button
          variant={viewMode === "grid" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("grid")}
          className="h-8 w-8 p-0"
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("list")}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DirectorioResults;
