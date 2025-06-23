
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader, Wand2, Zap, Globe, Search, List, Brain } from "lucide-react";
import { useGenerateContent } from "@/hooks/useGenerateContent";
import { useCategories } from "@/hooks/useCategories";

interface AdminContentGeneratorFormProps {
  onContentGenerated: (content: any[]) => void;
}

const AdminContentGeneratorForm = ({ onContentGenerated }: AdminContentGeneratorFormProps) => {
  const [contentType, setContentType] = useState<'ingredient' | 'category' | 'price_update'>('ingredient');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [region, setRegion] = useState('España');
  const [count, setCount] = useState(5);
  const [isManualMode, setIsManualMode] = useState(false);
  const [ingredientsList, setIngredientsList] = useState('');

  const { data: categories = [] } = useCategories();
  const generateContent = useGenerateContent();

  // Parse and validate ingredient list
  const parseIngredientsList = (text: string): string[] => {
    return text
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  const parsedIngredients = parseIngredientsList(ingredientsList);
  const validIngredientCount = parsedIngredients.length;

  const handleGenerateContent = async () => {
    try {
      let requestData;
      
      if (isManualMode && validIngredientCount > 0) {
        // Manual mode: use specific ingredient list
        requestData = {
          type: contentType,
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          region: region,
          count: validIngredientCount,
          ingredientsList: parsedIngredients
        };
      } else {
        // Automatic mode: let Perplexity decide
        requestData = {
          type: contentType,
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          region: region,
          count: count
        };
      }

      const result = await generateContent.mutateAsync(requestData);

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
      return validIngredientCount > 0 && validIngredientCount <= 20;
    }
    return count > 0 && count <= 10;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Generador de Contenido con IA
          <Badge className="bg-blue-100 text-blue-800 ml-2">
            <Globe className="h-3 w-3 mr-1" />
            Perplexity Sonar
          </Badge>
          <Badge className="bg-green-100 text-green-800">
            <Search className="h-3 w-3 mr-1" />
            Datos Reales Web
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {/* Manual Mode: Ingredient List */}
        {isManualMode && contentType === 'ingredient' && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="ingredientsList">
                Lista de Ingredientes 
                <span className="text-sm text-muted-foreground ml-2">
                  (separados por comas, máximo 20)
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
                  {validIngredientCount > 20 && (
                    <span className="text-red-600 ml-2">
                      (máximo 20 permitidos)
                    </span>
                  )}
                </div>
                <Badge variant={validIngredientCount <= 20 ? "default" : "destructive"}>
                  {validIngredientCount}/20
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
            <Label htmlFor="region">Región</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="España">España</SelectItem>
                <SelectItem value="Francia">Francia</SelectItem>
                <SelectItem value="Italia">Italia</SelectItem>
                <SelectItem value="México">México</SelectItem>
                <SelectItem value="Argentina">Argentina</SelectItem>
                <SelectItem value="Colombia">Colombia</SelectItem>
                <SelectItem value="Perú">Perú</SelectItem>
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
                max="10"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              />
            </div>
          )}

          {/* Manual Mode: Count Display */}
          {isManualMode && (
            <div>
              <Label>Cantidad</Label>
              <div className="flex items-center h-9 px-3 border rounded-md bg-muted">
                <span className="text-sm text-muted-foreground">
                  {validIngredientCount} ingredientes
                </span>
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={handleGenerateContent}
          disabled={generateContent.isPending || !isFormValid()}
          className="w-full"
        >
          {generateContent.isPending ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          {isManualMode 
            ? `Generar ${validIngredientCount} Ingredientes Específicos`
            : 'Generar Contenido con Perplexity AI'
          }
        </Button>

        {/* Information Panel */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800 mb-2">
            <Globe className="h-4 w-4" />
            <span>
              <strong>
                {isManualMode ? 'INVESTIGACIÓN ESPECÍFICA:' : 'INVESTIGACIÓN WEB REAL:'}
              </strong> 
              Perplexity consulta internet para obtener datos actuales
            </span>
          </div>
          <div className="text-xs text-blue-600 space-y-1">
            {isManualMode ? (
              <>
                <div>• Investigación individual de cada ingrediente de tu lista</div>
                <div>• Datos específicos para cada región seleccionada</div>
                <div>• Misma calidad de datos que el modo automático</div>
                <div>• Precios actuales de mercados mayoristas por ingrediente</div>
              </>
            ) : (
              <>
                <div>• Precios actuales de mercados mayoristas (Mercamadrid, Mercabarna)</div>
                <div>• Datos de merma de fuentes profesionales de hostelería</div>
                <div>• Información nutricional oficial (BEDCA, USDA, FAO)</div>
                <div>• Recetas auténticas de chefs y libros especializados</div>
              </>
            )}
          </div>
          <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
            <strong>FLUJO:</strong> Investiga datos reales → Guarda en DB → Genera imágenes con Flux 1.1 Pro
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminContentGeneratorForm;
