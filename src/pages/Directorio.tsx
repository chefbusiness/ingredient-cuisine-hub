
import { useState, useMemo } from "react";
import { Search, Filter, ChefHat, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Directorio = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [sortBy, setSortBy] = useState("popularidad");

  const ingredientes = [
    {
      id: 1,
      name: "Tomate Cherry",
      nameEN: "Cherry Tomato",
      nameLA: "Tomate Cereza",
      category: "verduras",
      popularity: 95,
      price: "€3.50/kg",
      priceUS: "$4.20/kg",
      description: "Tomate pequeño y dulce, ideal para ensaladas y guarniciones",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop",
      merma: 5.2,
      rendimiento: 94.8,
      temporada: "Todo el año"
    },
    {
      id: 2,
      name: "Salmón Noruego",
      nameEN: "Norwegian Salmon",
      nameLA: "Salmón Noruego",
      category: "pescados",
      popularity: 88,
      price: "€24.00/kg",
      priceUS: "$28.80/kg",
      description: "Pescado graso de alta calidad con carne rosada y sabor intenso",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop",
      merma: 35.0,
      rendimiento: 65.0,
      temporada: "Todo el año"
    },
    {
      id: 3,
      name: "Trufa Negra",
      nameEN: "Black Truffle",
      nameLA: "Trufa Negra",
      category: "hongos",
      popularity: 92,
      price: "€800.00/kg",
      priceUS: "$960.00/kg",
      description: "Hongo aromático de lujo, considerado el diamante negro de la cocina",
      image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=400&fit=crop",
      merma: 15.0,
      rendimiento: 85.0,
      temporada: "Noviembre - Marzo"
    },
    {
      id: 4,
      name: "Albahaca Fresca",
      nameEN: "Fresh Basil",
      nameLA: "Albahaca Fresca",
      category: "hierbas",
      popularity: 85,
      price: "€12.00/kg",
      priceUS: "$14.40/kg",
      description: "Hierba aromática esencial en la cocina italiana y mediterránea",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
      merma: 8.0,
      rendimiento: 92.0,
      temporada: "Abril - Octubre"
    },
    {
      id: 5,
      name: "Ternera de Ávila",
      nameEN: "Avila Veal",
      nameLA: "Ternera de Ávila",
      category: "carnes",
      popularity: 78,
      price: "€32.00/kg",
      priceUS: "$38.40/kg",
      description: "Carne tierna y sabrosa con denominación de origen protegida",
      image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=400&fit=crop",
      merma: 20.0,
      rendimiento: 80.0,
      temporada: "Todo el año"
    },
    {
      id: 6,
      name: "Aceite de Oliva Virgen Extra",
      nameEN: "Extra Virgin Olive Oil",
      nameLA: "Aceite de Oliva Extra Virgen",
      category: "aceites",
      popularity: 90,
      price: "€8.50/L",
      priceUS: "$10.20/L",
      description: "Aceite de máxima calidad obtenido por presión en frío",
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop",
      merma: 0.0,
      rendimiento: 100.0,
      temporada: "Todo el año"
    },
    {
      id: 7,
      name: "Queso Manchego",
      nameEN: "Manchego Cheese",
      nameLA: "Queso Manchego",
      category: "lacteos",
      popularity: 82,
      price: "€18.00/kg",
      priceUS: "$21.60/kg",
      description: "Queso español de leche de oveja con denominación de origen",
      image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop",
      merma: 2.0,
      rendimiento: 98.0,
      temporada: "Todo el año"
    },
    {
      id: 8,
      name: "Azafrán",
      nameEN: "Saffron",
      nameLA: "Azafrán",
      category: "especias",
      popularity: 75,
      price: "€3,500.00/kg",
      priceUS: "$4,200.00/kg",
      description: "La especia más cara del mundo, aporta color y sabor únicos",
      image: "https://images.unsplash.com/photo-1599909533047-b2c65c1dd837?w=400&h=400&fit=crop",
      merma: 0.5,
      rendimiento: 99.5,
      temporada: "Octubre - Noviembre"
    }
  ];

  const categories = [
    { value: "todos", label: "Todas las categorías" },
    { value: "verduras", label: "Verduras" },
    { value: "carnes", label: "Carnes" },
    { value: "pescados", label: "Pescados" },
    { value: "hierbas", label: "Hierbas" },
    { value: "especias", label: "Especias" },
    { value: "lacteos", label: "Lácteos" },
    { value: "aceites", label: "Aceites" },
    { value: "hongos", label: "Hongos" }
  ];

  const filteredIngredientes = useMemo(() => {
    let filtered = ingredientes;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ingredient.nameEN.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ingredient.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "todos") {
      filtered = filtered.filter(ingredient => ingredient.category === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "popularidad") {
        return b.popularity - a.popularity;
      } else if (sortBy === "nombre") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "precio") {
        const priceA = parseFloat(a.price.replace(/[€$,]/g, ''));
        const priceB = parseFloat(b.price.replace(/[€$,]/g, ''));
        return priceA - priceB;
      }
      return 0;
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <ChefHat className="h-8 w-8 text-green-600" />
              <h1 className="text-xl font-bold text-gray-800">
                Directorio de Ingredientes
              </h1>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-600 hover:text-green-600 transition-colors">Inicio</Link>
              <Link to="/directorio" className="text-green-600 font-medium">Directorio</Link>
              <Link to="/categorias" className="text-gray-600 hover:text-green-600 transition-colors">Categorías</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Directorio Completo de Ingredientes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explora nuestra base de datos completa con información detallada sobre precios, 
            mermas, rendimientos y usos profesionales.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 rounded-lg p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar ingredientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularidad">Popularidad</SelectItem>
                <SelectItem value="nombre">Nombre A-Z</SelectItem>
                <SelectItem value="precio">Precio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Mostrando {filteredIngredientes.length} ingredientes
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            <span>Filtros activos</span>
          </div>
        </div>

        {/* Ingredients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredIngredientes.map((ingredient) => (
            <Link key={ingredient.id} to={`/ingrediente/${ingredient.id}`}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-200 bg-white/90 h-full">
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={ingredient.image}
                    alt={ingredient.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800 leading-tight">
                      {ingredient.name}
                    </h3>
                    <div className="flex items-center space-x-1 ml-2">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        {ingredient.popularity}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-2">{ingredient.nameEN}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs capitalize">
                      {ingredient.category}
                    </Badge>
                    <span className="text-sm text-gray-500">{ingredient.temporada}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {ingredient.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Precio España:</span>
                      <span className="font-semibold text-green-600">{ingredient.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rendimiento:</span>
                      <span className="font-semibold">{ingredient.rendimiento}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredIngredientes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No se encontraron ingredientes que coincidan con tu búsqueda.
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("todos");
              }}
              variant="outline"
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Directorio;
