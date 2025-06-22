
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control } from "react-hook-form";

interface IngredientLanguagesTabProps {
  control: Control<any>;
}

const IngredientLanguagesTab = ({ control }: IngredientLanguagesTabProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
    </div>
  );
};

export default IngredientLanguagesTab;
