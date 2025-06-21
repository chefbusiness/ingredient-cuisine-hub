import { useState, useMemo } from "react";
import DirectorioHeader from "@/components/DirectorioHeader";
import DirectorioFilters from "@/components/DirectorioFilters";
import DirectorioResults from "@/components/DirectorioResults";
import DirectorioGrid from "@/components/DirectorioGrid";
import DirectorioEmpty from "@/components/DirectorioEmpty";

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

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("todos");
  };

  return (
    <div className="min-h-screen bg-background">
      <DirectorioHeader />

      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-3 heading-clean">
            Directorio Completo de Ingredientes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explora nuestra base de datos completa con información detallada sobre precios, 
            mermas, rendimientos y usos profesionales.
          </p>
        </div>

        <DirectorioFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
        />

        <DirectorioResults resultsCount={filteredIngredientes.length} />

        {filteredIngredientes.length === 0 ? (
          <DirectorioEmpty onClearFilters={handleClearFilters} />
        ) : (
          <DirectorioGrid ingredients={filteredIngredientes} />
        )}
      </div>
    </div>
  );
};

export default Directorio;
