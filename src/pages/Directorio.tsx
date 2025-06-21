import { useState, useMemo } from "react";
import { Search, Filter, ChefHat, TrendingUp, Grid3X3, List } from "lucide-react";
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

    if (searchQuery) {
      filtered = filtered.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ingredient.nameEN.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ingredient.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "todos") {
      filtered = filtered.filter(ingredient => ingredient.category === selectedCategory);
    }

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
    <div className="min-h-screen bg-background">
      {/* Clean Header */}
      <header className="clean-nav sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-md">
                <ChefHat className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">
                Directorio de Ingredientes
              </h1>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Inicio</Link>
              <Link to="/directorio" className="text-primary font-medium text-sm">Directorio</Link>
              <Link to="/categorias" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Categorías</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Clean Page Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-3 heading-clean">
            Directorio Completo de Ingredientes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explora nuestra base de datos completa con información detallada sobre precios, 
            mermas, rendimientos y usos profesionales.
          </p>
        </div>

        {/* Clean Search and Filters */}
        <Card className="clean-card mb-8 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar ingredientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

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
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">{filteredIngredientes.length}</span> ingredientes encontrados
            </p>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtros activos</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Clean Ingredients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredIngredientes.map((ingredient) => (
            <Link key={ingredient.id} to={`/ingrediente/${ingredient.id}`}>
              <Card className="clean-card group h-full overflow-hidden">
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={ingredient.image}
                    alt={ingredient.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 flex items-center space-x-1 bg-background/90 rounded-md px-2 py-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium text-foreground">
                      {ingredient.popularity}%
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-base text-foreground mb-1">
                    {ingredient.name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-2">{ingredient.nameEN}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {ingredient.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{ingredient.temporada}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {ingredient.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Precio España:</span>
                      <span className="font-medium text-primary">{ingredient.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Rendimiento:</span>
                      <Badge variant="outline" className="text-xs">
                        {ingredient.rendimiento}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredIngredientes.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-6">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">
                No se encontraron ingredientes
              </h3>
              <p className="text-muted-foreground">
                No se encontraron ingredientes que coincidan con tu búsqueda.
              </p>
            </div>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("todos");
              }}
              className="btn-clean"
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
