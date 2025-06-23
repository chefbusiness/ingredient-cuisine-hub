
import { TrendingUp, Globe, Users, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const StatsSection = () => {
  const { data: stats } = useQuery({
    queryKey: ['directory-stats'],
    queryFn: async () => {
      // Obtener estadísticas generales
      const [ingredientsResult, categoriesResult, countriesResult, viewsResult] = await Promise.all([
        supabase.from('ingredients').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('countries').select('id', { count: 'exact', head: true }),
        supabase.from('page_views').select('id', { count: 'exact', head: true })
      ]);

      return {
        ingredients: ingredientsResult.count || 0,
        categories: categoriesResult.count || 0,
        countries: countriesResult.count || 0,
        views: viewsResult.count || 0
      };
    },
  });

  const statsData = [
    {
      icon: TrendingUp,
      value: stats?.ingredients || 0,
      label: "Ingredientes",
      description: "En nuestro directorio"
    },
    {
      icon: Globe,
      value: stats?.countries || 0,
      label: "Países",
      description: "Con precios actualizados"
    },
    {
      icon: Users,
      value: stats?.categories || 0,
      label: "Categorías",
      description: "Organizadas profesionalmente"
    },
    {
      icon: Clock,
      value: "24h",
      label: "Actualización",
      description: "Precios diarios"
    }
  ];

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-xl font-medium text-foreground mb-2">
            Directorio en Números
          </h3>
          <p className="text-sm text-muted-foreground">
            La información más completa para profesionales de la gastronomía
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon;
            
            return (
              <Card key={index} className="border border-border bg-background text-center">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <IconComponent className="h-6 w-6 text-primary" />
                    <div className="text-2xl font-bold text-foreground">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {stat.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.description}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
