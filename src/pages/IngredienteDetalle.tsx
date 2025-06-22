
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import UnifiedHeader from "@/components/UnifiedHeader";
import { useIngredientById } from "@/hooks/useIngredients";
import { useRealImages } from "@/hooks/useRealImages";
import { useGenerateImage } from "@/hooks/useGenerateImage";
import { usePageViewLimit } from "@/hooks/usePageViewLimit";
import { PageLimitBanner } from "@/components/auth/PageLimitBanner";
import { AuthModal } from "@/components/auth/AuthModal";
import IngredientMainCard from "@/components/ingredient-detail/IngredientMainCard";
import IngredientTabs from "@/components/ingredient-detail/IngredientTabs";
import IngredientSidebar from "@/components/ingredient-detail/IngredientSidebar";

const IngredienteDetalle = () => {
  const { id } = useParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { data: ingredient, isLoading, error } = useIngredientById(id || "");
  const { data: realImages = [] } = useRealImages(id || "");
  const generateImage = useGenerateImage();
  const { hasReachedLimit, recordPageView, getRemainingViews } = usePageViewLimit();

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

  const remainingViews = getRemainingViews();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50">
        <UnifiedHeader variant="ingredient-detail" />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
                <Skeleton className="h-48" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-48" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ingredient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50">
        <UnifiedHeader variant="ingredient-detail" />
        <div className="container mx-auto px-4 py-8">
          <Alert className="max-w-md mx-auto">
            <AlertDescription>
              {error ? 'Error al cargar el ingrediente' : 'Ingrediente no encontrado'}
            </AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Link to="/directorio">
              <Button variant="outline">Volver al directorio</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar modal de límite si se ha alcanzado
  if (hasReachedLimit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50">
        <UnifiedHeader variant="ingredient-detail" />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <h2 className="text-2xl font-bold mb-4">¡Has alcanzado el límite gratuito!</h2>
            <p className="text-muted-foreground mb-6">
              Has visto 20 ingredientes. Regístrate gratis para acceso ilimitado a todo el directorio.
            </p>
            <Button onClick={() => setShowAuthModal(true)} size="lg">
              Registro Gratuito
            </Button>
            <div className="mt-4">
              <Link to="/directorio">
                <Button variant="outline">Volver al directorio</Button>
              </Link>
            </div>
          </div>
        </div>
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  // Usar imagen real si existe, sino la imagen AI generada
  const primaryImage = ingredient.real_image_url || ingredient.image_url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50">
      <UnifiedHeader variant="ingredient-detail" />

      <div className="container mx-auto px-4 py-8">
        {/* Banner de límite de páginas */}
        {remainingViews !== null && (
          <PageLimitBanner 
            remainingViews={remainingViews}
            onShowAuthModal={() => setShowAuthModal(true)}
          />
        )}

        {/* Breadcrumb mejorado */}
        <nav className="flex items-center space-x-2 mb-6 text-sm">
          <Link 
            to="/" 
            className="text-green-600 hover:text-green-700 transition-colors"
          >
            Inicio
          </Link>
          <span className="text-gray-400">/</span>
          <Link 
            to="/directorio" 
            className="text-green-600 hover:text-green-700 transition-colors"
          >
            Directorio
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-medium">{ingredient.name}</span>
        </nav>

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
              isGeneratingImage={generateImage.isPending}
            />
            
            <IngredientTabs 
              ingredient={ingredient}
              realImagesCount={realImages.length}
            />
          </div>

          {/* Right Column - Sidebar */}
          <IngredientSidebar 
            ingredient={ingredient}
            primaryImage={primaryImage}
            onGenerateImage={handleGenerateImage}
            isGeneratingImage={generateImage.isPending}
          />
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default IngredienteDetalle;
