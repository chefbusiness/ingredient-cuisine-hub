
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const categoryTranslations: { [key: string]: string } = {
  'especias': 'spices',
  'verduras': 'vegetables',
  'frutas': 'fruits',
  'carnes': 'meats',
  'pescados': 'fish',
  'lacteos': 'dairy',
  'cereales': 'cereals'
};

export async function getOrCreateCategory(categoryName: string): Promise<string> {
  console.log('📂 Buscando/creando categoría:', categoryName);
  
  const normalizedCategoryName = categoryName || 'otros';
  
  // Try to find existing category
  const { data: existingCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('name', normalizedCategoryName)
    .single();

  if (existingCategory?.id) {
    console.log('📂 Categoría encontrada:', existingCategory.id);
    return existingCategory.id;
  }

  // Create new category
  console.log('🆕 Creando nueva categoría:', normalizedCategoryName);
  const { data: newCategory, error: categoryError } = await supabase
    .from('categories')
    .insert({
      name: normalizedCategoryName,
      name_en: categoryTranslations[normalizedCategoryName] || normalizedCategoryName,
      description: `Categoría de ${normalizedCategoryName}`
    })
    .select('id')
    .single();

  if (categoryError) {
    console.error('❌ Error creando categoría:', categoryError);
    throw categoryError;
  }

  console.log('✅ Categoría creada:', newCategory.id);
  return newCategory.id;
}
