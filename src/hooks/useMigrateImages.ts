
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MigrateImagesOptions {
  batchSize?: number;
  onProgress?: (current: number, total: number) => void;
}

export const useMigrateImages = (options: MigrateImagesOptions = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { batchSize = 5, onProgress } = options;

  return useMutation({
    mutationFn: async () => {
      console.log('🔄 === STARTING IMAGE MIGRATION TO STORAGE ===');
      
      // Get all ingredients with Replicate URLs
      const { data: ingredients, error: fetchError } = await supabase
        .from('ingredients')
        .select('id, name, image_url')
        .like('image_url', '%replicate.delivery%')
        .not('image_url', 'is', null);

      if (fetchError) {
        console.error('❌ Error fetching ingredients:', fetchError);
        throw new Error(`Error fetching ingredients: ${fetchError.message}`);
      }

      if (!ingredients || ingredients.length === 0) {
        console.log('✅ No images to migrate - all images are already in Supabase Storage');
        return { migrated: 0, total: 0, message: 'No images need migration' };
      }

      console.log(`📊 Found ${ingredients.length} ingredients with Replicate URLs to migrate`);
      
      let migrated = 0;
      let errors = 0;
      const migrationErrors: string[] = [];

      // Process in batches to avoid overwhelming the system
      for (let i = 0; i < ingredients.length; i += batchSize) {
        const batch = ingredients.slice(i, i + batchSize);
        console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(ingredients.length / batchSize)}`);
        
        await Promise.all(
          batch.map(async (ingredient) => {
            try {
              console.log(`📸 Migrating image for: ${ingredient.name}`);
              
              // Call our migration function
              const { data, error } = await supabase.functions.invoke('migrate-single-image', {
                body: { 
                  ingredientId: ingredient.id,
                  ingredientName: ingredient.name,
                  currentImageUrl: ingredient.image_url
                }
              });

              if (error || !data?.success) {
                console.error(`❌ Migration failed for ${ingredient.name}:`, error || data?.error);
                errors++;
                migrationErrors.push(`${ingredient.name}: ${error?.message || data?.error}`);
                return;
              }

              console.log(`✅ Successfully migrated image for: ${ingredient.name}`);
              migrated++;
              
              if (onProgress) {
                onProgress(migrated + errors, ingredients.length);
              }
              
            } catch (error) {
              console.error(`❌ Exception migrating ${ingredient.name}:`, error);
              errors++;
              migrationErrors.push(`${ingredient.name}: ${error.message}`);
            }
          })
        );
        
        // Pause between batches to be gentle on the system
        if (i + batchSize < ingredients.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log('🎉 === IMAGE MIGRATION COMPLETED ===');
      console.log(`📊 Results: ${migrated} migrated, ${errors} errors`);
      
      if (migrationErrors.length > 0) {
        console.error('📋 Migration errors:', migrationErrors);
      }

      return {
        migrated,
        errors,
        total: ingredients.length,
        migrationErrors: migrationErrors.length > 0 ? migrationErrors : undefined
      };
    },
    onSuccess: (result) => {
      console.log('🎉 Migration completed successfully:', result);
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      
      if (result.errors === 0) {
        toast({
          title: "✅ Migración completada",
          description: `${result.migrated} imágenes migradas exitosamente a Supabase Storage`,
        });
      } else {
        toast({
          title: "⚠️ Migración completada con errores",
          description: `${result.migrated} migradas, ${result.errors} errores`,
          variant: "default",
        });
      }
    },
    onError: (error) => {
      console.error('❌ Migration failed:', error);
      toast({
        title: "❌ Error en migración",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
