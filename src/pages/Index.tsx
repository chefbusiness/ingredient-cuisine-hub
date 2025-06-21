
import { useState } from "react";
import { Search, ChefHat, Utensils, Leaf, Beef, Wheat, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="min-h-screen bg-background">
      {/* Clean Header */}
      <header className="clean-nav sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-md">
                <ChefHat className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">
                Directorio de Ingredientes
              </h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-primary font-medium text-sm">Inicio</Link>
              <Link to="/directorio" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Directorio</Link>
              <Link to="/categorias" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Categorías</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Clean Hero Section */}
      <section className="hero-clean py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-4 heading-clean">
              Directorio profesional de ingredientes culinarios
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Información detallada sobre ingredientes, precios por país, porcentajes de merma 
              y usos profesionales para chefs y hostelería.
            </p>
            
            {/* Clean Search Bar */}
            <div className="max-w-lg mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar ingredientes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Link to={`/directorio${searchQuery ? `?search=${searchQuery}` : ''}`}>
                <Button className="mt-4 btn-clean">
                  Explorar Directorio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-semibold text-foreground mb-3 heading-clean">
              Explora por Categorías
            </h3>
            <p className="text-muted-foreground">
              Descubre ingredientes organizados por categorías profesionales
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Link key={index} to={`/categoria/${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Card className="clean-card group h-full">
                    <CardHeader className="text-center pb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-medium text-foreground">
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
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

      {/* Clean Featured Ingredients */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-semibold text-foreground mb-3 heading-clean">
              Ingredientes Destacados
            </h3>
            <p className="text-muted-foreground">
              Los ingredientes más populares en cocina profesional
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredIngredients.map((ingredient) => (
              <Link key={ingredient.id} to={`/ingrediente/${ingredient.id}`}>
                <Card className="clean-card group overflow-hidden h-full">
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
                  <CardContent className="p-4">
                    <h4 className="font-medium text-base text-foreground mb-1">
                      {ingredient.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">{ingredient.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-primary">{ingredient.price}</span>
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

      {/* Clean CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-2xl font-semibold mb-4">
            ¿Listo para profesionalizar tu cocina?
          </h3>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Accede a información detallada de más de 150 ingredientes con precios actualizados, 
            porcentajes de merma y usos profesionales.
          </p>
          <Link to="/directorio">
            <Button variant="secondary" className="px-6 py-2">
              Ver Todos los Ingredientes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="bg-background border-t border-border">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-1.5 bg-primary rounded-md">
                  <ChefHat className="h-4 w-4 text-primary-foreground" />
                </div>
                <h4 className="text-base font-medium text-foreground">Directorio de Ingredientes</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                La herramienta profesional para chefs y profesionales de la hostelería.
              </p>
            </div>
            <div>
              <h5 className="font-medium mb-4 text-foreground">Enlaces</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/directorio" className="hover:text-foreground transition-colors">Directorio</Link></li>
                <li><Link to="/categorias" className="hover:text-foreground transition-colors">Categorías</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre Nosotros</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-4 text-foreground">Contacto</h5>
              <p className="text-sm text-muted-foreground">
                ¿Tienes sugerencias o necesitas ayuda?<br />
                Estamos aquí para ayudarte.
              </p>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Directorio de Ingredientes. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
