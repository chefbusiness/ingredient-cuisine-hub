
import { Filter, Grid3X3, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DirectorioResultsProps {
  resultsCount: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  isSearching?: boolean;
}

const DirectorioResults = ({ 
  resultsCount, 
  viewMode, 
  onViewModeChange, 
  isSearching = false 
}: DirectorioResultsProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <p className="text-muted-foreground">
          {isSearching ? (
            <span className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Buscando ingredientes...</span>
            </span>
          ) : (
            <>
              <span className="font-medium text-foreground">{resultsCount}</span> 
              {resultsCount === 1 ? 'ingrediente encontrado' : 'ingredientes encontrados'}
            </>
          )}
        </p>
        {!isSearching && (
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtros activos</span>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant={viewMode === "grid" ? "default" : "outline"} 
          size="sm"
          onClick={() => onViewModeChange("grid")}
          disabled={isSearching}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button 
          variant={viewMode === "list" ? "default" : "outline"} 
          size="sm"
          onClick={() => onViewModeChange("list")}
          disabled={isSearching}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DirectorioResults;
