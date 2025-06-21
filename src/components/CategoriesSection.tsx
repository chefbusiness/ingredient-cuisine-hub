
import { Leaf, Beef, Wheat, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CategoriesSection = () => {
  const categories = [
    { 
      name: "Verduras", 
      icon: Leaf, 
      count: 35, 
      description: "Vegetales frescos y de temporada"
    },
    { 
      name: "Carnes", 
      icon: Beef, 
      count: 25, 
      description: "Cortes profesionales y especialidades"
    },
    { 
      name: "Hierbas y Especias", 
      icon: Wheat, 
      count: 40, 
      description: "Aromáticos y condimentos"
    },
    { 
      name: "Lácteos", 
      icon: Utensils, 
      count: 20, 
      description: "Quesos, cremas y productos lácteos"
    }
  ];

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
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Link key={index} to={`/categoria/${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
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
                      {category.description}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {category.count} ingredientes
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
