import UnifiedHeader from "@/components/UnifiedHeader";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedIngredientsSection from "@/components/FeaturedIngredientsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import StructuredData from "@/components/StructuredData";
import { generateOrganizationSchema, generateWebsiteSchema, generateFoodEstablishmentSchema } from "@/utils/seoSchemas";

const Index = () => {
  const seoData = {
    title: "Directorio de Ingredientes de Cocina y Hostelería | Precios, Mermas y Rendimientos",
    description: "Directorio profesional de ingredientes culinarios con información detallada sobre precios, mermas, rendimientos y usos para chefs y profesionales de la hostelería. Acceso gratuito a 20+ ingredientes.",
    keywords: "ingredientes cocina, hostelería, precios ingredientes, merma, rendimiento, chefs profesionales, directorio culinario",
    ogTitle: "Directorio Profesional de Ingredientes Culinarios",
    ogDescription: "Tu herramienta profesional para encontrar información detallada sobre ingredientes culinarios",
    ogType: "website",
    ogImage: "https://lovable.dev/opengraph-image-p98pqg.png",
    twitterCard: "summary_large_image",
    canonical: window.location.origin
  };

  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();
  const foodEstablishmentSchema = generateFoodEstablishmentSchema();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead seoData={seoData} />
      <StructuredData data={organizationSchema} id="organization-schema" />
      <StructuredData data={websiteSchema} id="website-schema" />
      <StructuredData data={foodEstablishmentSchema} id="food-establishment-schema" />
      
      <UnifiedHeader />
      <HeroSection />
      <CategoriesSection />
      <FeaturedIngredientsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
