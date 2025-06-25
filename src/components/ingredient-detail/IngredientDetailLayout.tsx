
import UnifiedHeader from "@/components/UnifiedHeader";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import StructuredData from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { AuthModal } from "@/components/auth/AuthModal";
import { Ingredient } from "@/hooks/useIngredients";
import { generateIngredientSchema, generateBreadcrumbSchema } from "@/utils/seoSchemas";

interface IngredientDetailLayoutProps {
  ingredient?: Ingredient;
  children: React.ReactNode;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const IngredientDetailLayout = ({ 
  ingredient, 
  children, 
  showAuthModal, 
  setShowAuthModal 
}: IngredientDetailLayoutProps) => {
  const BASE_URL = 'https://ingredientsindex.pro';
  
  // Generate SEO data for ingredient
  const generateIngredientSEOData = () => {
    if (!ingredient) return null;
    
    const title = `${ingredient.name} | Ingrediente Profesional - Precios y Características | IngredientsIndex.pro`;
    const description = `${ingredient.description} Información completa sobre ${ingredient.name}: precios, merma (${ingredient.merma}%), rendimiento (${ingredient.rendimiento}%), usos culinarios y más.`;
    const keywords = `${ingredient.name}, ${ingredient.name_en}, ${ingredient.categories?.name}, precios ${ingredient.name}, merma ${ingredient.name}, rendimiento ${ingredient.name}`;
    
    // Usar slug limpio para URLs canónicas
    const canonicalUrl = ingredient.slug 
      ? `${BASE_URL}/ingrediente/${ingredient.slug}`
      : `${BASE_URL}/ingrediente/${ingredient.id}`;
    
    return {
      title,
      description,
      keywords,
      ogTitle: `${ingredient.name} - Ingrediente Profesional | IngredientsIndex.pro`,
      ogDescription: description,
      ogType: "article",
      ogImage: ingredient.real_image_url || ingredient.image_url || `${BASE_URL}/og-image.jpg`,
      canonical: canonicalUrl
    };
  };

  const seoData = generateIngredientSEOData();
  
  const breadcrumbItems = ingredient ? [
    { name: "Directorio", url: "/directorio" },
    { 
      name: ingredient.name, 
      url: ingredient.slug 
        ? `/ingrediente/${ingredient.slug}`
        : `/ingrediente/${ingredient.id}`,
      current: true
    }
  ] : [];

  const breadcrumbSchemaItems = ingredient ? [
    { name: "Inicio", url: BASE_URL },
    { name: "Directorio", url: `${BASE_URL}/directorio` },
    { 
      name: ingredient.name, 
      url: ingredient.slug 
        ? `${BASE_URL}/ingrediente/${ingredient.slug}`
        : `${BASE_URL}/ingrediente/${ingredient.id}`
    }
  ] : [];

  const breadcrumbSchema = ingredient ? generateBreadcrumbSchema(breadcrumbSchemaItems) : null;
  const ingredientSchema = ingredient ? generateIngredientSchema(ingredient) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50 flex flex-col">
      {seoData && <SEOHead seoData={seoData} />}
      {breadcrumbSchema && <StructuredData data={breadcrumbSchema} id="breadcrumb-schema" />}
      {ingredientSchema && <StructuredData data={ingredientSchema} id="ingredient-schema" />}
      
      <UnifiedHeader variant="ingredient-detail" />
      
      {/* Breadcrumbs visuales */}
      {ingredient && (
        <div className="bg-white/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-3">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
        </div>
      )}
      
      {children}

      <Footer />

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default IngredientDetailLayout;
