
import { Leaf, Beef, Wheat, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/useCategories";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CategoriesSection = () => {
  const { data: categories = [] } = useCategories();

  // Get ingredient counts for each category
  const { data: categoryCounts = {} } = useQuery({
    queryKey: ['category-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('category_id, categories!inner(name)')
        .order('category_id');

      if (error) {
        console.error('Error fetching category counts:', error);
        return {};
      }

      // Count ingredients per category
      const counts: Record<string, number> = {};
      data.forEach(ingredient => {
        const categoryName = ingredient.categories?.name;
        if (categoryName) {
          counts[categoryName] = (counts[categoryName] || 0) + 1;
        }
      });

      return counts;
    },
  });

  // Icon mapping for categories
  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('verdura') || name.includes('vegetal')) return Leaf;
    if (name.includes('carne') || name.includes('meat')) return Beef;
    if (name.includes('hierba') || name.includes('especia') || name.includes('herb')) return Wheat;
    return Utensils; // Default icon
  };

  return (
    <section className="py-12 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-xl font-medium text-foreground mb-2">
            Explora por Categorías
          </h3>
          <p className="text-sm text-muted-foreground">
            Descubre ingredientes organizados por categorías profesionales
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((category) => {
            const IconComponent = getIconForCategory(category.name);
            const count = categoryCounts[category.name] || 0;
            
            return (
              <Link 
                key={category.id} 
                to={`/directorio?categoria=${encodeURIComponent(category.name)}`}
              >
                <Card className="border border-border bg-background hover:bg-muted/30 transition-colors group h-full">
                  <CardHeader className="text-center pb-3">
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center mx-auto mb-3 group-hover:bg-muted/80 transition-colors">
                      <IconComponent className="h-5 w-5 text-foreground" />
                    </div>
                    <CardTitle className="text-base font-medium text-foreground">
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <p className="text-xs text-muted-foreground mb-2">
                      {category.description || `Ingredientes de ${category.name.toLowerCase()}`}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {count} ingredientes
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

export default CategoriesSection;
