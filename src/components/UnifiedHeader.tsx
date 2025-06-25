
import { useState } from "react";
import { ChefHat, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { UserMenu } from "@/components/auth/UserMenu";
import { AuthModal } from "@/components/auth/AuthModal";
import { SuperAdminBadge } from "@/components/auth/SuperAdminBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { useResponsive } from "@/hooks/useResponsive";
import { Button } from "@/components/ui/button";

interface UnifiedHeaderProps {
  variant?: 'default' | 'ingredient-detail';
}

const UnifiedHeader = ({ variant = 'default' }: UnifiedHeaderProps) => {
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { isSuperAdmin } = useSuperAdmin();
  const { isMobile } = useResponsive();
  
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const headerClass = variant === 'ingredient-detail' 
    ? "bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-50"
    : "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50";

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const NavigationLinks = ({ mobile = false }: { mobile?: boolean }) => {
    const linkClass = mobile 
      ? "block px-4 py-3 text-base font-medium border-b border-gray-100 last:border-b-0"
      : "text-sm transition-colors";

    return (
      <>
        <Link 
          to="/" 
          className={`${linkClass} ${
            isActive('/') && location.pathname === '/' 
              ? 'text-primary font-medium' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={mobile ? closeMobileMenu : undefined}
        >
          Inicio
        </Link>
        <Link 
          to="/directorio" 
          className={`${linkClass} ${
            isActive('/directorio') 
              ? 'text-primary font-medium' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={mobile ? closeMobileMenu : undefined}
        >
          Directorio
        </Link>
        {user && isSuperAdmin && (
          <Link 
            to="/admin" 
            className={`${linkClass} ${
              isActive('/admin') 
                ? 'text-primary font-medium' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={mobile ? closeMobileMenu : undefined}
          >
            Dashboard
          </Link>
        )}
      </>
    );
  };

  return (
    <>
      <header className={headerClass}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-1.5 bg-primary rounded">
                <ChefHat className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className={`font-medium text-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
                {isMobile ? 'Ingredientes' : 'Directorio de Ingredientes'}
              </h1>
            </Link>
            
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              {!isMobile && (
                <nav className="flex space-x-4">
                  <NavigationLinks />
                </nav>
              )}
              
              <SuperAdminBadge />
              <UserMenu onShowAuthModal={() => setShowAuthModal(true)} />
              
              {/* Mobile Menu Button */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobile && mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border-b shadow-lg z-50">
              <nav className="py-2">
                <NavigationLinks mobile />
              </nav>
            </div>
          )}
        </div>
      </header>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default UnifiedHeader;
