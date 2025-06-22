import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Control, UseFormWatch } from "react-hook-form";
import { IngredientFormData } from "./types";

interface IngredientImagesTabProps {
  control: Control<IngredientFormData>;
  watch: UseFormWatch<IngredientFormData>;
}

const IngredientImagesTab = ({ control, watch }: IngredientImagesTabProps) => {
  const currentImageUrl = watch('image_url');
  const realImageUrl = watch('real_image_url');
  const ingredientName = watch('name');

  return (
    <div className="space-y-4">
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
                  alt={ingredientName || 'Ingredient'}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            )}
            <FormField
              control={control}
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
            {realImageUrl && (
              <div className="mb-2">
                <img 
                  src={realImageUrl} 
                  alt={`${ingredientName} real`}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            )}
            <FormField
              control={control}
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
    </div>
  );
};

export default IngredientImagesTab;
