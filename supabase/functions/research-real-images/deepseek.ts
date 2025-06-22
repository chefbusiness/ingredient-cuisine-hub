
interface ImageResult {
  url: string;
  description?: string;
  category?: string;
}

interface DeepSeekImageResponse {
  images: ImageResult[];
}

export async function searchImagesWithDeepSeek(
  ingredient: { name: string; name_en: string; description: string },
  apiKey: string
): Promise<ImageResult[]> {
  const researchPrompt = `
  Eres un experto en investigación de imágenes de ingredientes culinarios. 
  
  INGREDIENTE: ${ingredient.name} (${ingredient.name_en})
  DESCRIPCIÓN: ${ingredient.description}
  
  TAREA: Encuentra 4-6 URLs de imágenes REALES y de alta calidad de este ingrediente.
  
  CRITERIOS ESTRICTOS:
  - Solo URLs de imágenes REALES (no ilustraciones, no AI)
  - Alta resolución (mínimo 800x600)
  - Fondo preferiblemente neutral
  - Diferentes perspectivas: crudo, cocinado, cortado, entero
  - Fuentes confiables (sitios culinarios, bancos de imágenes)
  - URLs directas a archivos de imagen (.jpg, .png, .webp)
  
  FORMATO DE RESPUESTA (JSON):
  {
    "images": [
      {
        "url": "URL_DIRECTA_IMAGEN",
        "description": "descripción_breve",
        "category": "crudo|cocinado|cortado|entero|variedad"
      }
    ]
  }
  
  IMPORTANTE: Responde SOLO con el JSON válido, sin texto adicional.
  `;

  const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'Eres un investigador experto en imágenes de ingredientes culinarios. Responde solo con JSON válido.'
        },
        {
          role: 'user',
          content: researchPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    }),
  });

  if (!deepseekResponse.ok) {
    throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
  }

  const deepseekData = await deepseekResponse.json();
  const content = deepseekData.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content received from DeepSeek');
  }

  // Parse JSON response
  let imagesData: DeepSeekImageResponse;
  try {
    imagesData = JSON.parse(content);
  } catch {
    // Try to extract JSON from response if it has extra text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      imagesData = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid JSON response from DeepSeek');
    }
  }

  return imagesData.images || [];
}
