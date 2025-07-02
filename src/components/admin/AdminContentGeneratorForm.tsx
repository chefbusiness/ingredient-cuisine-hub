
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader, Wand2, Zap, Globe, Search, List, Brain, AlertTriangle } from "lucide-react";
import { useGenerateContentWithProgress } from "@/hooks/useGenerateContentWithProgress";
import { useCategories } from "@/hooks/useCategories";
import { useCountries } from "@/hooks/useCountries";
import ContentGenerationProgress from "./ContentGenerationProgress";

interface AdminContentGeneratorFormProps {
  onContentGenerated: (content: any[]) => void;
}

const AdminContentGeneratorForm = ({ onContentGenerated }: AdminContentGeneratorFormProps) => {
  const [contentType, setContentType] = useState<'ingredient' | 'category' | 'price_update'>('ingredient');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [region, setRegion] = useState('España');
  const [count, setCount] = useState(5); // AUMENTADO: por defecto 5 en vez de 3
  const [isManualMode, setIsManualMode] = useState(false);
  const [ingredientsList, setIngredientsList] = useState('');
  const [categoriesList, setCategoriesList] = useState('');

  const { data: categories = [] } = useCategories();
  const { data: countries = [] } = useCountries();
  const { generateContent, isLoading, progress } = useGenerateContentWithProgress();

  // Parse and validate ingredient list
  const parseIngredientsList = (text: string): string[] => {
    return text
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  // Parse and validate categories list
  const parseCategoriesList = (text: string): string[] => {
    return text
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  const parsedIngredients = parseIngredientsList(ingredientsList);
  const validIngredientCount = parsedIngredients.length;

  const parsedCategories = parseCategoriesList(categoriesList);
  const validCategoryCount = parsedCategories.length;

  const handleGenerateContent = async () => {
    try {
      let requestData;
      
      if (isManualMode && contentType === 'ingredient' && validIngredientCount > 0) {
        // Manual mode: use specific ingredient list
        console.log('🎯 MODO MANUAL - Lista de ingredientes:', parsedIngredients);
        requestData = {
          type: contentType,
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          region: region,
          count: validIngredientCount,
          ingredientsList: parsedIngredients
        };
      } else if (isManualMode && contentType === 'category' && validCategoryCount > 0) {
        // Manual mode: use specific categories list
        console.log('🎯 MODO MANUAL - Lista de categorías:', parsedCategories);
        requestData = {
          type: contentType,
          region: region,
          count: validCategoryCount,
          categoriesList: parsedCategories
        };
      } else {
        // Automatic mode: let Perplexity decide
        console.log('🤖 MODO AUTOMÁTICO - Cantidad:', count);
        requestData = {
          type: contentType,
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          region: region,
          count: count
        };
      }

      console.log('📡 Enviando solicitud:', requestData);
      const result = await generateContent(requestData);

      let processedData = result;
      if (contentType === 'ingredient' && selectedCategory !== 'all') {
        processedData = result.map((item: any) => ({
          ...item,
          category: selectedCategory
        }));
      }
      
      onContentGenerated(processedData);
    } catch (error) {
      console.error('❌ Error generating content:', error);
    }
  };

  const isFormValid = () => {
    if (isManualMode) {
      if (contentType === 'ingredient') {
        return validIngredientCount > 0 && validIngredientCount <= 50;
      } else if (contentType === 'category') {
        return validCategoryCount > 0 && validCategoryCount <= 20; // Máximo 20 categorías
      }
    }
    return count > 0 && count <= 50; // AUMENTADO: de 10 a 50 ingredientes automáticos
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Generador de Contenido con IA - OPTIMIZADO MASIVO
          <Badge className="bg-blue-100 text-blue-800 ml-2">
            <Globe className="h-3 w-3 mr-1" />
            Perplexity Sonar
          </Badge>
          <Badge className="bg-green-100 text-green-800">
            <Search className="h-3 w-3 mr-1" />
            Hasta 50 ingredientes
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Display */}
        <ContentGenerationProgress 
          progress={progress} 
          isVisible={isLoading}
        />

        {/* Mode Toggle */}
        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <Label htmlFor="manual-mode" className="text-sm font-medium text-blue-800">
              Modo Automático (Perplexity decide)
            </Label>
          </div>
          <Switch
            id="manual-mode"
            checked={isManualMode}
            onCheckedChange={setIsManualMode}
          />
          <div className="flex items-center space-x-2">
            <List className="h-4 w-4 text-green-600" />
            <Label htmlFor="manual-mode" className="text-sm font-medium text-green-800">
              Modo Manual (Lista específica)
            </Label>
          </div>
        </div>

        {/* Debugging Info */}
        {isManualMode && (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-800 text-sm mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Modo de Depuración Activado</span>
            </div>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>• Modo Manual detectado: {isManualMode ? 'SÍ' : 'NO'}</div>
              <div>• Tipo de contenido: {contentType}</div>
              {contentType === 'ingredient' && (
                <>
                  <div>• Ingredientes válidos: {validIngredientCount}</div>
                  <div>• Lista parseada: {JSON.stringify(parsedIngredients.slice(0, 3))}...</div>
                </>
              )}
              {contentType === 'category' && (
                <>
                  <div>• Categorías válidas: {validCategoryCount}</div>
                  <div>• Lista parseada: {JSON.stringify(parsedCategories.slice(0, 3))}...</div>
                </>
              )}
              <div>• Formulario válido: {isFormValid() ? 'SÍ' : 'NO'}</div>
            </div>
          </div>
        )}

        {/* Manual Mode: Ingredient List */}
        {isManualMode && contentType === 'ingredient' && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="ingredientsList">
                Lista de Ingredientes 
                <span className="text-sm text-muted-foreground ml-2">
                  (separados por comas, máximo 50)
                </span>
              </Label>
              <Textarea
                id="ingredientsList"
                placeholder="Ejemplo: azafrán, pimentón dulce, romero, tomillo, orégano..."
                value={ingredientsList}
                onChange={(e) => setIngredientsList(e.target.value)}
                className="min-h-[100px] mt-1"
              />
            </div>
            
            {ingredientsList.trim() && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <span className="font-medium text-green-600">
                    {validIngredientCount} ingredientes detectados
                  </span>
                  {validIngredientCount > 50 && (
                    <span className="text-red-600 ml-2">
                      (máximo 50 permitidos)
                    </span>
                  )}
                </div>
                <Badge variant={validIngredientCount <= 50 ? "default" : "destructive"}>
                  {validIngredientCount}/50
                </Badge>
              </div>
            )}

            {parsedIngredients.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xs font-medium text-green-800 mb-2">Vista previa:</div>
                <div className="flex flex-wrap gap-1">
                  {parsedIngredients.slice(0, 10).map((ingredient, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {ingredient}
                    </Badge>
                  ))}
                  {parsedIngredients.length > 10 && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      +{parsedIngredients.length - 10} más...
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Mode: Categories List */}
        {isManualMode && contentType === 'category' && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="categoriesList">
                Lista de Categorías 
                <span className="text-sm text-muted-foreground ml-2">
                  (separadas por comas, máximo 20)
                </span>
              </Label>
              <Textarea
                id="categoriesList"
                placeholder="Ejemplo: especias medicinales, condimentos asiáticos, hierbas aromáticas, setas silvestres..."
                value={categoriesList}
                onChange={(e) => setCategoriesList(e.target.value)}
                className="min-h-[100px] mt-1"
              />
            </div>
            
            {categoriesList.trim() && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <span className="font-medium text-green-600">
                    {validCategoryCount} categorías detectadas
                  </span>
                  {validCategoryCount > 20 && (
                    <span className="text-red-600 ml-2">
                      (máximo 20 permitidas)
                    </span>
                  )}
                </div>
                <Badge variant={validCategoryCount <= 20 ? "default" : "destructive"}>
                  {validCategoryCount}/20
                </Badge>
              </div>
            )}

            {parsedCategories.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xs font-medium text-green-800 mb-2">Vista previa:</div>
                <div className="flex flex-wrap gap-1">
                  {parsedCategories.slice(0, 10).map((category, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                  {parsedCategories.length > 10 && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      +{parsedCategories.length - 10} más...
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Configuration Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="contentType">Tipo de Contenido</Label>
            <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ingredient">Ingredientes</SelectItem>
                <SelectItem value="category">Categorías</SelectItem>
                <SelectItem value="price_update">Actualización de Precios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {contentType !== 'category' && (
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="region">País</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Automatic Mode: Count */}
          {!isManualMode && (
            <div>
              <Label htmlFor="count">Cantidad</Label>
              <Input
                type="number"
                min="1"
                max={contentType === 'category' ? "20" : "50"}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Máximo {contentType === 'category' ? '20 categorías' : '50 ingredientes'}
              </div>
            </div>
          )}

          {/* Manual Mode: Count Display */}
          {isManualMode && (
            <div>
              <Label>Cantidad</Label>
              <div className="flex items-center h-9 px-3 border rounded-md bg-muted">
                <span className="text-sm text-muted-foreground">
                  {contentType === 'ingredient' ? `${validIngredientCount} ingredientes` : `${validCategoryCount} categorías`}
                </span>
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={handleGenerateContent}
          disabled={isLoading || !isFormValid()}
          className="w-full"
        >
          {isLoading ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          {isManualMode 
            ? (contentType === 'ingredient' 
                ? `Generar ${validIngredientCount} Ingredientes Específicos`
                : `Generar ${validCategoryCount} Categorías Específicas`)
            : `Generar ${count} ${contentType === 'category' ? 'Categorías' : 'Ingredientes'} con Perplexity AI`
          }
        </Button>

        {/* Information Panel */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800 mb-2">
            <Globe className="h-4 w-4" />
            <span>
              <strong>
                {isManualMode ? 'INVESTIGACIÓN ESPECÍFICA MASIVA:' : 'INVESTIGACIÓN WEB MASIVA:'}
              </strong> 
              Perplexity consulta internet para obtener datos actuales
            </span>
          </div>
          <div className="text-xs text-blue-600 space-y-1">
            {isManualMode ? (
              <>
                {contentType === 'ingredient' ? (
                  <>
                    <div>• Investigación individual de cada ingrediente de tu lista (hasta 50)</div>
                    <div>• Datos específicos para cada país seleccionado</div>
                    <div>• Detección previa de duplicados para ahorrar tokens</div>
                    <div>• Misma calidad de datos que el modo automático</div>
                  </>
                ) : (
                  <>
                    <div>• Investigación individual de cada categoría de tu lista (hasta 20)</div>
                    <div>• Nombres en múltiples idiomas y descripciones detalladas</div>
                    <div>• Detección previa de duplicados para ahorrar tokens</div>
                    <div>• Categorías optimizadas para la gastronomía profesional</div>
                  </>
                )}
              </>
            ) : (
              <>
                {contentType === 'ingredient' ? (
                  <>
                    <div>• Generación masiva de hasta 50 ingredientes por categoría</div>
                    <div>• Precios actuales de mercados mayoristas (Mercamadrid, Mercabarna)</div>
                    <div>• Datos de merma de fuentes profesionales de hostelería</div>
                    <div>• Información nutricional oficial (BEDCA, USDA, FAO)</div>
                    <div>• Recetas auténticas de chefs y libros especializados</div>
                  </>
                ) : (
                  <>
                    <div>• Generación masiva de hasta 20 categorías gastronómicas</div>
                    <div>• Nomenclatura profesional de cocina y hostelería</div>
                    <div>• Categorías especializadas por regiones y tradiciones culinarias</div>
                    <div>• Traducciones precisas en múltiples idiomas</div>
                  </>
                )}
              </>
            )}
          </div>
          <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
            <strong>OPTIMIZACIÓN:</strong> Pre-filtrado de duplicados → Investigación masiva → Guarda en DB → Genera imágenes
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminContentGeneratorForm;
