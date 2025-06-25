
import UnifiedHeader from "@/components/UnifiedHeader";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import StructuredData from "@/components/StructuredData";
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
  // Generate SEO data for ingredient
  const generateIngredientSEOData = () => {
    if (!ingredient) return null;
    
    const title = `${ingredient.name} | Ingrediente Profesional - Precios y Características`;
    const description = `${ingredient.description} Información completa sobre ${ingredient.name}: precios, merma (${ingredient.merma}%), rendimiento (${ingredient.rendimiento}%), usos culinarios y más.`;
    const keywords = `${ingredient.name}, ${ingredient.name_en}, ${ingredient.categories?.name}, precios ${ingredient.name}, merma ${ingredient.name}, rendimiento ${ingredient.name}`;
    
    // Usar slug limpio para URLs canónicas
    const canonicalUrl = ingredient.slug 
      ? `${window.location.origin}/ingrediente/${ingredient.slug}`
      : `${window.location.origin}/ingrediente/${ingredient.id}`;
    
    return {
      title,
      description,
      keywords,
      ogTitle: `${ingredient.name} - Ingrediente Profesional`,
      ogDescription: description,
      ogType: "article",
      ogImage: ingredient.real_image_url || ingredient.image_url,
      canonical: canonicalUrl
    };
  };

  const seoData = generateIngredientSEOData();
  
  const breadcrumbItems = ingredient ? [
    { name: "Inicio", url: window.location.origin },
    { name: "Directorio", url: `${window.location.origin}/directorio` },
    { 
      name: ingredient.name, 
      url: ingredient.slug 
        ? `${window.location.origin}/ingrediente/${ingredient.slug}`
        : `${window.location.origin}/ingrediente/${ingredient.id}`
    }
  ] : [];

  const breadcrumbSchema = ingredient ? generateBreadcrumbSchema(breadcrumbItems) : null;
  const ingredientSchema = ingredient ? generateIngredientSchema(ingredient) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50 flex flex-col">
      {seoData && <SEOHead seoData={seoData} />}
      {breadcrumbSchema && <StructuredData data={breadcrumbSchema} id="breadcrumb-schema" />}
      {ingredientSchema && <StructuredData data={ingredientSchema} id="ingredient-schema" />}
      
      <UnifiedHeader variant="ingredient-detail" />
      
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
