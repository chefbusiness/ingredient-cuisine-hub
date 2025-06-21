
import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FeaturedIngredientsSection = () => {
  const featuredIngredients = [
    {
      id: 1,
      name: "Tomate Cherry",
      category: "Verduras",
      popularity: 95,
      price: "€3.50/kg",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop",
      trending: true
    },
    {
      id: 2,
      name: "Salmón Noruego",
      category: "Pescados",
      popularity: 88,
      price: "€24.00/kg",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop",
      trending: false
    },
    {
      id: 3,
      name: "Trufa Negra",
      category: "Hongos",
      popularity: 92,
      price: "€800.00/kg",
      image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=400&fit=crop",
      trending: true
    },
    {
      id: 4,
      name: "Albahaca Fresca",
      category: "Hierbas",
      popularity: 85,
      price: "€12.00/kg",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
      trending: false
    }
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-xl font-medium text-foreground mb-2">
            Ingredientes Destacados
          </h3>
          <p className="text-sm text-muted-foreground">
            Los ingredientes más populares en cocina profesional
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredIngredients.map((ingredient) => (
            <Link key={ingredient.id} to={`/ingrediente/${ingredient.id}`}>
              <Card className="border border-border bg-background hover:bg-muted/30 transition-colors group overflow-hidden h-full">
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={ingredient.image}
                    alt={ingredient.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {ingredient.trending && (
                    <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm text-foreground mb-1">
                    {ingredient.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">{ingredient.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary">{ingredient.price}</span>
                    <Badge variant="outline" className="text-xs">
                      {ingredient.popularity}% popular
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedIngredientsSection;
