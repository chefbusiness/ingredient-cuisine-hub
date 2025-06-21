
import { ChefHat } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1 bg-primary rounded">
                <ChefHat className="h-3 w-3 text-primary-foreground" />
              </div>
              <h4 className="text-sm font-medium text-foreground">Directorio de Ingredientes</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              La herramienta profesional para chefs y profesionales de la hostelería.
            </p>
          </div>
          <div>
            <h5 className="text-sm font-medium mb-3 text-foreground">Enlaces</h5>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><Link to="/directorio" className="hover:text-foreground transition-colors">Directorio</Link></li>
              <li><Link to="/categorias" className="hover:text-foreground transition-colors">Categorías</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Sobre Nosotros</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-medium mb-3 text-foreground">Contacto</h5>
            <p className="text-xs text-muted-foreground">
              ¿Tienes sugerencias o necesitas ayuda?<br />
              Estamos aquí para ayudarte.
            </p>
          </div>
        </div>
        <div className="border-t border-border mt-6 pt-4 text-center text-xs text-muted-foreground">
          <p>&copy; 2024 Directorio de Ingredientes. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
