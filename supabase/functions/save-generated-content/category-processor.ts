
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { sanitizeText } from './validation.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function processCategories(data: any[], userEmail: string): Promise<{ success: boolean, results: any[], data: any[] }> {
  const results = [];
  const savedCategoriesData = [];
  
  for (const category of data) {
    // Sanitize category data
    const sanitizedCategory = {
      name: sanitizeText(category.name, 100),
      name_en: sanitizeText(category.name_en, 100),
      description: sanitizeText(category.description, 500)
    };

    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert(sanitizedCategory)
      .select('id, name, created_at')
      .single();

    if (error && !error.message.includes('duplicate')) {
      throw error;
    }

    if (newCategory) {
      savedCategoriesData.push(newCategory);
    }

    results.push({
      id: newCategory?.id,
      name: sanitizedCategory.name,
      success: !error
    });
  }

  // Log the admin action
  try {
    await supabase.rpc('log_admin_action', {
      action_type: 'save_categories',
      resource_type: 'category',
      action_details: {
        total_processed: data.length,
        successfully_created: results.filter(r => r.success).length,
        user_email: userEmail
      }
    });
  } catch (logError) {
    console.log('⚠️ Failed to log admin action:', logError);
  }

  return {
    success: true,
    results: results,
    data: savedCategoriesData
  };
}
