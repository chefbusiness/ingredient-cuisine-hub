
import UnifiedHeader from "@/components/UnifiedHeader";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { seedIngredients } from "@/utils/seedData";

const DirectorioErrorState = () => {
  const handleSeedData = async () => {
    try {
      await seedIngredients();
      window.location.reload();
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Error cargando los datos</p>
          <Button onClick={handleSeedData} className="btn-clean">
            <Database className="mr-2 h-4 w-4" />
            Cargar Datos de Ejemplo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DirectorioErrorState;
