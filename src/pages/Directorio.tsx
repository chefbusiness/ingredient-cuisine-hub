
import UnifiedHeader from "@/components/UnifiedHeader";
import DirectorioContent from "@/components/DirectorioContent";
import DirectorioLoadingState from "@/components/DirectorioLoadingState";
import DirectorioErrorState from "@/components/DirectorioErrorState";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import StructuredData from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import AIChefBot from "@/components/AIChefBot";
import { useDirectorioFilters } from "@/hooks/useDirectorioFilters";
import { useDirectorioData } from "@/hooks/useDirectorioData";
import { generateBreadcrumbSchema } from "@/utils/seoSchemas";

const Directorio = () => {
  const {
    filters,
    viewMode,
    pagination,
    handleFiltersChange,
    handleClearFilters,
    handleViewModeChange,
    handlePageChange
  } = useDirectorioFilters();

  const {
    formattedIngredients,
    categories,
    analytics,
    totalCount,
    isLoading,
    error
  } = useDirectorioData(filters, pagination);

  const BASE_URL = 'https://ingredientsindex.pro';

  // Generate dynamic SEO data based on filters and results
  const generateSEOData = () => {
    const ingredientCount = formattedIngredients?.length || 0;
    const categoryFilter = filters.category !== 'todos' ? ` de ${filters.category}` : '';
    const searchFilter = filters.searchQuery ? ` "${filters.searchQuery}"` : '';
    
    const title = `Directorio de Ingredientes${categoryFilter}${searchFilter} | ${ingredientCount} resultados | IngredientsIndex.pro`;
    const description = `Explora ${ingredientCount} ingredientes${categoryFilter} en nuestro directorio profesional. Información detallada sobre precios, mermas, rendimientos y usos culinarios.`;
    
    return {
      title,
      description,
      keywords: `directorio ingredientes${categoryFilter}, búsqueda ingredientes, precios ingredientes${categoryFilter}`,
      canonical: `${BASE_URL}/directorio`
    };
  };

  const seoData = generateSEOData();
  
  const breadcrumbItems = [
    { name: "Directorio", url: "/directorio", current: true }
  ];

  const breadcrumbSchemaItems = [
    { name: "Inicio", url: BASE_URL },
    { name: "Directorio", url: `${BASE_URL}/directorio` }
  ];
  
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbSchemaItems);

  if (isLoading && formattedIngredients.length === 0) {
    return <DirectorioLoadingState />;
  }

  if (error) {
    return <DirectorioErrorState />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead seoData={seoData} />
      <StructuredData data={breadcrumbSchema} id="breadcrumb-schema" />
      
      <UnifiedHeader />
      
      {/* Breadcrumbs visuales */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>
      
      <main className="flex-1">
        <DirectorioContent
          formattedIngredients={formattedIngredients}
          categories={categories}
          analytics={analytics}
          viewMode={viewMode}
          isLoading={isLoading}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          onViewModeChange={handleViewModeChange}
          currentFilters={filters}
          pagination={pagination}
          totalCount={totalCount}
          onPageChange={handlePageChange}
        />
      </main>
      <Footer />
      <AIChefBot />
    </div>
  );
};

export default Directorio;
