
import UnifiedHeader from "@/components/UnifiedHeader";
import { Loader } from "lucide-react";

const DirectorioLoadingState = () => {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-16">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Cargando directorio...</span>
        </div>
      </div>
    </div>
  );
};

export default DirectorioLoadingState;
