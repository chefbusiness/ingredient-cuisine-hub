import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChefHat, TrendingUp, Calculator, Globe, Clock, Star, Heart, Camera, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIngredientById } from "@/hooks/useIngredients";
import { useRealImages } from "@/hooks/useRealImages";
import { useGenerateImage } from "@/hooks/useContentGeneration";
import RealImagesGallery from "@/components/RealImagesGallery";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const IngredienteDetalle = () => {
  const { id } = useParams();
  const { data: ingredient, isLoading, error } = useIngredientById(id || "");
  const { data: realImages = [] } = useRealImages(id || "");
  const generateImage = useGenerateImage();

  const handleGenerateImage = async () => {
    if (!ingredient) return;
    
    await generateImage.mutateAsync({
      ingredientName: ingredient.name,
      description: ingredient.description
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <Skeleton className="md:w-64 h-64" />
                      <div className="flex-1 space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-48" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ingredient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          <Alert className="max-w-md mx-auto">
            <AlertDescription>
              {error ? 'Error al cargar el ingrediente' : 'Ingrediente no encontrado'}
            </AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Link to="/directorio">
              <Button variant="outline">Volver al directorio</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Usar imagen real si existe, sino la imagen AI generada
  const primaryImage = ingredient.real_image_url || ingredient.image_url;

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
              <Link to="/admin" className="text-gray-600 hover:text-green-600 transition-colors">Admin</Link>
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
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={ingredient.name}
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg shadow-lg flex items-center justify-center">
                        <div className="text-center">
                          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 mb-3">Sin imagen</p>
                          <Button 
                            size="sm" 
                            onClick={handleGenerateImage}
                            disabled={generateImage.isPending}
                          >
                            {generateImage.isPending ? 'Generando...' : 'Generar imagen'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                          {ingredient.name}
                        </h1>
                        <p className="text-lg text-gray-600 mb-3">{ingredient.name_en}</p>
                        <Badge variant="outline" className="mb-4">
                          {ingredient.categories?.name || 'Sin categoría'}
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
                      {ingredient.temporada && (
                        <div>
                          <span className="text-gray-600">Temporada:</span>
                          <p className="font-medium">{ingredient.temporada}</p>
                        </div>
                      )}
                      {ingredient.origen && (
                        <div>
                          <span className="text-gray-600">Origen:</span>
                          <p className="font-medium">{ingredient.origen}</p>
                        </div>
                      )}
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
                          <p className="font-medium">{ingredient.name_en}</p>
                        </div>
                        {ingredient.name_fr && (
                          <div>
                            <span className="text-sm text-gray-600">Francés</span>
                            <p className="font-medium">{ingredient.name_fr}</p>
                          </div>
                        )}
                        {ingredient.name_it && (
                          <div>
                            <span className="text-sm text-gray-600">Italiano</span>
                            <p className="font-medium">{ingredient.name_it}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {ingredient.name_la && (
                          <div>
                            <span className="text-sm text-gray-600">Latinoamérica</span>
                            <p className="font-medium">{ingredient.name_la}</p>
                          </div>
                        )}
                        {ingredient.name_pt && (
                          <div>
                            <span className="text-sm text-gray-600">Portugués</span>
                            <p className="font-medium">{ingredient.name_pt}</p>
                          </div>
                        )}
                        {ingredient.name_zh && (
                          <div>
                            <span className="text-sm text-gray-600">Chino</span>
                            <p className="font-medium">{ingredient.name_zh}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Galería de imágenes reales */}
                {realImages.length > 0 && (
                  <Card className="bg-white/90">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Camera className="h-5 w-5" />
                        <span>Imágenes Reales</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RealImagesGallery ingredientId={ingredient.id} />
                    </CardContent>
                  </Card>
                )}
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
                    {ingredient.ingredient_uses && ingredient.ingredient_uses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ingredient.ingredient_uses.map((useItem, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                            <Star className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{useItem.use_description}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No hay usos registrados para este ingrediente</p>
                    )}
                  </CardContent>
                </Card>

                {ingredient.ingredient_recipes && ingredient.ingredient_recipes.length > 0 && (
                  <Card className="bg-white/90">
                    <CardHeader>
                      <CardTitle>Recetas Destacadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {ingredient.ingredient_recipes.map((recipe, index) => (
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
                )}
              </TabsContent>

              <TabsContent value="precios" className="space-y-4">
                <Card className="bg-white/90">
                  <CardHeader>
                    <CardTitle>Precios por País</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ingredient.ingredient_prices && ingredient.ingredient_prices.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ingredient.ingredient_prices.map((priceData, index) => (
                          <div key={index} className="p-4 border border-green-200 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-2">
                              {priceData.countries?.name || 'País no especificado'}
                            </h4>
                            <p className="text-2xl font-bold text-green-600 mb-1">
                              {priceData.countries?.currency_symbol || '€'}{priceData.price.toFixed(2)}/{priceData.unit}
                            </p>
                            <p className="text-sm text-gray-600">Precio actual</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No hay precios registrados para este ingrediente</p>
                    )}
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
                          <span className="text-2xl font-bold text-red-600">{ingredient.merma.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="text-gray-700">Rendimiento</span>
                          <span className="text-2xl font-bold text-green-600">{ingredient.rendimiento.toFixed(1)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {ingredient.nutritional_info && ingredient.nutritional_info.length > 0 && (
                    <Card className="bg-white/90">
                      <CardHeader>
                        <CardTitle>Información Nutricional (por 100g)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {ingredient.nutritional_info.map((nutrition, index) => (
                          <div key={index} className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Calorías</span>
                              <span className="font-medium">{nutrition.calories} kcal</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Proteínas</span>
                              <span className="font-medium">{nutrition.protein}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Carbohidratos</span>
                              <span className="font-medium">{nutrition.carbs}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Grasas</span>
                              <span className="font-medium">{nutrition.fat}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fibra</span>
                              <span className="font-medium">{nutrition.fiber}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Vitamina C</span>
                              <span className="font-medium">{nutrition.vitamin_c}mg</span>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {ingredient.ingredient_varieties && ingredient.ingredient_varieties.length > 0 && (
                  <Card className="bg-white/90">
                    <CardHeader>
                      <CardTitle>Variedades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {ingredient.ingredient_varieties.map((variety, index) => (
                          <Badge key={index} variant="secondary">
                            {variety.variety_name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                  <Heart className="h-4 w-4 mr-2" />
                  Añadir a Favoritos
                </Button>
                <Button variant="outline" className="w-full">
                  Comparar Precios
                </Button>
                <Button variant="outline" className="w-full">
                  Ver Recetas
                </Button>
                {!primaryImage && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGenerateImage}
                    disabled={generateImage.isPending}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {generateImage.isPending ? 'Generando...' : 'Generar imagen'}
                  </Button>
                )}
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
                    <p className="text-2xl font-bold text-blue-600">{ingredient.rendimiento.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Rendimiento</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  {ingredient.ingredient_prices && ingredient.ingredient_prices.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precio promedio:</span>
                      <span className="font-medium">
                        {ingredient.ingredient_prices[0].countries?.currency_symbol || '€'}
                        {ingredient.ingredient_prices[0].price.toFixed(2)}/{ingredient.ingredient_prices[0].unit}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categoría:</span>
                    <span className="font-medium">{ingredient.categories?.name || 'Sin categoría'}</span>
                  </div>
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
