
import { useState } from "react";
import { Search, ChefHat, Utensils, Leaf, Beef, Wheat, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
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
      color: "from-emerald-400 to-green-600",
      description: "Vegetales frescos y de temporada"
    },
    { 
      name: "Carnes", 
      icon: Beef, 
      count: 25, 
      color: "from-red-400 to-rose-600",
      description: "Cortes profesionales y especialidades"
    },
    { 
      name: "Hierbas y Especias", 
      icon: Wheat, 
      count: 40, 
      color: "from-amber-400 to-orange-600",
      description: "Aromáticos y condimentos"
    },
    { 
      name: "Lácteos", 
      icon: Utensils, 
      count: 20, 
      color: "from-blue-400 to-indigo-600",
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
      {/* Modern Header */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-xl">
                <ChefHat className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">
                Directorio de Ingredientes
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-primary font-medium">Inicio</Link>
              <Link to="/directorio" className="text-muted-foreground hover:text-primary transition-colors">Directorio</Link>
              <Link to="/categorias" className="text-muted-foreground hover:text-primary transition-colors">Categorías</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Modern Hero Section */}
      <section className="relative py-24 gradient-mesh">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-primary mr-3 animate-pulse" />
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              Directorio Profesional
            </Badge>
          </div>
          
          <h2 className="text-6xl font-bold mb-6 heading-gradient max-w-4xl mx-auto leading-tight">
            Tu directorio profesional de
            <span className="block text-primary">ingredientes culinarios</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Información detallada sobre ingredientes, precios por país, porcentajes de merma, 
            usos profesionales y recetas destacadas para chefs y profesionales de la hostelería.
          </p>
          
          {/* Modern Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-8">
            <div className="relative glass-card rounded-full p-2">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar ingredientes (ej. tomate, salmón, trufa...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-6 py-4 text-lg border-0 bg-transparent focus:ring-0 rounded-full"
              />
            </div>
            <Link to={`/directorio${searchQuery ? `?search=${searchQuery}` : ''}`}>
              <Button className="mt-6 btn-modern text-lg animate-glow">
                Explorar Directorio
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-foreground mb-4">
              Explora por Categorías
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre ingredientes organizados por categorías profesionales
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Link key={index} to={`/categoria/${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Card className="feature-card group h-full">
                    <CardHeader className="text-center pb-4">
                      <div className={`w-20 h-20 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {category.description}
                      </p>
                      <Badge className="bg-primary/10 text-primary border-primary/20">
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

      {/* Modern Featured Ingredients */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-foreground mb-4">
              Ingredientes Destacados
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Los ingredientes más populares en cocina profesional
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredIngredients.map((ingredient) => (
              <Link key={ingredient.id} to={`/ingrediente/${ingredient.id}`}>
                <Card className="modern-card group overflow-hidden h-full">
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={ingredient.image}
                      alt={ingredient.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {ingredient.trending && (
                      <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                        {ingredient.name}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{ingredient.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary text-lg">{ingredient.price}</span>
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

      {/* Modern CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-primary-foreground mb-6">
            ¿Listo para profesionalizar tu cocina?
          </h3>
          <p className="text-xl text-primary-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Accede a información detallada de más de 150 ingredientes con precios actualizados, 
            porcentajes de merma y usos profesionales.
          </p>
          <Link to="/directorio">
            <Button className="bg-white text-primary hover:bg-white/90 px-10 py-4 rounded-full text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              Ver Todos los Ingredientes
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-background border-t border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary rounded-xl">
                  <ChefHat className="h-6 w-6 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-bold text-foreground">Directorio de Ingredientes</h4>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                La herramienta profesional para chefs y profesionales de la hostelería.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-foreground">Enlaces</h5>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link to="/directorio" className="hover:text-primary transition-colors">Directorio</Link></li>
                <li><Link to="/categorias" className="hover:text-primary transition-colors">Categorías</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Sobre Nosotros</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-foreground">Contacto</h5>
              <p className="text-muted-foreground leading-relaxed">
                ¿Tienes sugerencias o necesitas ayuda?<br />
                Estamos aquí para ayudarte.
              </p>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Directorio de Ingredientes. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
