
import { Badge } from "@/components/ui/badge";

interface ResearchResultCardProps {
  result: any;
  researchType: string;
}

const ResearchResultCard = ({ result, researchType }: ResearchResultCardProps) => {
  if (researchType === 'market_research') {
    return (
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
    );
  }

  if (researchType === 'weather_impact') {
    return (
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
    );
  }

  if (researchType === 'cultural_variants') {
    return (
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
    );
  }

  if (researchType === 'trend_analysis') {
    return (
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
    );
  }

  if (researchType === 'supply_chain') {
    return (
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
    );
  }

  return null;
};

export default ResearchResultCard;
