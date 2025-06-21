
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChefHat, ArrowLeft } from "lucide-react";

const AdminHeader = () => {
  return (
    <header className="clean-nav sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-md">
                <ChefHat className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">
                Panel de Administración AI
              </h1>
            </Link>
          </div>
          <Link to="/directorio">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Directorio
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
