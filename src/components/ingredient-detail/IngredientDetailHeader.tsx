
import { Link } from "react-router-dom";
import { ChefHat } from "lucide-react";

const IngredientDetailHeader = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <ChefHat className="h-8 w-8 text-green-600" />
            <h1 className="text-xl font-bold text-gray-800">
              Directorio de Ingredientes
            </h1>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-600 hover:text-green-600 transition-colors">Inicio</Link>
            <Link to="/directorio" className="text-gray-600 hover:text-green-600 transition-colors">Directorio</Link>
            <Link to="/admin" className="text-gray-600 hover:text-green-600 transition-colors">Admin</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default IngredientDetailHeader;
