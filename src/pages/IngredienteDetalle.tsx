
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChefHat, TrendingUp, Calculator, Globe, Clock, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const IngredienteDetalle = () => {
  const { id } = useParams();

  // Simulamos datos del ingrediente basado en el ID
  const ingredient = {
    id: parseInt(id || "1"),
    name: "Tomate Cherry",
    nameEN: "Cherry Tomato",
    nameLA: "Tomate Cereza",
    nameFR: "Tomate Cerise",
    nameIT: "Pomodorino",
    namePT: "Tomate Cereja",
    nameZH: "樱桃番茄",
    category: "Verduras",
    popularity: 95,
    description: "El tomate cherry es una variedad de tomate pequeño y dulce, muy apreciado en la cocina profesional por su versatilidad y presentación. Su sabor intenso y su forma compacta lo convierten en un ingrediente ideal para guarniciones, ensaladas gourmet y platos de alta cocina.",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&h=800&fit=crop",
    temporada: "Todo el año (mejor de mayo a octubre)",
    origen: "Región mediterránea",
    variedades: ["Cherry rojo", "Cherry amarillo", "Cherry pera", "Cherry negro"],
    
    // Información nutricional
    nutrition: {
      calories: 18,
      protein: 0.9,
      carbs: 3.9,
      fat: 0.2,
      fiber: 1.2,
      vitamin_c: 14
    },

    // Merma y rendimiento
    merma: 5.2,
    rendimiento: 94.8,
    
    // Usos profesionales
    uses: [
      "Ensaladas gourmet y mixtas",
      "Guarnición para carnes y pescados",
      "Aperitivos y canapés",
      "Salsas frescas y coulis",
      "Confitado y deshidratado",
      "Decoración de platos"
    ],

    // Recetas importantes
    recipes: [
      {
        name: "Ensalada Caprese moderna",
        type: "Entrante",
        difficulty: "Fácil",
        time: "15 min"
      },
      {
        name: "Tomates cherry confitados",
        type: "Guarnición",
        difficulty: "Medio",
        time: "45 min"
      },
      {
        name: "Carpaccio de ternera con cherry",
        type: "Principal",
        difficulty: "Medio",
        time: "20 min"
      }
    ],

    // Precios por país
    prices: {
      "España": {
        price: 3.50,
        currency: "€",
        unit: "kg",
        season_variation: "+15% invierno"
      },
      "Francia": {
        price: 4.20,
        currency: "€",
        unit: "kg",
        season_variation: "+20% invierno"
      },
      "Estados Unidos": {
        price: 4.80,
        currency: "$",
        unit: "kg",
        season_variation: "+25% invierno"
      },
      "Italia": {
        price: 3.80,
        currency: "€",
        unit: "kg",
        season_variation: "+10% invierno"
      }
    },

    // Conservación y almacenamiento
    storage: {
      temperature: "12-15°C",
      humidity: "85-90%",
      duration: "7-10 días",
      tips: "Conservar en lugar fresco y seco, evitar refrigeración directa para mantener sabor"
    },

    // Preparación
    preparation: {
      washing: "Lavar con agua fría antes del uso",
      cutting: "Cortar justo antes de servir para evitar pérdida de jugos",
      cooking: "Cocción rápida para mantener forma y textura"
    }
  };

  const monthlyPrices = [
    { month: "Enero", spain: 4.20, france: 5.10, usa: 5.80 },
    { month: "Febrero", spain: 4.00, france: 4.90, usa: 5.60 },
    { month: "Marzo", spain: 3.80, france: 4.50, usa: 5.20 },
    { month: "Abril", spain: 3.20, france: 3.80, usa: 4.40 },
    { month: "Mayo", spain: 2.80, france: 3.40, usa: 3.90 },
    { month: "Junio", spain: 2.60, france: 3.20, usa: 3.70 },
    { month: "Julio", spain: 2.40, france: 2.90, usa: 3.40 },
    { month: "Agosto", spain: 2.50, france: 3.00, usa: 3.50 },
    { month: "Septiembre", spain: 2.80, france: 3.30, usa: 3.80 },
    { month: "Octubre", spain: 3.20, france: 3.80, usa: 4.30 },
    { month: "Noviembre", spain: 3.80, france: 4.40, usa: 5.00 },
    { month: "Diciembre", spain: 4.10, france: 4.80, usa: 5.50 }
  ];

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
              <Link to="/directorio" className="text-gray-600 hover:text-green-600 transition-colors">Directorio</Link>
              <Link to="/categorias" className="text-gray-600 hover:text-green-600 transition-colors">Categorías</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6">
          <Link 
            to="/directorio" 
            className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al directorio</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="bg-white/90">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-64 h-64 flex-shrink-0">
                    <img
                      src={ingredient.image}
                      alt={ingredient.name}
                      className="w-full h-full object-cover rounded-lg shadow-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                          {ingredient.name}
                        </h1>
                        <p className="text-lg text-gray-600 mb-3">{ingredient.nameEN}</p>
                        <Badge variant="outline" className="mb-4">
                          {ingredient.category}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-full">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="font-bold text-green-600">{ingredient.popularity}%</span>
                        <span className="text-sm text-green-600">popular</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {ingredient.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Temporada:</span>
                        <p className="font-medium">{ingredient.temporada}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Origen:</span>
                        <p className="font-medium">{ingredient.origen}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Content */}
            <Tabs defaultValue="nombres" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="nombres">Nombres</TabsTrigger>
                <TabsTrigger value="usos">Usos</TabsTrigger>
                <TabsTrigger value="precios">Precios</TabsTrigger>
                <TabsTrigger value="tecnico">Técnico</TabsTrigger>
              </TabsList>

              <TabsContent value="nombres" className="space-y-4">
                <Card className="bg-white/90">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="h-5 w-5" />
                      <span>Nombres en Diferentes Idiomas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-600">Español (España)</span>
                          <p className="font-medium">{ingredient.name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Inglés</span>
                          <p className="font-medium">{ingredient.nameEN}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Francés</span>
                          <p className="font-medium">{ingredient.nameFR}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Italiano</span>
                          <p className="font-medium">{ingredient.nameIT}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-600">Latinoamérica</span>
                          <p className="font-medium">{ingredient.nameLA}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Portugués</span>
                          <p className="font-medium">{ingredient.namePT}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Chino</span>
                          <p className="font-medium">{ingredient.nameZH}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="usos" className="space-y-4">
                <Card className="bg-white/90">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ChefHat className="h-5 w-5" />
                      <span>Usos en Cocina Profesional</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ingredient.uses.map((use, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <Star className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{use}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90">
                  <CardHeader>
                    <CardTitle>Recetas Destacadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {ingredient.recipes.map((recipe, index) => (
                        <div key={index} className="p-4 border border-green-200 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-2">{recipe.name}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Tipo:</span> {recipe.type}</p>
                            <p><span className="font-medium">Dificultad:</span> {recipe.difficulty}</p>
                            <p><span className="font-medium">Tiempo:</span> {recipe.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="precios" className="space-y-4">
                <Card className="bg-white/90">
                  <CardHeader>
                    <CardTitle>Precios por País</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(ingredient.prices).map(([country, data]) => (
                        <div key={country} className="p-4 border border-green-200 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-2">{country}</h4>
                          <p className="text-2xl font-bold text-green-600 mb-1">
                            {data.currency}{data.price.toFixed(2)}/{data.unit}
                          </p>
                          <p className="text-sm text-gray-600">{data.season_variation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90">
                  <CardHeader>
                    <CardTitle>Evolución Mensual de Precios (España)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Mes</th>
                            <th className="text-right py-2">España</th>
                            <th className="text-right py-2">Francia</th>
                            <th className="text-right py-2">EE.UU.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyPrices.map((month, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2">{month.month}</td>
                              <td className="text-right py-2">€{month.spain.toFixed(2)}</td>
                              <td className="text-right py-2">€{month.france.toFixed(2)}</td>
                              <td className="text-right py-2">${month.usa.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tecnico" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-white/90">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Calculator className="h-5 w-5" />
                        <span>Merma y Rendimiento</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="text-gray-700">Merma</span>
                          <span className="text-2xl font-bold text-red-600">{ingredient.merma}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="text-gray-700">Rendimiento</span>
                          <span className="text-2xl font-bold text-green-600">{ingredient.rendimiento}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/90">
                    <CardHeader>
                      <CardTitle>Información Nutricional (por 100g)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Calorías</span>
                          <span className="font-medium">{ingredient.nutrition.calories} kcal</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Proteínas</span>
                          <span className="font-medium">{ingredient.nutrition.protein}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Carbohidratos</span>
                          <span className="font-medium">{ingredient.nutrition.carbs}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Grasas</span>
                          <span className="font-medium">{ingredient.nutrition.fat}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fibra</span>
                          <span className="font-medium">{ingredient.nutrition.fiber}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vitamina C</span>
                          <span className="font-medium">{ingredient.nutrition.vitamin_c}mg</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white/90">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Conservación y Preparación</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Almacenamiento</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Temperatura:</span>
                            <span className="font-medium">{ingredient.storage.temperature}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Humedad:</span>
                            <span className="font-medium">{ingredient.storage.humidity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duración:</span>
                            <span className="font-medium">{ingredient.storage.duration}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-3">
                          <strong>Consejo:</strong> {ingredient.storage.tips}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Preparación</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><strong>Lavado:</strong> {ingredient.preparation.washing}</p>
                          <p><strong>Corte:</strong> {ingredient.preparation.cutting}</p>
                          <p><strong>Cocción:</strong> {ingredient.preparation.cooking}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Añadir a Favoritos
                </Button>
                <Button variant="outline" className="w-full">
                  Comparar Precios
                </Button>
                <Button variant="outline" className="w-full">
                  Ver Recetas
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="text-lg">Datos Clave</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{ingredient.popularity}%</p>
                    <p className="text-sm text-gray-600">Popularidad</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{ingredient.rendimiento}%</p>
                    <p className="text-sm text-gray-600">Rendimiento</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio promedio:</span>
                    <span className="font-medium">€3.50/kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Variedad principal:</span>
                    <span className="font-medium">Cherry rojo</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Ingredients */}
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="text-lg">Ingredientes Relacionados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Tomate Pera", id: 9 },
                    { name: "Tomate RAF", id: 10 },
                    { name: "Pimiento Rojo", id: 11 }
                  ].map((item) => (
                    <Link 
                      key={item.id} 
                      to={`/ingrediente/${item.id}`}
                      className="block p-2 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <span className="text-sm text-gray-700 hover:text-green-600">
                        {item.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredienteDetalle;
