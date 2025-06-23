
import { PerplexityClient } from './perplexity-client.ts';
import { generatePrompt } from './prompts.ts';

export function validateApiKey(apiKey: string | undefined): void {
  if (!apiKey) {
    throw new Error('API key is required but not provided in environment variables');
  }
  
  if (apiKey.length < 10) {
    throw new Error('API key appears to be invalid (too short)');
  }
}

export async function fetchWithTimeout(
  url: string, 
  options: RequestInit, 
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

export async function generateIngredientData(
  count: number, 
  category?: string, 
  additionalPrompt?: string
): Promise<any[]> {
  console.log('🌐 === GENERACIÓN DE INGREDIENTES CON PERPLEXITY ===');
  console.log('📊 Parámetros:', { count, category, additionalPrompt });
  
  const perplexityClient = new PerplexityClient();
  
  // Get existing ingredients to avoid duplicates
  console.log('🔍 Obteniendo ingredientes existentes para evitar duplicados...');
  
  // Since we can't import supabase client here, we'll fetch it differently
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  let existingIngredients = [];
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/ingredients?select=name,name_en,categories(name)`, {
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      existingIngredients = await response.json();
      console.log('📋 Ingredientes existentes obtenidos:', existingIngredients.length);
    }
  } catch (error) {
    console.log('⚠️ No se pudieron obtener ingredientes existentes:', error);
  }
  
  const params = {
    type: 'ingredient' as const,
    count,
    category,
    region: 'España'
  };
  
  const prompt = generatePrompt(params, existingIngredients);
  console.log('📝 Prompt generado para Perplexity (primeros 500 chars):', prompt.substring(0, 500));
  
  try {
    const result = await perplexityClient.generateIngredientData(prompt);
    console.log('✅ Datos generados exitosamente con Perplexity:', result.length, 'ingredientes');
    
    // Log quality metrics
    const hasRealPrices = result.filter(item => item.price_estimate && item.price_estimate > 0).length;
    const hasSources = result.filter(item => item.sources_consulted && item.sources_consulted.length > 0).length;
    const hasConfidence = result.filter(item => item.data_confidence).length;
    
    console.log('📊 Métricas de calidad:');
    console.log(`  - Precios reales: ${hasRealPrices}/${result.length}`);
    console.log(`  - Con fuentes: ${hasSources}/${result.length}`);
    console.log(`  - Con confianza: ${hasConfidence}/${result.length}`);
    
    return result;
  } catch (error) {
    console.error('❌ Error generando datos con Perplexity:', error);
    throw error;
  }
}

export function cleanJsonFromMarkdown(content: string): string {
  // Remove markdown code blocks
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
  const match = content.match(codeBlockRegex);
  
  if (match) {
    return match[0].replace(/```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
  }
  
  return content.trim();
}
