
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

import { GenerateContentParams } from './types.ts';
import { corsHeaders } from './utils.ts';
import { generatePrompt } from './prompts.ts';
import { DeepSeekClient } from './deepseek-client.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const params: GenerateContentParams = await req.json();
    
    console.log('=== INICIO DE REQUEST ===');
    console.log('Parámetros recibidos:', params);
    
    // Obtener ingredientes existentes para evitar duplicados
    let existingIngredients: any[] = [];
    if (params.type === 'ingredient') {
      console.log('🔍 Obteniendo ingredientes existentes...');
      const { data: ingredients, error } = await supabase
        .from('ingredients')
        .select('name, name_en, name_fr, name_it, name_pt, name_zh, category_id, categories!inner(name)')
        .order('name');
      
      if (error) {
        console.error('❌ Error obteniendo ingredientes existentes:', error);
      } else {
        existingIngredients = ingredients || [];
        console.log(`✅ Encontrados ${existingIngredients.length} ingredientes existentes`);
      }
    }
    
    const prompt = generatePrompt(params, existingIngredients);
    console.log('Prompt generado, longitud:', prompt.length);
    console.log('Primeros 200 caracteres del prompt:', prompt.substring(0, 200) + '...');

    const deepSeekClient = new DeepSeekClient();
    const parsedContent = await deepSeekClient.generateContent(prompt);

    console.log('=== RESPUESTA EXITOSA ===');
    console.log('Número de elementos generados:', parsedContent.length);

    return new Response(JSON.stringify({ 
      success: true, 
      data: parsedContent,
      type: params.type 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== ERROR GENERAL ===');
    console.error('Tipo de error:', error.constructor.name);
    console.error('Mensaje:', error.message);
    console.error('Stack trace:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      errorType: error.constructor.name
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
