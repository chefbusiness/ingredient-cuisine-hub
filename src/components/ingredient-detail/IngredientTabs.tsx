
import { Globe, ChefHat, Calculator, Camera } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import RealImagesGallery from "@/components/RealImagesGallery";
import { Ingredient } from "@/hooks/useIngredients";

interface IngredientTabsProps {
  ingredient: Ingredient;
  realImagesCount: number;
}

const IngredientTabs = ({ ingredient, realImagesCount }: IngredientTabsProps) => {
  return (
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

        {realImagesCount > 0 && (
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
  );
};

export default IngredientTabs;
