
import { useIngredientDetail } from "@/hooks/useIngredientDetail";
import IngredientDetailLayout from "@/components/ingredient-detail/IngredientDetailLayout";
import IngredientDetailLoading from "@/components/ingredient-detail/IngredientDetailLoading";
import IngredientDetailError from "@/components/ingredient-detail/IngredientDetailError";
import IngredientDetailLimitReached from "@/components/ingredient-detail/IngredientDetailLimitReached";
import IngredientDetailContent from "@/components/ingredient-detail/IngredientDetailContent";

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

  return (
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
  );
};

export default IngredienteDetalle;
