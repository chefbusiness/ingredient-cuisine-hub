
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIngredientById } from "@/hooks/useIngredients";
import { useRealImages } from "@/hooks/useRealImages";
import { useGenerateImage } from "@/hooks/useContentGeneration";
import IngredientDetailHeader from "@/components/ingredient-detail/IngredientDetailHeader";
import IngredientMainCard from "@/components/ingredient-detail/IngredientMainCard";
import IngredientTabs from "@/components/ingredient-detail/IngredientTabs";
import IngredientSidebar from "@/components/ingredient-detail/IngredientSidebar";

const IngredienteDetalle = () => {
  const { id } = useParams();
  const { data: ingredient, isLoading, error } = useIngredientById(id || "");
  const { data: realImages = [] } = useRealImages(id || "");
  const generateImage = useGenerateImage();

  const handleGenerateImage = async () => {
    if (!ingredient) return;
    
    await generateImage.mutateAsync({
      ingredientName: ingredient.name,
      description: ingredient.description,
      ingredientId: ingredient.id // Pasar el ID del ingrediente
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50">
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

  // Usar imagen real si existe, sino la imagen AI generada
  const primaryImage = ingredient.real_image_url || ingredient.image_url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50">
      <IngredientDetailHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6">
          <Link 
            to="/directorio" 
            className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors"
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
    </div>
  );
};

export default IngredienteDetalle;
