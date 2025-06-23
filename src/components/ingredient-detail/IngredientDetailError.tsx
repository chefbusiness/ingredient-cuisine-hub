
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import UnifiedHeader from "@/components/UnifiedHeader";
import Footer from "@/components/Footer";

interface IngredientDetailErrorProps {
  error?: any;
}

const IngredientDetailError = ({ error }: IngredientDetailErrorProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50 flex flex-col">
      <UnifiedHeader variant="ingredient-detail" />
      <main className="flex-1">
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
      </main>
      <Footer />
    </div>
  );
};

export default IngredientDetailError;
