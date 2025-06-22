
import DirectorioStats from "@/components/DirectorioStats";
import AdvancedSearchFilters from "@/components/AdvancedSearchFilters";
import DirectorioResults from "@/components/DirectorioResults";
import DirectorioGrid from "@/components/DirectorioGrid";
import DirectorioList from "@/components/DirectorioList";
import DirectorioEmpty from "@/components/DirectorioEmpty";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { seedIngredients } from "@/utils/seedData";

interface DirectorioContentProps {
  formattedIngredients: any[];
  categories: Array<{ value: string; label: string }>;
  analytics: any;
  viewMode: "grid" | "list";
  isLoading: boolean;
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  onViewModeChange: (mode: "grid" | "list") => void;
}

const DirectorioContent = ({
  formattedIngredients,
  categories,
  analytics,
  viewMode,
  isLoading,
  onFiltersChange,
  onClearFilters,
  onViewModeChange
}: DirectorioContentProps) => {
  const handleSeedData = async () => {
    try {
      await seedIngredients();
      window.location.reload();
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  return (
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
        onFiltersChange={onFiltersChange}
        categories={categories}
        isLoading={isLoading}
      />

      <DirectorioResults 
        resultsCount={formattedIngredients.length} 
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />

      {formattedIngredients.length === 0 ? (
        <DirectorioEmpty onClearFilters={onClearFilters} />
      ) : (
        viewMode === "grid" ? (
          <DirectorioGrid ingredients={formattedIngredients} />
        ) : (
          <DirectorioList ingredients={formattedIngredients} />
        )
      )}
    </div>
  );
};

export default DirectorioContent;
