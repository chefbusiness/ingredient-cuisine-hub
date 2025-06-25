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
    queryKey: ['country-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredient_prices')
        .select(`
          countries!inner(
            name,
            code,
            currency_symbol
          )
        `)
        .order('countries(name)');

      if (error) {
        console.error('Error fetching country counts:', error);
        return {};
      }

      // Count ingredients per country
      const counts: Record<string, { count: number; symbol: string; code: string }> = {};
      data.forEach(price => {
        const country = price.countries;
        if (country) {
          const key = country.name;
          if (!counts[key]) {
            counts[key] = { count: 0, symbol: country.currency_symbol, code: country.code };
          }
          counts[key].count += 1;
        }
      });

      return counts;
    },
  });

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

  // Responsive grid classes
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
            Precios por País
          </h3>
          <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Información de precios actualizada en diferentes mercados
          </p>
        </div>
        
        <div className={gridClasses}>
          {topCountries.map((country) => {
            const CurrencyIcon = getCurrencyIcon(country.symbol);
            
            return (
              <Link 
                key={country.name} 
                to={`/directorio?pais=${encodeURIComponent(country.name)}`}
              >
                <Card className="border border-border bg-background hover:bg-muted/30 transition-colors group h-full">
                  <CardHeader className={`text-center ${isMobile ? 'pb-2 pt-3 px-3' : 'pb-3'}`}>
                    <div className={`mb-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                      {getCountryFlag(country.code)}
                    </div>
                    <CardTitle className={`font-medium text-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
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
                    <Badge variant="secondary" className={isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'}>
                      {country.count} precios
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
