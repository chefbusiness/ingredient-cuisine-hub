
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
    country: "" // Sin país por defecto - lo determinará la URL
  });

  // Inicializar búsqueda y filtros desde URL
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    const categoryFromUrl = searchParams.get('categoria');
    const countryFromUrl = searchParams.get('pais');
    const pageFromUrl = searchParams.get('page');
    
    console.log('🔗 Parámetros URL detectados:', { 
      search: searchFromUrl, 
      categoria: categoryFromUrl, 
      pais: countryFromUrl,
      page: pageFromUrl 
    });
    
    // Aplicar filtros desde URL - incluyendo país vacío si no está en URL
    const newFilters = {
      ...filters,
      searchQuery: searchFromUrl || "",
      category: categoryFromUrl || "todos",
      country: countryFromUrl || "" // Vacío si no hay país en URL
    };
    
    console.log('🔄 Aplicando filtros desde URL:', newFilters);
    setFilters(newFilters);

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
      console.log('🔄 Cambiando filtros:', newFilters);
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
      if (newFilters.country && newFilters.country.trim()) {
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
      country: "" // Sin país por defecto
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
