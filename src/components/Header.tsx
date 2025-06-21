
import { ChefHat } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary rounded">
              <ChefHat className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-base font-medium text-foreground">
              Directorio de Ingredientes
            </h1>
          </div>
          <nav className="hidden md:flex space-x-4">
            <Link to="/" className="text-primary font-medium text-sm">Inicio</Link>
            <Link to="/directorio" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Directorio</Link>
            <Link to="/categorias" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Categorías</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
