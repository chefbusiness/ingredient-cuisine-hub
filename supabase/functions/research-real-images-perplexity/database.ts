
import { supabase } from './auth.ts';

export async function getIngredient(ingredientId: string) {
  const { data: ingredient, error: ingredientError } = await supabase
    .from('ingredients')
    .select('name, name_en, description')
    .eq('id', ingredientId)
    .single();

  if (ingredientError || !ingredient) {
    throw new Error('Ingrediente no encontrado');
  }

  return ingredient;
}

export async function saveImageToDatabase(ingredientId: string, imageUrl: string, caption: string): Promise<boolean> {
  const { error: insertError } = await supabase
    .from('ingredient_real_images')
    .insert({
      ingredient_id: ingredientId,
      image_url: imageUrl,
      caption: caption,
      uploaded_by: 'perplexity_research',
      is_approved: true // Auto-approve Perplexity researched images
    });

  return !insertError;
}

export async function logAdminAction(actionDetails: any, userEmail?: string) {
  try {
    await supabase.rpc('log_admin_action', {
      action_type: 'research_real_images_perplexity',
      resource_type: 'ingredient_images',
      action_details: actionDetails
    });
  } catch (logError) {
    console.log('⚠️ Failed to log admin action:', logError);
  }
}
