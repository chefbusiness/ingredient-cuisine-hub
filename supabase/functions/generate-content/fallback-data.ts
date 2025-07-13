
export function createFallbackIngredient(requestBody: any, ingredientName?: string) {
  const mockIngredient = {
    name: ingredientName ? `${ingredientName} (Fallback)` : "Ingrediente Fallback",
    name_en: ingredientName ? `${ingredientName} (Fallback)` : "Fallback Ingredient",
    name_la: ingredientName ? `${ingredientName} (Fallback)` : "Ingrediente Fallback",
    name_fr: "Ingrédient de Secours",
    name_it: "Ingrediente di Riserva",
    name_pt: "Ingrediente de Reserva",
    name_zh: "备用配料",
    description: "Este ingrediente fue generado como respaldo debido a un error temporal con la API de investigación. Los datos son de prueba.",
    category: requestBody.category || "verduras",
    temporada: "Todo el año",
    origen: "Datos de prueba",
    merma: 15.0,
    rendimiento: 85.0,
    popularity: 40,
    prices_by_country: [
      {
        country: "España",
        price: 8.50,
        unit: "kg",
        source: "Fallback - Datos de prueba",
        date: new Date().toISOString().split('T')[0]
      }
    ],
    recipes: [
      "Receta de prueba 1",
      "Receta de prueba 2"
    ],
    professional_uses: [
      "Uso profesional de prueba",
      "Aplicación gastronómica de prueba"
    ]
  };

  if (ingredientName) {
    mockIngredient.requested_ingredient = ingredientName;
  }

  return mockIngredient;
}

export function createFallbackCategory(categoryName?: string) {
  return {
    name: categoryName ? `${categoryName}` : "Categoría Fallback",
    name_en: categoryName ? `${categoryName}` : "Fallback Category", 
    description: "Esta categoría fue generada como respaldo debido a un error temporal con la API de investigación. Los datos son de prueba.",
    requested_category: categoryName
  };
}

export function createFallbackData(requestBody: any): any[] {
  // Handle categories
  if (requestBody.type === 'category' && requestBody.categoriesList && requestBody.categoriesList.length > 0) {
    return requestBody.categoriesList.map((categoryName: string) => 
      createFallbackCategory(categoryName)
    );
  }
  
  // Handle ingredients (existing logic)
  return requestBody.ingredientsList && requestBody.ingredientsList.length > 0
    ? requestBody.ingredientsList.map((ingredientName: string) => 
        createFallbackIngredient(requestBody, ingredientName)
      )
    : [createFallbackIngredient(requestBody)];
}
