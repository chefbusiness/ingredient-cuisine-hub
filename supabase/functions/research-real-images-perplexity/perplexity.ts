
interface ImageResult {
  url: string;
  description?: string;
  category?: string;
  source?: string;
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function searchImagesWithPerplexity(
  ingredient: { name: string; name_en: string; description: string },
  apiKey: string
): Promise<ImageResult[]> {
  const simplifiedPrompt = `
  Busca imágenes culinarias DIRECTAS para: ${ingredient.name} (${ingredient.name_en})
  
  RESPONDE SOLO CON JSON VÁLIDO EN ESTE FORMATO EXACTO:
  {"images": [{"url": "https://ejemplo.com/imagen.jpg", "description": "descripción", "category": "raw", "source": "dominio"}]}
  
  REQUISITOS CRÍTICOS:
  - URLs DIRECTAS que terminen en .jpg, .jpeg, .png, .webp
  - Máximo 6 imágenes
  - Solo de sitios confiables: Wikipedia, Unsplash, sitios culinarios
  - NO uses markdown, NO uses bloques de código
  - SOLO devuelve el JSON sin texto adicional
  
  Categorías: raw, cooked, cut, whole, variety
  `;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        {
          role: 'system',
          content: 'Eres un investigador de imágenes culinarias. SIEMPRE responde con JSON válido sin markdown ni texto adicional. Encuentra URLs directas de imágenes que funcionen.'
        },
        {
          role: 'user',
          content: simplifiedPrompt
        }
      ],
      temperature: 0.1,
      top_p: 0.9,
      max_tokens: 1500,
      return_images: false,
      return_related_questions: false,
      search_domain_filter: [
        'upload.wikimedia.org',
        'commons.wikimedia.org',
        'images.unsplash.com',
        'seriouseats.com',
        'foodnetwork.com'
      ],
      search_recency_filter: 'year',
      frequency_penalty: 1,
      presence_penalty: 0
    }),
  });

  if (!response.ok) {
    console.error(`❌ Perplexity API error: ${response.status}`);
    throw new Error(`Perplexity API error: ${response.status} - ${await response.text()}`);
  }

  const data: PerplexityResponse = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    console.error('❌ No content received from Perplexity');
    throw new Error('No content received from Perplexity');
  }

  console.log('🔍 Perplexity raw response:', content.substring(0, 300));

  // Improved JSON parsing with multiple fallback strategies
  let imagesData: { images: ImageResult[] };
  
  try {
    // Strategy 1: Try direct JSON parse
    imagesData = JSON.parse(content.trim());
    console.log('✅ Direct JSON parse successful');
  } catch (firstError) {
    console.log('❌ Direct parse failed, trying markdown extraction...');
    
    try {
      // Strategy 2: Extract from markdown code blocks
      const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonBlockMatch) {
        const cleanJson = jsonBlockMatch[1].trim();
        imagesData = JSON.parse(cleanJson);
        console.log('✅ Markdown extraction successful');
      } else {
        throw new Error('No JSON block found');
      }
    } catch (secondError) {
      console.log('❌ Markdown extraction failed, trying object extraction...');
      
      try {
        // Strategy 3: Extract JSON object from anywhere in the text
        const objectMatch = content.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          const cleanJson = objectMatch[0];
          imagesData = JSON.parse(cleanJson);
          console.log('✅ Object extraction successful');
        } else {
          throw new Error('No JSON object found');
        }
      } catch (thirdError) {
        console.error('❌ All parsing strategies failed');
        console.error('Response content:', content);
        throw new Error('Unable to parse JSON from Perplexity response after trying multiple strategies');
      }
    }
  }

  const images = imagesData.images || [];
  console.log(`🔍 Extracted ${images.length} images from response`);
  
  // Enhanced validation
  const validImages = images.filter(img => {
    if (!img.url || typeof img.url !== 'string') {
      console.log('❌ Invalid URL:', img);
      return false;
    }
    
    // Check URL format
    if (!img.url.startsWith('http://') && !img.url.startsWith('https://')) {
      console.log('❌ Invalid protocol:', img.url);
      return false;
    }
    
    // Check image extension
    const hasImageExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some(ext => 
      img.url.toLowerCase().includes(ext)
    );
    
    if (!hasImageExt) {
      console.log('❌ No image extension:', img.url);
      return false;
    }
    
    // Check for valid domain
    if (!img.url.includes('.') || img.url.includes(' ')) {
      console.log('❌ Invalid domain format:', img.url);
      return false;
    }
    
    return true;
  });

  console.log(`✅ Final validation: ${validImages.length}/${images.length} valid images`);
  
  return validImages;
}
