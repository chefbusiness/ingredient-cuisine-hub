
import { ChefHat } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface UnifiedHeaderProps {
  variant?: 'default' | 'ingredient-detail';
}

const UnifiedHeader = ({ variant = 'default' }: UnifiedHeaderProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const headerClass = variant === 'ingredient-detail' 
    ? "bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-50"
    : "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50";

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary rounded">
              <ChefHat className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-base font-medium text-foreground">
              Directorio de Ingredientes
            </h1>
          </Link>
          
          <nav className="hidden md:flex space-x-4">
            <Link 
              to="/" 
              className={`text-sm transition-colors ${
                isActive('/') && location.pathname === '/' 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Inicio
            </Link>
            <Link 
              to="/directorio" 
              className={`text-sm transition-colors ${
                isActive('/directorio') 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Directorio
            </Link>
            <Link 
              to="/admin" 
              className={`text-sm transition-colors ${
                isActive('/admin') 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default UnifiedHeader;
