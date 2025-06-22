
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-12 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-xl font-medium mb-3">
          ¿Listo para profesionalizar tu cocina?
        </h3>
        <p className="text-sm mb-6 max-w-lg mx-auto opacity-90">
          Accede a información detallada de más de 4500 ingredientes con precios actualizados, 
          porcentajes de merma y usos profesionales.
        </p>
        <Link to="/directorio">
          <Button variant="secondary" className="px-4 py-2 h-9">
            Ver Todos los Ingredientes
            <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
