
import UnifiedHeader from "@/components/UnifiedHeader";
import DirectorioContent from "@/components/DirectorioContent";
import DirectorioLoadingState from "@/components/DirectorioLoadingState";
import DirectorioErrorState from "@/components/DirectorioErrorState";
import SEOHead from "@/components/SEOHead";
import StructuredData from "@/components/StructuredData";
import { useDirectorioFilters } from "@/hooks/useDirectorioFilters";
import { useDirectorioData } from "@/hooks/useDirectorioData";
import { generateBreadcrumbSchema } from "@/utils/seoSchemas";

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

  // Generate dynamic SEO data based on filters and results
  const generateSEOData = () => {
    const ingredientCount = formattedIngredients?.length || 0;
    const categoryFilter = filters.category !== 'todos' ? ` de ${filters.category}` : '';
    const searchFilter = filters.searchQuery ? ` "${filters.searchQuery}"` : '';
    
    const title = `Directorio de Ingredientes${categoryFilter}${searchFilter} | ${ingredientCount} resultados`;
    const description = `Explora ${ingredientCount} ingredientes${categoryFilter} en nuestro directorio profesional. Información detallada sobre precios, mermas, rendimientos y usos culinarios.`;
    
    return {
      title,
      description,
      keywords: `directorio ingredientes${categoryFilter}, búsqueda ingredientes, precios ingredientes${categoryFilter}`,
      canonical: `${window.location.origin}/directorio`
    };
  };

  const seoData = generateSEOData();
  
  const breadcrumbItems = [
    { name: "Inicio", url: window.location.origin },
    { name: "Directorio", url: `${window.location.origin}/directorio` }
  ];
  
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  if (isLoading) {
    return <DirectorioLoadingState />;
  }

  if (error) {
    return <DirectorioErrorState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead seoData={seoData} />
      <StructuredData data={breadcrumbSchema} id="breadcrumb-schema" />
      
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
