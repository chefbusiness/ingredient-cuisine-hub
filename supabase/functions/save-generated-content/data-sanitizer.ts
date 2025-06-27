
import { sanitizeText } from './validation.ts';
import type { IngredientData } from './types.ts';

export function sanitizeIngredientData(ingredient: any): IngredientData {
  return {
    name: sanitizeText(ingredient.name, 100),
    name_en: sanitizeText(ingredient.name_en, 100),
    name_la: sanitizeText(ingredient.name_la, 100),
    name_fr: sanitizeText(ingredient.name_fr, 100),
    name_it: sanitizeText(ingredient.name_it, 100),
    name_pt: sanitizeText(ingredient.name_pt, 100),
    name_zh: sanitizeText(ingredient.name_zh, 100),
    description: sanitizeText(ingredient.description, 6000),
    category: sanitizeText(ingredient.category, 50),
    temporada: sanitizeText(ingredient.temporada, 100),
    origen: sanitizeText(ingredient.origen, 100),
    merma: Math.max(0, Math.min(100, parseFloat(ingredient.merma) || 0)),
    rendimiento: Math.max(0, Math.min(100, parseFloat(ingredient.rendimiento) || 100)),
    popularity: Math.max(0, Math.min(100, parseInt(ingredient.popularity) || 0)),
    prices_by_country: ingredient.prices_by_country,
    price_estimate: ingredient.price_estimate,
    nutritional_info: ingredient.nutritional_info,
    uses: ingredient.uses,
    recipes: ingredient.recipes,
    varieties: ingredient.varieties
  };
}

export function validateLanguageCompleteness(ingredient: IngredientData): { complete: boolean; missing: string[] } {
  const requiredLanguages = ['name_fr', 'name_it', 'name_pt', 'name_zh'];
  const missingLanguages = requiredLanguages.filter(lang => !ingredient[lang as keyof IngredientData]);
  
  return {
    complete: missingLanguages.length === 0,
    missing: missingLanguages
  };
}
