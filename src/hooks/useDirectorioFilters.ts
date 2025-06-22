
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

interface SearchFilters {
  searchQuery: string;
  category: string;
  sortBy: string;
  priceRange: [number, number];
  popularityRange: [number, number];
  season?: string;
  origin?: string;
}

export const useDirectorioFilters = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: "",
    category: "todos",
    sortBy: "popularidad",
    priceRange: [0, 100],
    popularityRange: [0, 100],
    season: "",
    origin: ""
  });

  // Inicializar búsqueda y filtros desde URL
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    const categoryFromUrl = searchParams.get('categoria');
    
    if (searchFromUrl || categoryFromUrl) {
      setFilters(prev => ({
        ...prev,
        searchQuery: searchFromUrl || "",
        category: categoryFromUrl || "todos"
      }));
    }
  }, [searchParams]);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: "",
      category: "todos",
      sortBy: "popularidad",
      priceRange: [0, 100],
      popularityRange: [0, 100],
      season: "",
      origin: ""
    });
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  return {
    filters,
    viewMode,
    handleFiltersChange,
    handleClearFilters,
    handleViewModeChange
  };
};
