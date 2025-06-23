
import { Badge } from "@/components/ui/badge";
import { Wand2, Zap } from "lucide-react";

const AdminContentHeader = () => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-2xl font-bold">Gestión de Contenido</h2>
        <Badge className="bg-green-100 text-green-800">
          <Zap className="h-3 w-3 mr-1" />
          Perplexity + Flux
        </Badge>
      </div>
      <p className="text-muted-foreground">
        Administra ingredientes, categorías, precios e imágenes del directorio.
      </p>
    </div>
  );
};

export default AdminContentHeader;
