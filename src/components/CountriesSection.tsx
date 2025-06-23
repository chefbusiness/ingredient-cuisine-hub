
import { MapPin, Euro, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CountriesSection = () => {
  // Get ingredient counts per country
  const { data: countryCounts = {} } = useQuery({
    queryKey: ['country-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredient_prices')
        .select('countries!inner(name, code, currency_symbol)')
        .order('countries.name');

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

  // Select top 8 countries with most ingredients
  const topCountries = Object.entries(countryCounts)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 8)
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

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-xl font-medium text-foreground mb-2">
            Precios por País
          </h3>
          <p className="text-sm text-muted-foreground">
            Información de precios actualizada en diferentes mercados
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topCountries.map((country) => {
            const CurrencyIcon = getCurrencyIcon(country.symbol);
            
            return (
              <Link 
                key={country.name} 
                to={`/directorio?pais=${encodeURIComponent(country.name)}`}
              >
                <Card className="border border-border bg-background hover:bg-muted/30 transition-colors group h-full">
                  <CardHeader className="text-center pb-3">
                    <div className="text-2xl mb-2">
                      {getCountryFlag(country.code)}
                    </div>
                    <CardTitle className="text-base font-medium text-foreground">
                      {country.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <CurrencyIcon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {country.symbol}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
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
