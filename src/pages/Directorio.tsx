import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import UnifiedHeader from "@/components/UnifiedHeader";
import DirectorioStats from "@/components/DirectorioStats";
import AdvancedSearchFilters from "@/components/AdvancedSearchFilters";
import DirectorioResults from "@/components/DirectorioResults";
import DirectorioGrid from "@/components/DirectorioGrid";
import DirectorioList from "@/components/DirectorioList";
import DirectorioEmpty from "@/components/DirectorioEmpty";
import { useAdvancedIngredients } from "@/hooks/useAdvancedIngredients";
import { useIngredientAnalytics } from "@/hooks/useIngredientAnalytics";
import { useCategories } from "@/hooks/useCategories";
import { seedIngredients } from "@/utils/seedData";
import { Button } from "@/components/ui/button";
import { Database, Loader } from "lucide-react";

interface SearchFilters {
  searchQuery: string;
  category: string;
  sortBy: string;
  priceRange: [number, number];
  popularityRange: [number, number];
  season?: string;
  origin?: string;
}

const Directorio = () => {
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

  // Usar hooks para obtener datos
  const { data: ingredients = [], isLoading: isLoadingIngredients, error: ingredientsError } = useAdvancedIngredients(filters);
  const { data: categoriesData = [], isLoading: isLoadingCategories } = useCategories();
  const { data: analytics, isLoading: isLoadingAnalytics } = useIngredientAnalytics();

  // Convertir categorías para el componente de filtros
  const categories = useMemo(() => {
    const baseCategories = [{ value: "todos", label: "Todas las categorías" }];
    const dynamicCategories = categoriesData.map(cat => ({
      value: cat.name,
      label: cat.name.charAt(0).toUpperCase() + cat.name.slice(1)
    }));
    return [...baseCategories, ...dynamicCategories];
  }, [categoriesData]);

  // Convertir ingredientes al formato esperado por DirectorioGrid
  const formattedIngredients = useMemo(() => {
    return ingredients.map(ingredient => ({
      id: ingredient.id,
      name: ingredient.name,
      nameEN: ingredient.name_en,
      nameLA: ingredient.name_la || "",
      category: ingredient.categories?.name || "",
      popularity: ingredient.popularity,
      price: ingredient.ingredient_prices?.[0] 
        ? `${ingredient.ingredient_prices[0].countries?.currency_symbol || "€"}${ingredient.ingredient_prices[0].price}/${ingredient.ingredient_prices[0].unit}`
        : "Precio no disponible",
      priceUS: "$0.00/kg",
      description: ingredient.description,
      image: ingredient.real_image_url || ingredient.image_url || "",
      merma: Number(ingredient.merma),
      rendimiento: Number(ingredient.rendimiento),
      temporada: ingredient.temporada || "Todo el año",
      hasAIImage: !!ingredient.image_url,
      hasRealImage: !!ingredient.real_image_url
    }));
  }, [ingredients]);

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

  const handleSeedData = async () => {
    try {
      await seedIngredients();
      window.location.reload();
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  if (isLoadingIngredients || isLoadingCategories || isLoadingAnalytics) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando directorio...</span>
          </div>
        </div>
      </div>
    );
  }

  if (ingredientsError) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">Error cargando los datos</p>
            <Button onClick={handleSeedData} className="btn-clean">
              <Database className="mr-2 h-4 w-4" />
              Cargar Datos de Ejemplo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />

      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-3 heading-clean">
            Directorio Completo de Ingredientes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explora nuestra base de datos completa con información detallada sobre precios, 
            mermas, rendimientos y usos profesionales.
          </p>
          
          {formattedIngredients.length === 0 && (
            <div className="mt-6">
              <Button onClick={handleSeedData} className="btn-clean">
                <Database className="mr-2 h-4 w-4" />
                Cargar Datos de Ejemplo
              </Button>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        {analytics && (
          <DirectorioStats
            totalIngredients={analytics.totalIngredients}
            totalCategories={analytics.categoriesCount}
            searchResults={formattedIngredients.length}
            popularIngredient={analytics.mostPopularIngredient}
          />
        )}

        {/* Filtros avanzados */}
        <AdvancedSearchFilters
          onFiltersChange={handleFiltersChange}
          categories={categories}
          isLoading={isLoadingIngredients}
        />

        <DirectorioResults 
          resultsCount={formattedIngredients.length} 
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />

        {formattedIngredients.length === 0 ? (
          <DirectorioEmpty onClearFilters={handleClearFilters} />
        ) : (
          viewMode === "grid" ? (
            <DirectorioGrid ingredients={formattedIngredients} />
          ) : (
            <DirectorioList ingredients={formattedIngredients} />
          )
        )}
      </div>
    </div>
  );
};

export default Directorio;
