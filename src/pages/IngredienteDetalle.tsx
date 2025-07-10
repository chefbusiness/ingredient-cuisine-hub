
import { useIngredientDetail } from "@/hooks/useIngredientDetail";
import IngredientDetailLayout from "@/components/ingredient-detail/IngredientDetailLayout";
import IngredientDetailLoading from "@/components/ingredient-detail/IngredientDetailLoading";
import IngredientDetailError from "@/components/ingredient-detail/IngredientDetailError";
import IngredientDetailLimitReached from "@/components/ingredient-detail/IngredientDetailLimitReached";
import IngredientDetailContent from "@/components/ingredient-detail/IngredientDetailContent";
import AIChefBot from "@/components/AIChefBot";
import SEOHead from "@/components/SEOHead";
import StructuredData from "@/components/StructuredData";
import { generateIngredientSEO, generateIngredientSchema, generateBreadcrumbSchema } from "@/utils/seoSchemas";

const IngredienteDetalle = () => {
  const {
    ingredient,
    isLoading,
    error,
    realImages,
    hasReachedLimit,
    remainingViews,
    primaryImage,
    activeTab,
    setActiveTab,
    showAuthModal,
    setShowAuthModal,
    favoritesLoading,
    handleGenerateImage,
    handleNavigateToTab,
    handleToggleFavorite,
    isFavorite,
    generateImage
  } = useIngredientDetail();

  if (isLoading) {
    return <IngredientDetailLoading />;
  }

  if (error || !ingredient) {
    return <IngredientDetailError error={error} />;
  }

  // Mostrar modal de límite si se ha alcanzado
  if (hasReachedLimit) {
    return (
      <IngredientDetailLimitReached 
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
      />
    );
  }

  // Generar datos SEO para el ingrediente
  const seoData = generateIngredientSEO(ingredient);
  const ingredientSchema = generateIngredientSchema(ingredient);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Inicio', url: 'https://ingredientsindex.pro/' },
    { name: 'Directorio', url: 'https://ingredientsindex.pro/directorio' },
    { name: ingredient.name, url: seoData.canonical || '' }
  ]);

  return (
    <>
      {/* SEO optimizado para cada ingrediente */}
      <SEOHead seoData={seoData} />
      <StructuredData data={ingredientSchema} id="ingredient-schema" />
      <StructuredData data={breadcrumbSchema} id="breadcrumb-schema" />
      
      <IngredientDetailLayout 
        ingredient={ingredient}
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
      >
        <IngredientDetailContent
          ingredient={ingredient}
          realImages={realImages}
          primaryImage={primaryImage}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          remainingViews={remainingViews}
          setShowAuthModal={setShowAuthModal}
          handleGenerateImage={handleGenerateImage}
          isGeneratingImage={generateImage.isPending}
          handleToggleFavorite={handleToggleFavorite}
          isFavorite={isFavorite}
          favoritesLoading={favoritesLoading}
          handleNavigateToTab={handleNavigateToTab}
        />
      </IngredientDetailLayout>
      <AIChefBot />
    </>
  );
};

export default IngredienteDetalle;
