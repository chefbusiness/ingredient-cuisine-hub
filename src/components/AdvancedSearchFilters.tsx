
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { X, SlidersHorizontal, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface AdvancedSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  categories: Array<{ value: string; label: string }>;
  isLoading?: boolean;
}

interface SearchFilters {
  searchQuery: string;
  category: string;
  sortBy: string;
  priceRange: [number, number];
  popularityRange: [number, number];
  season?: string;
  origin?: string;
}

const AdvancedSearchFilters = ({ onFiltersChange, categories, isLoading = false }: AdvancedSearchFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Local state for immediate UI updates
  const [localFilters, setLocalFilters] = useState<SearchFilters>({
    searchQuery: "",
    category: "todos",
    sortBy: "popularidad",
    priceRange: [0, 100],
    popularityRange: [0, 100],
    season: "",
    origin: ""
  });

  // Debounced values for text inputs
  const debouncedSearchQuery = useDebounce(localFilters.searchQuery, 500);
  const debouncedOrigin = useDebounce(localFilters.origin || "", 500);

  // Apply filters when debounced values change or immediate filters change
  useEffect(() => {
    const filtersToApply = {
      ...localFilters,
      searchQuery: debouncedSearchQuery,
      origin: debouncedOrigin
    };
    onFiltersChange(filtersToApply);
  }, [
    debouncedSearchQuery,
    debouncedOrigin,
    localFilters.category,
    localFilters.sortBy,
    localFilters.priceRange,
    localFilters.popularityRange,
    localFilters.season,
    onFiltersChange
  ]);

  const handleLocalFilterChange = (key: keyof SearchFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      searchQuery: "",
      category: "todos",
      sortBy: "popularidad",
      priceRange: [0, 100],
      popularityRange: [0, 100],
      season: "",
      origin: ""
    };
    setLocalFilters(defaultFilters);
  };

  const activeFiltersCount = Object.entries(localFilters).filter(([key, value]) => {
    if (key === 'searchQuery') return value !== "";
    if (key === 'category') return value !== "todos";
    if (key === 'sortBy') return value !== "popularidad";
    if (key === 'priceRange') return value[0] !== 0 || value[1] !== 100;
    if (key === 'popularityRange') return value[0] !== 0 || value[1] !== 100;
    return value !== "";
  }).length;

  return (
    <Card className="clean-card mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>Filtros de Búsqueda</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} activos</Badge>
            )}
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Búsqueda principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Buscar ingredientes..."
            value={localFilters.searchQuery}
            onChange={(e) => handleLocalFilterChange('searchQuery', e.target.value)}
          />
          
          <Select value={localFilters.category} onValueChange={(value) => handleLocalFilterChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={localFilters.sortBy} onValueChange={(value) => handleLocalFilterChange('sortBy', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularidad">Popularidad</SelectItem>
              <SelectItem value="nombre">Nombre A-Z</SelectItem>
              <SelectItem value="precio">Precio</SelectItem>
              <SelectItem value="categoria">Categoría</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtros avanzados */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Popularidad: {localFilters.popularityRange[0]}% - {localFilters.popularityRange[1]}%
                </label>
                <Slider
                  value={localFilters.popularityRange}
                  onValueChange={(value) => handleLocalFilterChange('popularityRange', value)}
                  onValueCommit={(value) => handleLocalFilterChange('popularityRange', value)}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select value={localFilters.season || "todas"} onValueChange={(value) => handleLocalFilterChange('season', value === "todas" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Temporada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="Primavera">Primavera</SelectItem>
                    <SelectItem value="Verano">Verano</SelectItem>
                    <SelectItem value="Otoño">Otoño</SelectItem>
                    <SelectItem value="Invierno">Invierno</SelectItem>
                    <SelectItem value="Todo el año">Todo el año</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Origen (ej: España)..."
                  value={localFilters.origin || ""}
                  onChange={(e) => handleLocalFilterChange('origin', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedSearchFilters;
