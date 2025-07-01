
import UnifiedHeader from "@/components/UnifiedHeader";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import PopularIngredientsHomepageSection from "@/components/PopularIngredientsHomepageSection";
import FeaturedIngredientsSection from "@/components/FeaturedIngredientsSection";
import StatsSection from "@/components/StatsSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import StructuredData from "@/components/StructuredData";
import AIChefBot from "@/components/AIChefBot";
import { generateOrganizationSchema, generateWebsiteSchema, generateFoodEstablishmentSchema } from "@/utils/seoSchemas";

const Index = () => {
  const seoData = {
    title: "Directorio de Ingredientes de Cocina y Hostelería | Precios, Mermas y Rendimientos | IngredientsIndex.pro",
    description: "Directorio profesional de ingredientes culinarios con información detallada sobre precios, mermas, rendimientos y usos para chefs y profesionales de la hostelería. Acceso gratuito a 20+ ingredientes.",
    keywords: "ingredientes cocina, hostelería, precios ingredientes, merma, rendimiento, chefs profesionales, directorio culinario",
    ogTitle: "IngredientsIndex.pro - Directorio Profesional de Ingredientes Culinarios",
    ogDescription: "Tu herramienta profesional para encontrar información detallada sobre ingredientes culinarios con precios, mermas y rendimientos actualizados.",
    ogType: "website",
    ogImage: "https://ingredientsindex.pro/og-image.jpg",
    twitterCard: "summary_large_image",
    canonical: "https://ingredientsindex.pro"
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
      <PopularIngredientsHomepageSection />
      <FeaturedIngredientsSection />
      <StatsSection />
      <FAQSection />
      <CTASection />
      <Footer />
      <AIChefBot />
    </div>
  );
};

export default Index;
