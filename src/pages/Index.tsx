
import UnifiedHeader from "@/components/UnifiedHeader";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedIngredientsSection from "@/components/FeaturedIngredientsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
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
