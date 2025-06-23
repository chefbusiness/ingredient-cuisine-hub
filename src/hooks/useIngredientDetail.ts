
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useIngredientById } from "@/hooks/useIngredients";
import { useRealImages } from "@/hooks/useRealImages";
import { useGenerateImage } from "@/hooks/useGenerateImage";
import { usePageViewLimit } from "@/hooks/usePageViewLimit";
import { useFavorites } from "@/hooks/useFavorites";

export const useIngredientDetail = () => {
  const { id } = useParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState("nombres");
  
  const { data: ingredient, isLoading, error } = useIngredientById(id || "");
  const { data: realImages = [] } = useRealImages(id || "");
  const generateImage = useGenerateImage();
  const { hasReachedLimit, recordPageView, getRemainingViews } = usePageViewLimit();
  const { toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites();

  // Registrar vista de página cuando se carga el ingrediente
  useEffect(() => {
    if (ingredient?.id) {
      const checkPageView = async () => {
        const canView = await recordPageView(ingredient.id);
        if (!canView) {
          setShowAuthModal(true);
        }
      };
      checkPageView();
    }
  }, [ingredient?.id, recordPageView]);

  const handleGenerateImage = async () => {
    if (!ingredient) return;
    
    await generateImage.mutateAsync({
      ingredientName: ingredient.name,
      description: ingredient.description,
      ingredientId: ingredient.id
    });
  };

  const handleNavigateToTab = (tabName: string) => {
    setActiveTab(tabName);
    // Scroll suavemente a las tabs
    const tabsElement = document.querySelector('[role="tablist"]');
    if (tabsElement) {
      tabsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleToggleFavorite = async () => {
    if (!ingredient) return;
    await toggleFavorite(ingredient.id);
  };

  const remainingViews = getRemainingViews();
  const primaryImage = ingredient?.real_image_url || ingredient?.image_url;

  return {
    ingredient,
    isLoading,
    error,
    realImages,
    generateImage,
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
    isFavorite: (ingredientId: string) => isFavorite(ingredientId)
  };
};
