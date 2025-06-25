
import { supabase } from "@/integrations/supabase/client";

export const seedIngredients = async () => {
  // Primero obtenemos las categorías para mapear los IDs
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name');

  const { data: countries } = await supabase
    .from('countries')
    .select('id, code');

  if (!categories || !countries) {
    console.error('No se pudieron obtener las categorías o países');
    return;
  }

  const categoryMap = Object.fromEntries(categories.map(cat => [cat.name, cat.id]));
  const countryMap = Object.fromEntries(countries.map(country => [country.code, country.id]));

  const ingredientsData = [
    {
      name: "Tomate Cherry",
      name_en: "Cherry Tomato",
      name_la: "Tomate Cereza",
      description: "Tomate pequeño y dulce, ideal para ensaladas y guarniciones",
      category_id: categoryMap['verduras'],
      popularity: 95,
      image_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop",
      merma: 5.2,
      rendimiento: 94.8,
      temporada: "Todo el año",
      origen: "Mediterráneo",
      slug: "tomate-cherry",
      price_es: 3.50,
      price_us: 4.20
    },
    {
      name: "Salmón Noruego",
      name_en: "Norwegian Salmon",
      name_la: "Salmón Noruego",
      description: "Pescado graso de alta calidad con carne rosada y sabor intenso",
      category_id: categoryMap['pescados'],
      popularity: 88,
      image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop",
      merma: 35.0,
      rendimiento: 65.0,
      temporada: "Todo el año",
      origen: "Noruega",
      slug: "salmon-noruego",
      price_es: 24.00,
      price_us: 28.80
    },
    {
      name: "Trufa Negra",
      name_en: "Black Truffle",
      name_la: "Trufa Negra",
      description: "Hongo aromático de lujo, considerado el diamante negro de la cocina",
      category_id: categoryMap['hongos'],
      popularity: 92,
      image_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=400&fit=crop",
      merma: 15.0,
      rendimiento: 85.0,
      temporada: "Noviembre - Marzo",
      origen: "Francia",
      slug: "trufa-negra",
      price_es: 800.00,
      price_us: 960.00
    },
    {
      name: "Albahaca Fresca",
      name_en: "Fresh Basil",
      name_la: "Albahaca Fresca",
      description: "Hierba aromática esencial en la cocina italiana y mediterránea",
      category_id: categoryMap['hierbas'],
      popularity: 85,
      image_url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
      merma: 8.0,
      rendimiento: 92.0,
      temporada: "Abril - Octubre",
      origen: "Mediterráneo",
      slug: "albahaca-fresca",
      price_es: 12.00,
      price_us: 14.40
    },
    {
      name: "Ternera de Ávila",
      name_en: "Avila Veal",
      name_la: "Ternera de Ávila",
      description: "Carne tierna y sabrosa con denominación de origen protegida",
      category_id: categoryMap['carnes'],
      popularity: 78,
      image_url: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=400&fit=crop",
      merma: 20.0,
      rendimiento: 80.0,
      temporada: "Todo el año",
      origen: "España",
      slug: "ternera-de-avila",
      price_es: 32.00,
      price_us: 38.40
    },
    {
      name: "Aceite de Oliva Virgen Extra",
      name_en: "Extra Virgin Olive Oil",
      name_la: "Aceite de Oliva Extra Virgen",
      description: "Aceite de máxima calidad obtenido por presión en frío",
      category_id: categoryMap['aceites'],
      popularity: 90,
      image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop",
      merma: 0.0,
      rendimiento: 100.0,
      temporada: "Todo el año",
      origen: "España",
      slug: "aceite-de-oliva-virgen-extra",
      price_es: 8.50,
      price_us: 10.20,
      unit: "L"
    },
    {
      name: "Queso Manchego",
      name_en: "Manchego Cheese",
      name_la: "Queso Manchego",
      description: "Queso español de leche de oveja con denominación de origen",
      category_id: categoryMap['lacteos'],
      popularity: 82,
      image_url: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop",
      merma: 2.0,
      rendimiento: 98.0,
      temporada: "Todo el año",
      origen: "España",
      slug: "queso-manchego",
      price_es: 18.00,
      price_us: 21.60
    },
    {
      name: "Azafrán",
      name_en: "Saffron",
      name_la: "Azafrán",
      description: "La especia más cara del mundo, aporta color y sabor únicos",
      category_id: categoryMap['especias'],
      popularity: 75,
      image_url: "https://images.unsplash.com/photo-1599909533047-b2c65c1dd837?w=400&h=400&fit=crop",
      merma: 0.5,
      rendimiento: 99.5,
      temporada: "Octubre - Noviembre",
      origen: "España",
      slug: "azafran",
      price_es: 3500.00,
      price_us: 4200.00
    }
  ];

  for (const ingredientData of ingredientsData) {
    const { price_es, price_us, unit = 'kg', ...ingredientInfo } = ingredientData;
    
    // Insertar ingrediente
    const { data: ingredient, error: ingredientError } = await supabase
      .from('ingredients')
      .insert(ingredientInfo)
      .select()
      .single();

    if (ingredientError) {
      console.error('Error insertando ingrediente:', ingredientError);
      continue;
    }

    // Insertar precios
    const prices = [
      {
        ingredient_id: ingredient.id,
        country_id: countryMap['ES'],
        price: price_es,
        unit: unit
      },
      {
        ingredient_id: ingredient.id,
        country_id: countryMap['US'],
        price: price_us,
        unit: unit
      }
    ];

    const { error: priceError } = await supabase
      .from('ingredient_prices')
      .insert(prices);

    if (priceError) {
      console.error('Error insertando precios:', priceError);
    }

    // Insertar algunos usos y recetas de ejemplo
    if (ingredient.name === "Tomate Cherry") {
      await supabase.from('ingredient_uses').insert([
        { ingredient_id: ingredient.id, use_description: "Ensaladas frescas y coloridas" },
        { ingredient_id: ingredient.id, use_description: "Guarnición para platos principales" },
        { ingredient_id: ingredient.id, use_description: "Brochetas y aperitivos" }
      ]);

      await supabase.from('ingredient_recipes').insert([
        { ingredient_id: ingredient.id, name: "Ensalada Caprese", type: "Ensalada", difficulty: "Fácil", time: "15 min" },
        { ingredient_id: ingredient.id, name: "Brochetas de Cherry", type: "Aperitivo", difficulty: "Fácil", time: "10 min" }
      ]);
    }
  }

  console.log('Datos sembrados exitosamente');
};
