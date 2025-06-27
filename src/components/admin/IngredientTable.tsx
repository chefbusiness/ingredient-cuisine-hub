
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Ingredient } from "@/hooks/useIngredients";
import { Edit, Trash2, Wand2, Image, RefreshCw } from "lucide-react";
import { useGenerateImage } from "@/hooks/useGenerateImage";
import { useGenerateContent } from "@/hooks/useGenerateContent";
import { useToast } from "@/hooks/use-toast";

interface IngredientTableProps {
  ingredients: Ingredient[];
  isLoading: boolean;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
}

const IngredientTable = ({ ingredients, isLoading, onEdit, onDelete }: IngredientTableProps) => {
  const { mutate: generateImage } = useGenerateImage();
  const { mutate: generateContent } = useGenerateContent();
  const { toast } = useToast();

  const handleRegenerateImage = (ingredient: Ingredient) => {
    generateImage({
      ingredientName: ingredient.name,
      description: ingredient.description,
      ingredientId: ingredient.id
    });
  };

  const handleRegenerateContent = (ingredient: Ingredient) => {
    generateContent({
      type: 'ingredient',
      count: 1,
      category: ingredient.categories?.name || 'otros'
    }, {
      onSuccess: () => {
        toast({
          title: "🔄 Contenido regenerado",
          description: `Se ha actualizado el contenido para ${ingredient.name}`,
        });
      }
    });
  };

  const getDataQuality = (ingredient: Ingredient) => {
    let score = 100;
    const issues = [];
    
    if (!ingredient.image_url) {
      score -= 20;
      issues.push("Sin imagen");
    }
    if (!ingredient.name_fr || !ingredient.name_it) {
      score -= 15;
      issues.push("Faltan traducciones");
    }
    if (!ingredient.temporada) {
      score -= 10;
      issues.push("Sin temporada");
    }
    if (!ingredient.origen) {
      score -= 10;
      issues.push("Sin origen");
    }
    
    return { score: Math.max(0, score), issues };
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Cargando ingredientes...</p>
      </div>
    );
  }

  if (ingredients.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No se encontraron ingredientes</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 sticky left-0 bg-background z-10">Imagen</TableHead>
              <TableHead className="min-w-[200px] sticky left-16 bg-background z-10">Nombre</TableHead>
              <TableHead className="min-w-[120px]">Categoría</TableHead>
              <TableHead className="min-w-[100px]">Calidad</TableHead>
              <TableHead className="min-w-[100px] hidden sm:table-cell">Temporada</TableHead>
              <TableHead className="min-w-[80px] hidden md:table-cell">Merma</TableHead>
              <TableHead className="min-w-[100px] hidden md:table-cell">Rendimiento</TableHead>
              <TableHead className="min-w-[90px] hidden lg:table-cell">Popularidad</TableHead>
              <TableHead className="min-w-[200px] sticky right-0 bg-background z-10">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.map((ingredient) => {
              const quality = getDataQuality(ingredient);
              
              return (
                <TableRow key={ingredient.id}>
                  <TableCell className="sticky left-0 bg-background z-10">
                    {ingredient.image_url ? (
                      <img 
                        src={ingredient.image_url} 
                        alt={ingredient.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Image className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium sticky left-16 bg-background z-10">
                    <div>
                      <div className="font-medium">{ingredient.name}</div>
                      <div className="text-xs text-muted-foreground">{ingredient.name_en}</div>
                      {ingredient.origen && (
                        <div className="text-xs text-blue-600">{ingredient.origen}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {ingredient.categories?.name || 'Sin categoría'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={quality.score >= 80 ? "default" : quality.score >= 60 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {quality.score}%
                      </Badge>
                      {quality.issues.length > 0 && (
                        <div className="text-xs text-orange-600" title={quality.issues.join(", ")}>
                          {quality.issues.length} problema{quality.issues.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {ingredient.temporada ? (
                      <Badge variant="outline" className="text-xs">
                        {ingredient.temporada}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{ingredient.merma}%</TableCell>
                  <TableCell className="hidden md:table-cell">{ingredient.rendimiento}%</TableCell>
                  <TableCell className="hidden lg:table-cell">{ingredient.popularity}</TableCell>
                  <TableCell className="sticky right-0 bg-background z-10">
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(ingredient)}
                        className="h-8 px-2"
                      >
                        <Edit className="h-3 w-3" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerateImage(ingredient)}
                        className="h-8 px-2"
                        title="Regenerar imagen"
                      >
                        <Image className="h-3 w-3" />
                        <span className="sr-only">Regenerar imagen</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerateContent(ingredient)}
                        className="h-8 px-2"
                        title="Regenerar contenido"
                      >
                        <Wand2 className="h-3 w-3" />
                        <span className="sr-only">Regenerar contenido</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(ingredient)}
                        className="h-8 px-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default IngredientTable;
