
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIngredientBySlugOrId } from "@/hooks/useIngredientBySlugOrId";
import { useRealImages } from "@/hooks/useRealImages";
import { useGenerateImage } from "@/hooks/useGenerateImage";
import { usePageViewLimit } from "@/hooks/usePageViewLimit";
import { useFavorites } from "@/hooks/useFavorites";

export const useIngredientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState("nombres");
  
  const { data: ingredient, isLoading, error, isLegacyUrl } = useIngredientBySlugOrId(id || "");
  const { data: realImages = [] } = useRealImages(ingredient?.id || "");
  const generateImage = useGenerateImage();
  const { hasReachedLimit, recordPageView, getRemainingViews } = usePageViewLimit();
  const { toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites();

  // Scroll automático al top cuando se carga un nuevo ingrediente
  useEffect(() => {
    if (ingredient?.id) {
      // Usar 'instant' para móviles para evitar problemas de rendimiento
      window.scrollTo({ top: 0, behavior: 'instant' });
      console.log('🔝 Scroll automático al top para ingrediente:', ingredient.name);
    }
  }, [ingredient?.id]);

  // Redirect de URLs antiguas a URLs nuevas
  useEffect(() => {
    if (ingredient && isLegacyUrl && ingredient.slug) {
      // Redirigir a la URL amigable con estado 301 (permanente)
      navigate(`/ingrediente/${ingredient.slug}`, { replace: true });
    }
  }, [ingredient, isLegacyUrl, navigate]);

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
