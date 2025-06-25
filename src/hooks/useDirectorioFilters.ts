
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
  country?: string;
}

interface PaginationState {
  page: number;
  limit: number;
}

export const useDirectorioFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 12
  });
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: "",
    category: "todos",
    sortBy: "popularidad",
    priceRange: [0, 100],
    popularityRange: [0, 100],
    season: "",
    origin: "",
    country: "España"
  });

  // Inicializar búsqueda y filtros desde URL
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    const categoryFromUrl = searchParams.get('categoria');
    const countryFromUrl = searchParams.get('pais'); // Nuevo parámetro
    const pageFromUrl = searchParams.get('page');
    
    if (searchFromUrl || categoryFromUrl || countryFromUrl) {
      setFilters(prev => ({
        ...prev,
        searchQuery: searchFromUrl || "",
        category: categoryFromUrl || "todos",
        country: countryFromUrl || "España" // Aplicar país desde URL
      }));
    }

    if (pageFromUrl) {
      const pageNum = parseInt(pageFromUrl, 10);
      if (pageNum > 0) {
        setPagination(prev => ({
          ...prev,
          page: pageNum
        }));
      }
    }
  }, [searchParams]);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    // Evitar actualizaciones innecesarias comparando el contenido
    const hasChanged = JSON.stringify(filters) !== JSON.stringify(newFilters);
    if (hasChanged) {
      setFilters(newFilters);
      // Reset pagination when filters change
      setPagination(prev => ({ ...prev, page: 1 }));
      
      // Update URL params
      const newSearchParams = new URLSearchParams(searchParams);
      if (newFilters.searchQuery) {
        newSearchParams.set('search', newFilters.searchQuery);
      } else {
        newSearchParams.delete('search');
      }
      if (newFilters.category !== 'todos') {
        newSearchParams.set('categoria', newFilters.category);
      } else {
        newSearchParams.delete('categoria');
      }
      if (newFilters.country && newFilters.country !== 'España') {
        newSearchParams.set('pais', newFilters.country);
      } else {
        newSearchParams.delete('pais');
      }
      newSearchParams.delete('page'); // Reset page when filters change
      setSearchParams(newSearchParams);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: "",
      category: "todos",
      sortBy: "popularidad",
      priceRange: [0, 100],
      popularityRange: [0, 100],
      season: "",
      origin: "",
      country: "España"
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Clear URL params
    setSearchParams({});
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    
    // Update URL params
    const newSearchParams = new URLSearchParams(searchParams);
    if (newPage > 1) {
      newSearchParams.set('page', newPage.toString());
    } else {
      newSearchParams.delete('page');
    }
    setSearchParams(newSearchParams);

    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    filters,
    viewMode,
    pagination,
    handleFiltersChange,
    handleClearFilters,
    handleViewModeChange,
    handlePageChange
  };
};
