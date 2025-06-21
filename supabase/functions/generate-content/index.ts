
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, category, region = 'España', count = 1 } = await req.json();
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY no configurada');
    }

    let prompt = '';
    
    switch (type) {
      case 'ingredient':
        prompt = `Genera ${count} ingrediente(s) ${category ? `de la categoría ${category}` : ''} típico(s) de ${region}. 
        Para cada ingrediente, proporciona la siguiente información en formato JSON:
        {
          "name": "nombre en español",
          "name_en": "nombre en inglés",
          "name_la": "nombre en latín (opcional)",
          "description": "descripción detallada (150-200 palabras)",
          "temporada": "temporada principal (ej: primavera, verano, otoño, invierno, todo el año)",
          "origen": "región de origen",
          "merma": número entre 5-30 (porcentaje de merma típico),
          "rendimiento": número entre 70-95 (porcentaje de rendimiento),
          "popularity": número entre 1-100,
          "nutritional_info": {
            "calories": número,
            "protein": número,
            "carbs": número,
            "fat": número,
            "fiber": número,
            "vitamin_c": número
          },
          "uses": ["uso culinario 1", "uso culinario 2", "uso culinario 3"],
          "recipes": [
            {
              "name": "nombre de receta",
              "type": "tipo (entrante, principal, postre, etc)",
              "difficulty": "fácil/medio/difícil",
              "time": "tiempo estimado"
            }
          ],
          "varieties": ["variedad 1", "variedad 2"],
          "price_estimate": número (precio estimado por kg en euros)
        }
        
        Responde SOLO con un array JSON válido de ingredientes, sin texto adicional.`;
        break;
        
      case 'category':
        prompt = `Genera ${count} nueva(s) categoría(s) de ingredientes culinarios que no sean comunes. 
        Formato JSON:
        {
          "name": "nombre en español (singular, minúsculas)",
          "name_en": "nombre en inglés",
          "description": "descripción de la categoría"
        }
        
        Responde SOLO con un array JSON válido, sin texto adicional.`;
        break;
        
      case 'price_update':
        prompt = `Genera precios actualizados para ingredientes de ${category} en ${region} para el mes actual.
        Considera factores estacionales y de mercado. Formato JSON:
        {
          "ingredient_name": "nombre del ingrediente",
          "price": número (precio por kg en euros),
          "season_variation": "descripción de variación estacional"
        }
        
        Responde SOLO con un array JSON válido, sin texto adicional.`;
        break;
    }

    console.log('Enviando prompt a DeepSeek:', prompt);

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en ingredientes culinarios y gastronomía. Siempre respondes con JSON válido y preciso.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error de DeepSeek API: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log('Respuesta de DeepSeek:', generatedContent);

    // Parsear y validar JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (error) {
      console.error('Error parseando JSON:', error);
      throw new Error('Respuesta de DeepSeek no es JSON válido');
    }

    // Asegurar que sea un array
    if (!Array.isArray(parsedContent)) {
      parsedContent = [parsedContent];
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: parsedContent,
      type: type 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error en generate-content:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
