
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader, Search, TrendingUp, Cloud, Globe, BarChart3, Truck, Eye } from "lucide-react";
import { useGenerateContent } from "@/hooks/useContentGeneration";

const AdminResearchPanel = () => {
  const [researchType, setResearchType] = useState<'market_research' | 'weather_impact' | 'cultural_variants' | 'trend_analysis' | 'supply_chain'>('market_research');
  const [ingredient, setIngredient] = useState('');
  const [region, setRegion] = useState('España');
  const [researchResults, setResearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const generateContent = useGenerateContent();

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

  const researchOptions = [
    {
      value: 'market_research',
      label: 'Investigación de Mercado',
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'Precios actuales, tendencias y factores de mercado'
    },
    {
      value: 'weather_impact',
      label: 'Impacto Climático',
      icon: <Cloud className="h-4 w-4" />,
      description: 'Análisis del clima en disponibilidad y precios'
    },
    {
      value: 'cultural_variants',
      label: 'Variantes Culturales',
      icon: <Globe className="h-4 w-4" />,
      description: 'Nombres y usos regionales del ingrediente'
    },
    {
      value: 'trend_analysis',
      label: 'Análisis de Tendencias',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Popularidad y tendencias gastronómicas'
    },
    {
      value: 'supply_chain',
      label: 'Cadena de Suministro',
      icon: <Truck className="h-4 w-4" />,
      description: 'Productores, distribución y logística'
    }
  ];

  const renderResults = () => {
    if (!showResults || researchResults.length === 0) return null;

    return (
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Resultados de la Investigación
          </CardTitle>
          <Badge variant="outline">
            {researchOptions.find(opt => opt.value === researchType)?.label}
          </Badge>
        </CardHeader>
        <CardContent>
          {researchResults.map((result, index) => (
            <div key={index} className="space-y-4">
              {researchType === 'market_research' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{result.ingredient_name}</h3>
                    <Badge className="bg-green-100 text-green-800">
                      €{result.current_price}/kg
                    </Badge>
                    <Badge variant="outline">{result.price_range}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <strong className="text-sm">Tendencia Estacional:</strong>
                      <p className="text-sm mt-1">{result.seasonal_trend}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <strong className="text-sm">Pronóstico:</strong>
                      <p className="text-sm mt-1">{result.forecast}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <strong className="text-sm">Factores de Mercado:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.market_factors?.map((factor: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <strong className="text-sm">Historial de Precios:</strong>
                    <p className="text-sm mt-1">{result.price_history}</p>
                  </div>
                </div>
              )}

              {researchType === 'weather_impact' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">{result.ingredient_name}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <strong className="text-sm">Clima Actual:</strong>
                      <p className="text-sm mt-1">{result.current_weather}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <strong className="text-sm">Pronóstico Estacional:</strong>
                      <p className="text-sm mt-1">{result.seasonal_forecast}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <Badge variant="outline">Impacto en Oferta</Badge>
                      <p className="text-sm mt-1">{result.supply_impact}</p>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline">Impacto en Precios</Badge>
                      <p className="text-sm mt-1">{result.price_impact}</p>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline">Disponibilidad</Badge>
                      <p className="text-sm mt-1">{result.availability_status}</p>
                    </div>
                  </div>

                  <div className="bg-red-50 p-3 rounded-lg">
                    <strong className="text-sm">Eventos Climáticos:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.weather_events?.map((event: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {researchType === 'cultural_variants' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">{result.ingredient_name}</h3>
                  
                  <div className="space-y-3">
                    {result.cultural_variants?.map((variant: any, i: number) => (
                      <div key={i} className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>{variant.country}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <strong>Nombres locales:</strong>
                            <p>{variant.local_names?.join(', ')}</p>
                          </div>
                          <div>
                            <strong>Usos tradicionales:</strong>
                            <p>{variant.traditional_uses?.join(', ')}</p>
                          </div>
                          <div>
                            <strong>Preparaciones típicas:</strong>
                            <p>{variant.typical_preparations?.join(', ')}</p>
                          </div>
                          <div>
                            <strong>Significado cultural:</strong>
                            <p>{variant.cultural_significance}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {researchType === 'trend_analysis' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{result.ingredient_name}</h3>
                    <Badge className={
                      result.trend_status === 'en alza' ? 'bg-green-100 text-green-800' :
                      result.trend_status === 'estable' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {result.trend_status}
                    </Badge>
                    <Badge variant="outline">
                      Popularidad: {result.popularity_score}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <strong className="text-sm">Uso en Restaurantes:</strong>
                      <p className="text-sm mt-1">{result.restaurant_usage}</p>
                    </div>
                    <div className="bg-pink-50 p-3 rounded-lg">
                      <strong className="text-sm">Demanda Retail:</strong>
                      <p className="text-sm mt-1">{result.retail_demand}</p>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-3 rounded-lg">
                    <strong className="text-sm">Usos Innovadores:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.innovation_uses?.map((use: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <strong className="text-sm">Perspectiva Futura:</strong>
                    <p className="text-sm mt-1">{result.future_outlook}</p>
                  </div>
                </div>
              )}

              {researchType === 'supply_chain' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">{result.ingredient_name}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <strong className="text-sm">Principales Productores:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.main_producers?.map((producer: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {producer}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <strong className="text-sm">Canales de Distribución:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.distribution_channels?.map((channel: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <Badge variant="outline">Confiabilidad</Badge>
                      <p className="text-sm mt-1">{result.supply_reliability}</p>
                    </div>
                    <div>
                      <Badge variant="outline">Niveles de Intermediarios</Badge>
                      <p className="text-sm mt-1">{result.intermediary_levels}</p>
                    </div>
                    <div>
                      <Badge variant="outline">Estacionalidad</Badge>
                      <p className="text-sm mt-1">{result.supply_seasonality}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <strong className="text-sm">Desafíos Logísticos:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.logistic_challenges?.map((challenge: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {challenge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Panel de Investigación Profunda con DeepSeek
            <Badge className="bg-blue-100 text-blue-800 ml-2">
              Investigación en Internet
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="researchType">Tipo de Investigación</Label>
              <Select value={researchType} onValueChange={(value: any) => setResearchType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {researchOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ingredient">Ingrediente</Label>
              <Input
                placeholder="Ej: tomate, pimiento, aceite de oliva..."
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="region">Región</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="España">España</SelectItem>
                  <SelectItem value="Francia">Francia</SelectItem>
                  <SelectItem value="Italia">Italia</SelectItem>
                  <SelectItem value="México">México</SelectItem>
                  <SelectItem value="Argentina">Argentina</SelectItem>
                  <SelectItem value="Colombia">Colombia</SelectItem>
                  <SelectItem value="Perú">Perú</SelectItem>
                  <SelectItem value="Chile">Chile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-muted-foreground p-3 bg-blue-50 rounded-lg">
            <strong>Tipo seleccionado:</strong> {researchOptions.find(opt => opt.value === researchType)?.description}
          </div>

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
            Iniciar Investigación con DeepSeek
          </Button>
        </CardContent>
      </Card>

      {renderResults()}
    </div>
  );
};

export default AdminResearchPanel;
