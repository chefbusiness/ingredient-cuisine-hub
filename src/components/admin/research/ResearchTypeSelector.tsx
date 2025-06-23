
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Cloud, Globe, TrendingUp, Truck } from "lucide-react";

interface ResearchTypeSelectorProps {
  researchType: string;
  ingredient: string;
  region: string;
  onResearchTypeChange: (value: string) => void;
  onIngredientChange: (value: string) => void;
  onRegionChange: (value: string) => void;
}

const ResearchTypeSelector = ({
  researchType,
  ingredient,
  region,
  onResearchTypeChange,
  onIngredientChange,
  onRegionChange
}: ResearchTypeSelectorProps) => {
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

  const selectedOption = researchOptions.find(opt => opt.value === researchType);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="researchType">Tipo de Investigación</Label>
          <Select value={researchType} onValueChange={onResearchTypeChange}>
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
            onChange={(e) => onIngredientChange(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="region">Región</Label>
          <Select value={region} onValueChange={onRegionChange}>
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

      {selectedOption && (
        <div className="text-sm text-muted-foreground p-3 bg-blue-50 rounded-lg">
          <strong>Tipo seleccionado:</strong> {selectedOption.description}
        </div>
      )}
    </div>
  );
};

export default ResearchTypeSelector;
