
import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader, Search } from "lucide-react";
import { useGenerateContent } from "@/hooks/useGenerateContent";
import ResearchPanelHeader from "./admin/research/ResearchPanelHeader";
import ResearchTypeSelector from "./admin/research/ResearchTypeSelector";
import ResearchResults from "./admin/research/ResearchResults";

const AdminResearchPanel = () => {
  const [researchType, setResearchType] = useState<'market_research' | 'weather_impact' | 'cultural_variants' | 'trend_analysis' | 'supply_chain'>('market_research');
  const [ingredient, setIngredient] = useState('');
  const [region, setRegion] = useState('España');
  const [researchResults, setResearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const generateContent = useGenerateContent();

  const researchOptions = [
    {
      value: 'market_research',
      label: 'Investigación de Mercado'
    },
    {
      value: 'weather_impact',
      label: 'Impacto Climático'
    },
    {
      value: 'cultural_variants',
      label: 'Variantes Culturales'
    },
    {
      value: 'trend_analysis',
      label: 'Análisis de Tendencias'
    },
    {
      value: 'supply_chain',
      label: 'Cadena de Suministro'
    }
  ];

  const handleResearch = async () => {
    if (!ingredient.trim()) {
      return;
    }

    try {
      const result = await generateContent.mutateAsync({
        type: researchType,
        ingredient: ingredient,
        region: region,
        count: 1
      });

      if (result.success) {
        setResearchResults(result.data);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error en investigación:', error);
    }
  };

  return (
    <div className="space-y-6">
      <ResearchPanelHeader />
      
      <CardContent className="space-y-4">
        <ResearchTypeSelector
          researchType={researchType}
          ingredient={ingredient}
          region={region}
          onResearchTypeChange={(value: any) => setResearchType(value)}
          onIngredientChange={setIngredient}
          onRegionChange={setRegion}
        />

        <Button 
          onClick={handleResearch}
          disabled={generateContent.isPending || !ingredient.trim()}
          className="w-full"
        >
          {generateContent.isPending ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Iniciar Investigación con Perplexity
        </Button>
      </CardContent>

      <ResearchResults
        showResults={showResults}
        researchResults={researchResults}
        researchType={researchType}
        researchOptions={researchOptions}
      />
    </div>
  );
};

export default AdminResearchPanel;
