
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader, Wand2, Zap } from "lucide-react";
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

  const { data: categories = [] } = useCategories();
  const generateContent = useGenerateContent();

  const handleGenerateContent = async () => {
    try {
      const result = await generateContent.mutateAsync({
        type: contentType,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        region: region,
        count: count
      });

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Generador de Contenido AI
          <Badge className="bg-green-100 text-green-800 ml-2">
            <Zap className="h-3 w-3 mr-1" />
            Flux 1.1 Pro + DeepSeek
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
        </div>

        <Button 
          onClick={handleGenerateContent}
          disabled={generateContent.isPending}
          className="w-full"
        >
          {generateContent.isPending ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          Generar Contenido con DeepSeek AI
        </Button>

        {contentType === 'ingredient' && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Zap className="h-4 w-4" />
              <span><strong>FLUJO OPTIMIZADO:</strong> Genera contenido → Guarda en DB → Genera imágenes automáticamente con Flux 1.1 Pro</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminContentGeneratorForm;
