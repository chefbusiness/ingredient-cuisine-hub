
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Search, Zap } from "lucide-react";
import { useResearchRealImages } from "@/hooks/useResearchRealImages";
import { useResearchPerplexityImages } from "@/hooks/useResearchPerplexityImages";

interface AIResearchSectionProps {
  ingredientId: string;
  ingredientName: string;
  onImageUploaded: () => void;
}

const AIResearchSection = ({ ingredientId, ingredientName, onImageUploaded }: AIResearchSectionProps) => {
  const researchMutation = useResearchRealImages();
  const perplexityMutation = useResearchPerplexityImages();

  const handleDeepSeekResearch = async () => {
    try {
      await researchMutation.mutateAsync({
        ingredientIds: ingredientId,
        mode: 'single'
      });
      onImageUploaded();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

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
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          Investigación AI de Imágenes Reales
          <Badge className="bg-purple-100 text-purple-800 ml-2">
            <Zap className="h-3 w-3 mr-1" />
            Múltiples Motores
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Busca automáticamente imágenes reales de <strong>{ingredientName}</strong> usando diferentes motores de IA con acceso a internet.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Perplexity Sonar - Premium Option */}
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Perplexity Sonar</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    Recomendado
                  </Badge>
                </div>
                <p className="text-xs text-purple-600 mb-3">
                  Motor premium con navegación en internet y filtros culinarios especializados. Mayor tasa de éxito.
                </p>
                <Button 
                  onClick={handlePerplexityResearch}
                  disabled={perplexityMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  {perplexityMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Investigando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Buscar con Perplexity
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* DeepSeek - Fallback Option */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">DeepSeek AI</span>
                  <Badge variant="outline" className="text-xs">
                    Alternativo
                  </Badge>
                </div>
                <p className="text-xs text-blue-600 mb-3">
                  Motor alternativo con prompts especializados. Puede tener menor tasa de éxito.
                </p>
                <Button 
                  onClick={handleDeepSeekResearch}
                  disabled={researchMutation.isPending}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                  size="sm"
                >
                  {researchMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      Investigando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Buscar con DeepSeek
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              💡 <strong>Recomendación:</strong> Usa Perplexity Sonar para mejores resultados. 
              DeepSeek está disponible como alternativa si Perplexity no encuentra imágenes adecuadas.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIResearchSection;
