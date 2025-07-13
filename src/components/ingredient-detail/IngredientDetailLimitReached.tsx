
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import UnifiedHeader from "@/components/UnifiedHeader";
import Footer from "@/components/Footer";
import { AuthModal } from "@/components/auth/AuthModal";

interface IngredientDetailLimitReachedProps {
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const IngredientDetailLimitReached = ({ 
  showAuthModal, 
  setShowAuthModal 
}: IngredientDetailLimitReachedProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50 flex flex-col">
      <UnifiedHeader variant="ingredient-detail" />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <h2 className="text-2xl font-bold mb-4">¡Has alcanzado el límite gratuito!</h2>
            <p className="text-muted-foreground mb-6">
              Has visto 5 ingredientes. Regístrate gratis para acceso ilimitado a todo el directorio.
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
      </main>
      <Footer />
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default IngredientDetailLimitReached;
