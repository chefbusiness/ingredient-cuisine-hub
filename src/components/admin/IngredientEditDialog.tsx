
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ingredient } from "@/hooks/useIngredients";
import { useUpdateIngredient } from "@/hooks/useIngredientMutations";
import { useCategories } from "@/hooks/useCategories";
import { useGenerateImage } from "@/hooks/useGenerateImage";
import { useGenerateContent } from "@/hooks/useGenerateContent";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Image, RefreshCw } from "lucide-react";

interface IngredientEditDialogProps {
  ingredient: Ingredient | null;
  open: boolean;
  onClose: () => void;
}

const IngredientEditDialog = ({ ingredient, open, onClose }: IngredientEditDialogProps) => {
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const { mutate: updateIngredient, isPending } = useUpdateIngredient();
  const { mutate: generateImage, isPending: isGeneratingImage } = useGenerateImage();
  const { mutate: generateContent, isPending: isGeneratingContent } = useGenerateContent();
  const { data: categories = [] } = useCategories();
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      name: "",
      name_en: "",
      name_la: "",
      name_fr: "",
      name_it: "",
      name_pt: "",
      name_zh: "",
      description: "",
      category_id: "",
      temporada: "",
      origen: "",
      merma: 0,
      rendimiento: 100,
      popularity: 0,
      image_url: "",
      real_image_url: "",
    },
  });

  useEffect(() => {
    if (ingredient) {
      form.reset({
        name: ingredient.name || "",
        name_en: ingredient.name_en || "",
        name_la: ingredient.name_la || "",
        name_fr: ingredient.name_fr || "",
        name_it: ingredient.name_it || "",
        name_pt: ingredient.name_pt || "",
        name_zh: ingredient.name_zh || "",
        description: ingredient.description || "",
        category_id: ingredient.category_id || "",
        temporada: ingredient.temporada || "",
        origen: ingredient.origen || "",
        merma: ingredient.merma || 0,
        rendimiento: ingredient.rendimiento || 100,
        popularity: ingredient.popularity || 0,
        image_url: ingredient.image_url || "",
        real_image_url: ingredient.real_image_url || "",
      });
    }
  }, [ingredient, form]);

  const onSubmit = (data: any) => {
    if (!ingredient) return;
    
    updateIngredient({
      id: ingredient.id,
      updates: data,
    }, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleRegenerateImage = () => {
    if (!ingredient) return;
    
    setIsRegeneratingImage(true);
    generateImage({
      ingredientName: ingredient.name,
      description: ingredient.description,
      ingredientId: ingredient.id
    }, {
      onSuccess: (result) => {
        // Actualizar el formulario con la nueva URL de imagen
        form.setValue('image_url', result.imageUrl);
        setIsRegeneratingImage(false);
        toast({
          title: "✅ Imagen regenerada",
          description: "La nueva imagen se ha aplicado al formulario",
        });
      },
      onError: () => {
        setIsRegeneratingImage(false);
      }
    });
  };

  const handleRegenerateContent = () => {
    if (!ingredient) return;
    
    generateContent({
      type: 'ingredient',
      count: 1,
      category: ingredient.categories?.name || 'otros'
    });
  };

  const getDataQuality = () => {
    if (!ingredient) return { score: 0, issues: [] };
    
    const issues = [];
    let score = 100;
    
    if (!ingredient.image_url) {
      issues.push("Sin imagen");
      score -= 20;
    }
    if (!ingredient.name_fr || !ingredient.name_it) {
      issues.push("Faltan traducciones");
      score -= 15;
    }
    if (!ingredient.temporada) {
      issues.push("Sin temporada");
      score -= 10;
    }
    if (!ingredient.origen) {
      issues.push("Sin origen");
      score -= 10;
    }
    
    return { score: Math.max(0, score), issues };
  };

  const quality = getDataQuality();
  const currentImageUrl = form.watch('image_url');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar Ingrediente
            <Badge variant={quality.score >= 80 ? "default" : quality.score >= 60 ? "secondary" : "destructive"}>
              Calidad: {quality.score}%
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Modifica todos los campos del ingrediente y usa herramientas de IA para mejorar el contenido
          </DialogDescription>
          {quality.issues.length > 0 && (
            <div className="text-sm text-orange-600">
              Problemas detectados: {quality.issues.join(", ")}
            </div>
          )}
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRegenerateImage}
            disabled={isGeneratingImage || isRegeneratingImage}
          >
            <Image className="h-4 w-4 mr-1" />
            {(isGeneratingImage || isRegeneratingImage) ? "Generando..." : "Regenerar Imagen"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRegenerateContent}
            disabled={isGeneratingContent}
          >
            <Wand2 className="h-4 w-4 mr-1" />
            {isGeneratingContent ? "Generando..." : "Regenerar Contenido"}
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="languages">Idiomas</TabsTrigger>
                <TabsTrigger value="images">Imágenes</TabsTrigger>
                <TabsTrigger value="technical">Técnico</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre (ES) *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="name_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre (EN) *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="temporada"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temporada</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ej: Primavera-Verano" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="origen"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origen</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ej: Mediterráneo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="languages" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name_la"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre (ES-LA)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="name_fr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre (FR)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="name_it"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre (IT)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="name_pt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre (PT)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="name_zh"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre (ZH)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Imagen AI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentImageUrl && (
                        <div className="mb-2">
                          <img 
                            src={currentImageUrl} 
                            alt={form.watch('name') || 'Ingredient'}
                            className="w-full h-32 object-cover rounded"
                          />
                        </div>
                      )}
                      <FormField
                        control={form.control}
                        name="image_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL Imagen AI</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Imagen Real</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {form.watch('real_image_url') && (
                        <div className="mb-2">
                          <img 
                            src={form.watch('real_image_url')} 
                            alt={`${form.watch('name')} real`}
                            className="w-full h-32 object-cover rounded"
                          />
                        </div>
                      )}
                      <FormField
                        control={form.control}
                        name="real_image_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL Imagen Real</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="merma"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Merma (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rendimiento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rendimiento (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="popularity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Popularidad</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default IngredientEditDialog;
