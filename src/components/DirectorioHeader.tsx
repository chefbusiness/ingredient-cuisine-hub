
import { ChefHat } from "lucide-react";
import { Link } from "react-router-dom";

const DirectorioHeader = () => {
  return (
    <header className="clean-nav sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 bg-primary rounded-md">
              <ChefHat className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">
              Directorio de Ingredientes
            </h1>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Inicio</Link>
            <Link to="/directorio" className="text-primary font-medium text-sm">Directorio</Link>
            <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Admin</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default DirectorioHeader;
