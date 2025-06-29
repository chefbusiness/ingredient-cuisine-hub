
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { validateIngredientData, isDuplicate } from './validation.ts';
import { processMultiCountryPrices } from './pricing.ts';
import { getOrCreateCategory } from './category-manager.ts';
import { 
  processNutritionalInfo, 
  processUses, 
  processRecipes, 
  processVarieties 
} from './related-data-processor.ts';
import { sanitizeIngredientData, validateLanguageCompleteness } from './data-sanitizer.ts';
import { processLegacyPricing } from './legacy-pricing.ts';
import type { IngredientData, ProcessingResult, ProcessingSummary } from './types.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function processIngredients(data: any[], userEmail: string, isManualMode: boolean = false): Promise<{ 
  success: boolean; 
  results: ProcessingResult[]; 
  data: any[]; 
  summary: ProcessingSummary 
}> {
  console.log(`🔄 === PROCESAMIENTO ${isManualMode ? 'MODO MANUAL ULTRA-PERMISIVO' : 'MODO AUTOMÁTICO ESTRICTO'} DE INGREDIENTES ===`);
  console.log('📋 Ingredientes recibidos para procesar:', data.length);
  
  // Enhanced logging for each ingredient received
  data.forEach((ingredient, idx) => {
    console.log(`📝 Ingrediente ${idx + 1}: "${ingredient.name}" - Categoría: "${ingredient.category}"`);
  });

  // Validate all ingredients
  for (const ingredient of data) {
    if (!validateIngredientData(ingredient)) {
      console.log('❌ Invalid ingredient data format for:', ingredient);
      throw new Error('Invalid ingredient data format');
    }
  }

  // Get existing ingredients for duplicate validation
  const { data: existingIngredients, error: fetchError } = await supabase
    .from('ingredients')
    .select('name, name_en, name_fr, name_it, name_pt, name_zh');
  
  if (fetchError) {
    console.error('❌ Error obteniendo ingredientes existentes:', fetchError);
    throw fetchError;
  }

  console.log(`🔍 Found ${existingIngredients?.length || 0} existing ingredients for duplicate check`);

  const results: ProcessingResult[] = [];
  const savedIngredientsData = [];
  let duplicatesFound = 0;
  let successfullyCreated = 0;
  
  for (const ingredient of data) {
    console.log(`🔄 === PROCESANDO INGREDIENTE INDIVIDUAL ${isManualMode ? '(MODO MANUAL ULTRA-PERMISIVO)' : '(MODO AUTOMÁTICO ESTRICTO)'} ===`);
    console.log('📋 Nombre:', ingredient.name);
    console.log('📋 Categoría:', ingredient.category);
    console.log('📋 Descripción longitud:', ingredient.description?.length || 0);
    
    // Sanitize input data
    const sanitizedIngredient = sanitizeIngredientData(ingredient);
    
    // VERIFICACIÓN DE DUPLICADOS CON ALGORITMO ESPECÍFICO POR MODO
    console.log(`🔍 === VERIFICACIÓN DE DUPLICADOS CON ALGORITMO ${isManualMode ? 'ULTRA-PERMISIVO' : 'ESTRICTO'} ===`);
    const duplicateCheck = isDuplicate(sanitizedIngredient, existingIngredients || [], isManualMode);
    
    if (duplicateCheck) {
      console.log(`⚠️ DUPLICADO DETECTADO: ${sanitizedIngredient.name} ${isManualMode ? 'es 100% idéntico a uno existente' : 'ya existe con normalización estricta'}, saltando...`);
      duplicatesFound++;
      results.push({
        name: sanitizedIngredient.name,
        category: sanitizedIngredient.category,
        success: false,
        reason: isManualMode ? 'duplicate_identical' : 'duplicate',
        skipped: true
      });
      continue;
    }
    
    console.log(`✅ ${isManualMode ? 'NO ES IDÉNTICO' : 'NO ES DUPLICADO'}: ${sanitizedIngredient.name} será creado`);
    
    // Validate language completeness
    const languageCheck = validateLanguageCompleteness(sanitizedIngredient);
    if (!languageCheck.complete) {
      console.log(`⚠️ Ingrediente ${sanitizedIngredient.name} falta idiomas:`, languageCheck.missing);
    }
    
    // Get or create category
    const categoryId = await getOrCreateCategory(sanitizedIngredient.category);

    // Create ingredient
    const ingredientData = {
      name: sanitizedIngredient.name,
      name_en: sanitizedIngredient.name_en,
      name_la: sanitizedIngredient.name_la,
      name_fr: sanitizedIngredient.name_fr || null,
      name_it: sanitizedIngredient.name_it || null,
      name_pt: sanitizedIngredient.name_pt || null,
      name_zh: sanitizedIngredient.name_zh || null,
      description: sanitizedIngredient.description,
      category_id: categoryId,
      temporada: sanitizedIngredient.temporada,
      origen: sanitizedIngredient.origen,
      merma: sanitizedIngredient.merma,
      rendimiento: sanitizedIngredient.rendimiento,
      popularity: sanitizedIngredient.popularity
    };

    console.log('💾 === CREANDO INGREDIENTE EN BD ===');
    console.log('📋 Datos a insertar:', {
      name: ingredientData.name,
      name_en: ingredientData.name_en,
      category_id: categoryId
    });

    const { data: newIngredient, error: ingredientError } = await supabase
      .from('ingredients')
      .insert(ingredientData)
      .select('id, name, created_at')
      .single();

    if (ingredientError) {
      console.error('❌ Error creando ingrediente:', ingredientError);
      console.error('📋 Datos que causaron error:', ingredientData);
      throw ingredientError;
    }

    console.log('✅ Ingrediente creado exitosamente:', newIngredient.id, '- Name:', newIngredient.name);

    // Process pricing
    if (sanitizedIngredient.prices_by_country && Array.isArray(sanitizedIngredient.prices_by_country)) {
      await processMultiCountryPrices(newIngredient.id, sanitizedIngredient.prices_by_country);
    } else if (sanitizedIngredient.price_estimate) {
      await processLegacyPricing(newIngredient.id, sanitizedIngredient.price_estimate);
    }

    // Process related data
    await processNutritionalInfo(newIngredient.id, sanitizedIngredient.nutritional_info);
    await processUses(newIngredient.id, sanitizedIngredient.uses);
    await processRecipes(newIngredient.id, sanitizedIngredient.recipes);
    await processVarieties(newIngredient.id, sanitizedIngredient.varieties);

    successfullyCreated++;
    
    const savedIngredientData = {
      id: newIngredient.id,
      name: sanitizedIngredient.name,
      created_at: newIngredient.created_at
    };
    savedIngredientsData.push(savedIngredientData);
    
    results.push({
      id: newIngredient.id,
      name: sanitizedIngredient.name,
      category: sanitizedIngredient.category,
      languages_complete: languageCheck.complete,
      missing_languages: languageCheck.missing,
      success: true
    });
    
    console.log(`✅ INGREDIENTE COMPLETADO: ${sanitizedIngredient.name}`);
  }

  // Log the admin action
  try {
    await supabase.rpc('log_admin_action', {
      action_type: isManualMode ? 'save_ingredients_manual_ultra_permissive' : 'save_ingredients_automatic_strict',
      resource_type: 'ingredient',
      action_details: {
        total_processed: data.length,
        successfully_created: successfullyCreated,
        duplicates_skipped: duplicatesFound,
        user_email: userEmail,
        manual_mode: isManualMode,
        ultra_permissive: isManualMode,
        multi_country_pricing: true
      }
    });
  } catch (logError) {
    console.log('⚠️ Failed to log admin action:', logError);
  }

  console.log(`🎉 === RESUMEN DE PROCESAMIENTO ${isManualMode ? 'MODO MANUAL ULTRA-PERMISIVO' : 'MODO AUTOMÁTICO ESTRICTO'} ===`);
  console.log(`✅ Ingredientes creados exitosamente: ${successfullyCreated}`);
  console.log(`⚠️ Duplicados detectados y omitidos: ${duplicatesFound}`);
  console.log(`📊 Datos preparados para generación de imágenes: ${savedIngredientsData.length}`);
  console.log(`🌍 Precios procesados para múltiples países por ingrediente`);
  console.log(`🎯 Algoritmo utilizado: ${isManualMode ? 'ULTRA-PERMISIVO (solo idénticos)' : 'ESTRICTO (normalización avanzada)'}`);

  return {
    success: true,
    results: results,
    data: savedIngredientsData,
    summary: {
      total_processed: data.length,
      successfully_created: successfullyCreated,
      duplicates_skipped: duplicatesFound,
      multi_country_pricing_enabled: true,
      manual_mode: isManualMode,
      ultra_permissive_mode: isManualMode
    }
  };
}
