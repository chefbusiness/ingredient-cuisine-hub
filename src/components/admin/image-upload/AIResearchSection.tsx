
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Zap } from "lucide-react";
import { useResearchPerplexityImages } from "@/hooks/useResearchPerplexityImages";

interface AIResearchSectionProps {
  ingredientId: string;
  ingredientName: string;
  onImageUploaded: () => void;
}

const AIResearchSection = ({ ingredientId, ingredientName, onImageUploaded }: AIResearchSectionProps) => {
  const perplexityMutation = useResearchPerplexityImages();

  const handlePerplexityResearch = async () => {
    try {
      await perplexityMutation.mutateAsync({
        ingredientIds: ingredientId,
        mode: 'single'
      });
      onImageUploaded();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-purple-600" />
          Investigación AI de Imágenes Reales
          <Badge className="bg-purple-100 text-purple-800 ml-2">
            <Zap className="h-3 w-3 mr-1" />
            Perplexity Sonar
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Busca automáticamente imágenes reales de <strong>{ingredientName}</strong> usando Perplexity Sonar con acceso a internet y filtros culinarios especializados.
          </p>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-800">Motor de Búsqueda Premium</span>
            </div>
            <p className="text-sm text-purple-700 mb-4">
              Perplexity Sonar es un motor de IA avanzado con navegación en internet en tiempo real. 
              Busca imágenes de alta calidad en sitios culinarios confiables como Wikipedia, 
              Unsplash, y bases de datos gastronómicas profesionales.
            </p>
            
            <Button 
              onClick={handlePerplexityResearch}
              disabled={perplexityMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {perplexityMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Investigando imágenes reales...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Buscar Imágenes Reales
                </div>
              )}
            </Button>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 mb-1">
              <strong>💡 Cómo funciona:</strong>
            </p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• Busca en sitios culinarios verificados y bases de datos profesionales</li>
              <li>• Filtra automáticamente por calidad y relevancia gastronómica</li>
              <li>• Valida que las URLs de las imágenes funcionen correctamente</li>
              <li>• Categoriza las imágenes por tipo: crudo, cocido, cortado, entero</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIResearchSection;
