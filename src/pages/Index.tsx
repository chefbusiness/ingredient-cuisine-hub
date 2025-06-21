
import { useState } from "react";
import { Search, ChefHat, Utensils, Leaf, Beef, Wheat } from "lucide-react";
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
      color: "bg-green-500",
      description: "Vegetales frescos y de temporada"
    },
    { 
      name: "Carnes", 
      icon: Beef, 
      count: 25, 
      color: "bg-red-500",
      description: "Cortes profesionales y especialidades"
    },
    { 
      name: "Hierbas y Especias", 
      icon: Wheat, 
      count: 40, 
      color: "bg-orange-500",
      description: "Aromáticos y condimentos"
    },
    { 
      name: "Lácteos", 
      icon: Utensils, 
      count: 20, 
      color: "bg-blue-500",
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
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop"
    },
    {
      id: 2,
      name: "Salmón Noruego",
      category: "Pescados",
      popularity: 88,
      price: "€24.00/kg",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop"
    },
    {
      id: 3,
      name: "Trufa Negra",
      category: "Hongos",
      popularity: 92,
      price: "€800.00/kg",
      image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=400&fit=crop"
    },
    {
      id: 4,
      name: "Albahaca Fresca",
      category: "Hierbas",
      popularity: 85,
      price: "€12.00/kg",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChefHat className="h-8 w-8 text-green-600" />
              <h1 className="text-xl font-bold text-gray-800">
                Directorio de Ingredientes
              </h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-green-600 font-medium">Inicio</Link>
              <Link to="/directorio" className="text-gray-600 hover:text-green-600 transition-colors">Directorio</Link>
              <Link to="/categorias" className="text-gray-600 hover:text-green-600 transition-colors">Categorías</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            Tu directorio profesional de
            <span className="text-green-600 block">ingredientes culinarios</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Información detallada sobre ingredientes, precios por país, porcentajes de merma, 
            usos profesionales y recetas destacadas para chefs y profesionales de la hostelería.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar ingredientes (ej. tomate, salmón, trufa...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg rounded-full border-2 border-green-200 focus:border-green-400 bg-white/90"
              />
            </div>
            <Link to={`/directorio${searchQuery ? `?search=${searchQuery}` : ''}`}>
              <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg font-medium">
                Explorar Directorio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Explora por Categorías
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Link key={index} to={`/categoria/${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-200 bg-white/80">
                    <CardHeader className="text-center pb-2">
                      <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-800">
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600 mb-3">{category.description}</p>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
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

      {/* Featured Ingredients */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Ingredientes Destacados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredIngredients.map((ingredient) => (
              <Link key={ingredient.id} to={`/ingrediente/${ingredient.id}`}>
                <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-200 bg-white/90">
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img
                      src={ingredient.image}
                      alt={ingredient.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-gray-800">{ingredient.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {ingredient.popularity}% popular
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{ingredient.category}</p>
                    <p className="font-semibold text-green-600">{ingredient.price}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            ¿Listo para profesionalizar tu cocina?
          </h3>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Accede a información detallada de más de 150 ingredientes con precios actualizados, 
            porcentajes de merma y usos profesionales.
          </p>
          <Link to="/directorio">
            <Button className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-full text-lg font-medium">
              Ver Todos los Ingredientes
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <ChefHat className="h-6 w-6 text-green-400" />
                <h4 className="text-lg font-bold">Directorio de Ingredientes</h4>
              </div>
              <p className="text-gray-300">
                La herramienta profesional para chefs y profesionales de la hostelería.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Enlaces</h5>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/directorio" className="hover:text-green-400 transition-colors">Directorio</Link></li>
                <li><Link to="/categorias" className="hover:text-green-400 transition-colors">Categorías</Link></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Sobre Nosotros</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Contacto</h5>
              <p className="text-gray-300">
                ¿Tienes sugerencias o necesitas ayuda?<br />
                Estamos aquí para ayudarte.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Directorio de Ingredientes. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
