
import { MapPin, Euro, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useResponsive } from "@/hooks/useResponsive";

const CountriesSection = () => {
  const { isMobile, isTablet } = useResponsive();

  const { data: countryCounts = {} } = useQuery({
    queryKey: ['country-ingredient-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredient_prices')
        .select(`
          ingredient_id,
          countries!inner(
            name,
            code,
            currency_symbol
          )
        `)
        .order('countries(name)');

      if (error) {
        console.error('Error fetching country ingredient counts:', error);
        return {};
      }

      // Count unique ingredients per country
      const counts: Record<string, { count: number; symbol: string; code: string }> = {};
      const countryIngredients: Record<string, Set<string>> = {};
      
      data.forEach(price => {
        const country = price.countries;
        if (country) {
          const key = country.name;
          if (!countryIngredients[key]) {
            countryIngredients[key] = new Set();
            counts[key] = { count: 0, symbol: country.currency_symbol, code: country.code };
          }
          countryIngredients[key].add(price.ingredient_id);
        }
      });

      // Convert Set sizes to counts
      Object.keys(countryIngredients).forEach(country => {
        counts[country].count = countryIngredients[country].size;
      });

      return counts;
    },
  });

  // Siempre mostrar 8 países en desktop, 6 en tablet, 4 en móvil
  const maxCountries = isMobile ? 4 : isTablet ? 6 : 8;
  const topCountries = Object.entries(countryCounts)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, maxCountries)
    .map(([name, data]) => ({ name, ...data }));

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'ES': '🇪🇸',
      'FR': '🇫🇷',
      'IT': '🇮🇹',
      'PT': '🇵🇹',
      'DE': '🇩🇪',
      'UK': '🇬🇧',
      'US': '🇺🇸',
      'MX': '🇲🇽'
    };
    return flags[countryCode] || '🌍';
  };

  const getCurrencyIcon = (symbol: string) => {
    if (symbol === '€') return Euro;
    if (symbol === '$') return DollarSign;
    return Euro; // Default
  };

  if (!topCountries.length) {
    return null;
  }

  // Grid responsive mejorado - siempre 8 en desktop
  const gridClasses = isMobile 
    ? "grid grid-cols-2 gap-3" 
    : isTablet 
    ? "grid grid-cols-3 gap-4" 
    : "grid grid-cols-4 gap-4";

  return (
    <section className={`${isMobile ? 'py-8' : 'py-12'} bg-background`}>
      <div className={`container mx-auto ${isMobile ? 'px-3' : 'px-4'}`}>
        <div className={`text-center ${isMobile ? 'mb-6' : 'mb-8'}`}>
          <h3 className={`font-medium text-foreground mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            Ingredientes por País
          </h3>
          <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Explora ingredientes disponibles en diferentes países
          </p>
        </div>
        
        <div className={gridClasses}>
          {topCountries.map((country) => {
            const CurrencyIcon = getCurrencyIcon(country.symbol);
            
            return (
              <Link 
                key={country.name} 
                to={`/directorio?pais=${encodeURIComponent(country.name)}`}
                className="block transition-transform hover:scale-105"
              >
                <Card className="border border-border bg-background hover:bg-muted/50 hover:shadow-md transition-all group h-full cursor-pointer">
                  <CardHeader className={`text-center ${isMobile ? 'pb-2 pt-3 px-3' : 'pb-3'}`}>
                    <div className={`mb-2 ${isMobile ? 'text-xl' : 'text-2xl'} transition-transform group-hover:scale-110`}>
                      {getCountryFlag(country.code)}
                    </div>
                    <CardTitle className={`font-medium text-foreground group-hover:text-green-600 transition-colors ${isMobile ? 'text-sm' : 'text-base'}`}>
                      {country.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={`text-center ${isMobile ? 'pt-0 pb-3 px-3' : 'pt-0'}`}>
                    <div className={`flex items-center justify-center gap-1 mb-2 ${isMobile ? 'mb-1' : 'mb-2'}`}>
                      <CurrencyIcon className={`text-muted-foreground ${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
                      <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
                        {country.symbol}
                      </span>
                    </div>
                    <Badge variant="secondary" className={`group-hover:bg-green-100 group-hover:text-green-700 transition-colors ${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'}`}>
                      {country.count} ingrediente{country.count !== 1 ? 's' : ''}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CountriesSection;
