
import { useMemo } from "react";
import { useAdvancedIngredients } from "@/hooks/useAdvancedIngredients";
import { useIngredientAnalytics } from "@/hooks/useIngredientAnalytics";
import { useCategories } from "@/hooks/useCategories";

interface SearchFilters {
  searchQuery: string;
  category: string;
  sortBy: string;
  priceRange: [number, number];
  popularityRange: [number, number];
  season?: string;
  origin?: string;
  country?: string;
}

export const useDirectorioData = (filters: SearchFilters) => {
  // Usar hooks para obtener datos
  const { data: ingredients = [], isLoading: isLoadingIngredients, error: ingredientsError } = useAdvancedIngredients(filters);
  const { data: categoriesData = [], isLoading: isLoadingCategories } = useCategories();
  const { data: analytics, isLoading: isLoadingAnalytics } = useIngredientAnalytics();

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
    const selectedCountry = filters.country || 'España';
    
    return ingredients.map(ingredient => ({
      id: ingredient.id,
      name: ingredient.name,
      nameEN: ingredient.name_en,
      nameLA: ingredient.name_la || "",
      category: ingredient.categories?.name || "",
      popularity: ingredient.popularity,
      price: ingredient.ingredient_prices?.[0] 
        ? `${ingredient.ingredient_prices[0].countries?.currency_symbol || "€"}${ingredient.ingredient_prices[0].price}/${ingredient.ingredient_prices[0].unit}`
        : "Precio no disponible",
      priceUS: "$0.00/kg",
      description: ingredient.description,
      image: ingredient.real_image_url || ingredient.image_url || "",
      merma: Number(ingredient.merma),
      rendimiento: Number(ingredient.rendimiento),
      temporada: ingredient.temporada || "Todo el año",
      hasAIImage: !!ingredient.image_url,
      hasRealImage: !!ingredient.real_image_url,
      // Agregar información del país seleccionado
      selectedCountry: selectedCountry
    }));
  }, [ingredients, filters.country]);

  return {
    formattedIngredients,
    categories,
    analytics,
    isLoading: isLoadingIngredients || isLoadingCategories || isLoadingAnalytics,
    error: ingredientsError
  };
};
