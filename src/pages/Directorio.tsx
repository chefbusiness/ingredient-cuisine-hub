
import UnifiedHeader from "@/components/UnifiedHeader";
import DirectorioContent from "@/components/DirectorioContent";
import DirectorioLoadingState from "@/components/DirectorioLoadingState";
import DirectorioErrorState from "@/components/DirectorioErrorState";
import { useDirectorioFilters } from "@/hooks/useDirectorioFilters";
import { useDirectorioData } from "@/hooks/useDirectorioData";

const Directorio = () => {
  const {
    filters,
    viewMode,
    handleFiltersChange,
    handleClearFilters,
    handleViewModeChange
  } = useDirectorioFilters();

  const {
    formattedIngredients,
    categories,
    analytics,
    isLoading,
    error
  } = useDirectorioData(filters);

  if (isLoading) {
    return <DirectorioLoadingState />;
  }

  if (error) {
    return <DirectorioErrorState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      <DirectorioContent
        formattedIngredients={formattedIngredients}
        categories={categories}
        analytics={analytics}
        viewMode={viewMode}
        isLoading={isLoading}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        onViewModeChange={handleViewModeChange}
      />
    </div>
  );
};

export default Directorio;
