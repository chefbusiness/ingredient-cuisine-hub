import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageLimitBanner } from "@/components/auth/PageLimitBanner";
import IngredientMainCard from "@/components/ingredient-detail/IngredientMainCard";
import IngredientTabs from "@/components/ingredient-detail/IngredientTabs";
import IngredientSidebar from "@/components/ingredient-detail/IngredientSidebar";
import AdBanner from "@/components/AdBanner";
import { Ingredient } from "@/hooks/useIngredients";

interface IngredientDetailContentProps {
  ingredient: Ingredient;
  realImages: any[];
  primaryImage?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  remainingViews: number | null;
  setShowAuthModal: (show: boolean) => void;
  handleGenerateImage: () => void;
  isGeneratingImage: boolean;
  handleToggleFavorite: () => void;
  isFavorite: (id: string) => boolean;
  favoritesLoading: boolean;
  handleNavigateToTab: (tabName: string) => void;
}

const IngredientDetailContent = ({
  ingredient,
  realImages,
  primaryImage,
  activeTab,
  setActiveTab,
  remainingViews,
  setShowAuthModal,
  handleGenerateImage,
  isGeneratingImage,
  handleToggleFavorite,
  isFavorite,
  favoritesLoading,
  handleNavigateToTab
}: IngredientDetailContentProps) => {
  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8">
        {/* Banner de límite de páginas */}
        {remainingViews !== null && (
          <PageLimitBanner 
            remainingViews={remainingViews}
            onShowAuthModal={() => setShowAuthModal(true)}
          />
        )}

        {/* Botón volver */}
        <div className="mb-6">
          <Link 
            to="/directorio" 
            className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al directorio</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <IngredientMainCard 
              ingredient={ingredient}
              primaryImage={primaryImage}
              onGenerateImage={handleGenerateImage}
              isGeneratingImage={isGeneratingImage}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFavorite(ingredient?.id || "")}
              isToggleFavoriteLoading={favoritesLoading}
            />
            
            <IngredientTabs 
              ingredient={ingredient}
              realImagesCount={realImages.length}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Right Column - Sidebar */}
          <IngredientSidebar 
            ingredient={ingredient}
            primaryImage={primaryImage}
            onGenerateImage={handleGenerateImage}
            isGeneratingImage={isGeneratingImage}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite(ingredient?.id || "")}
            isToggleFavoriteLoading={favoritesLoading}
            onNavigateToTab={handleNavigateToTab}
          />
        </div>

        {/* Consultoría Online Banner */}
        <div className="mt-12 mb-8">
          <AdBanner
            title="Consultoría Online para Restaurantes"
            description="Servicio especializado de consultoría para restaurantes y negocios de hostelería. Optimiza tu operación y aumenta tu rentabilidad."
            url="https://chefbusiness.co/consultoria-online-para-restaurantes/"
            ctaText="Saber Más"
            variant="primary"
            size="default"
          />
        </div>
      </div>
    </main>
  );
};

export default IngredientDetailContent;
