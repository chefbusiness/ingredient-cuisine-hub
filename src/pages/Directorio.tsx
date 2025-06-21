
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DirectorioHeader from "@/components/DirectorioHeader";
import DirectorioFilters from "@/components/DirectorioFilters";
import DirectorioResults from "@/components/DirectorioResults";
import DirectorioGrid from "@/components/DirectorioGrid";
import DirectorioEmpty from "@/components/DirectorioEmpty";
import { useIngredients } from "@/hooks/useIngredients";
import { useCategories } from "@/hooks/useCategories";
import { seedIngredients } from "@/utils/seedData";
import { Button } from "@/components/ui/button";
import { Database, Loader } from "lucide-react";

const Directorio = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [sortBy, setSortBy] = useState("popularidad");

  // Inicializar búsqueda desde URL
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, [searchParams]);

  // Usar hooks para obtener datos de Supabase
  const { data: ingredients = [], isLoading: isLoadingIngredients, error: ingredientsError } = useIngredients(
    searchQuery, 
    selectedCategory === "todos" ? undefined : selectedCategory, 
    sortBy
  );
  
  const { data: categoriesData = [], isLoading: isLoadingCategories } = useCategories();

  // Convertir categorías para el componente de filtros
  const categories = useMemo(() => {
    const baseCategories = [{ value: "todos", label: "Todas las categorías" }];
    const dynamicCategories = categoriesData.map(cat => ({
      value: cat.name,
      label: cat.name.charAt(0).toUpperCase() + cat.name.slice(1)
    }));
    return [...baseCategories, ...dynamicCategories];
  }, [categoriesData]);

  // Convertir ingredientes al formato esperado por DirectorioGrid
  const formattedIngredients = useMemo(() => {
    return ingredients.map(ingredient => ({
      id: ingredient.id, // Mantener el UUID como string
      name: ingredient.name,
      nameEN: ingredient.name_en,
      nameLA: ingredient.name_la || "",
      category: ingredient.categories?.name || "",
      popularity: ingredient.popularity,
      price: ingredient.ingredient_prices?.[0] 
        ? `${ingredient.ingredient_prices[0].countries?.currency_symbol || "€"}${ingredient.ingredient_prices[0].price}/${ingredient.ingredient_prices[0].unit}`
        : "Precio no disponible",
      priceUS: "$0.00/kg", // Placeholder por ahora
      description: ingredient.description,
      image: ingredient.image_url || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop",
      merma: Number(ingredient.merma),
      rendimiento: Number(ingredient.rendimiento),
      temporada: ingredient.temporada || "Todo el año"
    }));
  }, [ingredients]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("todos");
  };

  const handleSeedData = async () => {
    try {
      await seedIngredients();
      window.location.reload(); // Recargar para ver los nuevos datos
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  if (isLoadingIngredients || isLoadingCategories) {
    return (
      <div className="min-h-screen bg-background">
        <DirectorioHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando ingredientes...</span>
          </div>
        </div>
      </div>
    );
  }

  if (ingredientsError) {
    return (
      <div className="min-h-screen bg-background">
        <DirectorioHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">Error cargando los datos</p>
            <Button onClick={handleSeedData} className="btn-clean">
              <Database className="mr-2 h-4 w-4" />
              Cargar Datos de Ejemplo
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          
          {formattedIngredients.length === 0 && (
            <div className="mt-6">
              <Button onClick={handleSeedData} className="btn-clean">
                <Database className="mr-2 h-4 w-4" />
                Cargar Datos de Ejemplo
              </Button>
            </div>
          )}
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

        <DirectorioResults resultsCount={formattedIngredients.length} />

        {formattedIngredients.length === 0 ? (
          <DirectorioEmpty onClearFilters={handleClearFilters} />
        ) : (
          <DirectorioGrid ingredients={formattedIngredients} />
        )}
      </div>
    </div>
  );
};

export default Directorio;
