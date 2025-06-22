import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control } from "react-hook-form";
import { IngredientFormData } from "./types";

interface IngredientTechnicalTabProps {
  control: Control<IngredientFormData>;
}

const IngredientTechnicalTab = ({ control }: IngredientTechnicalTabProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
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
    </div>
  );
};

export default IngredientTechnicalTab;
