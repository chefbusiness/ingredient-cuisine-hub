
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
  // FASE 2: Improved Perplexity prompt for better URLs
  const enhancedPrompt = `
  Busca imágenes DIRECTAS y FUNCIONALES para: ${ingredient.name} (${ingredient.name_en})
  
  INSTRUCCIONES CRÍTICAS PARA URLs:
  1. SOLO URLs que terminen en .jpg, .jpeg, .png, .webp, .gif
  2. PRIORIZA estos sitios 100% confiables:
     - images.unsplash.com (URLs directos sin parámetros complejos)
     - images.pexels.com (URLs directos)
     - cdn.pixabay.com (URLs directos)
  3. Para Wikipedia: usar URLs directos sin "thumb/" en la ruta
  4. EVITA URLs con "/thumb/" o parámetros complejos que fallan
  5. Máximo 6 imágenes de alta calidad
  
  RESPONDE SOLO CON JSON VÁLIDO:
  {"images": [{"url": "https://images.unsplash.com/photo-123456789.jpg", "description": "descripción clara", "category": "raw", "source": "unsplash"}]}
  
  Categorías: raw, cooked, cut, whole, variety
  Fuentes preferidas: unsplash, pexels, pixabay, wikimedia
  
  NO uses markdown, NO uses bloques de código, SOLO el JSON.
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
          content: 'Eres un especialista en encontrar imágenes culinarias FUNCIONALES. SIEMPRE responde SOLO con JSON válido sin texto adicional. Encuentra URLs DIRECTOS que terminen en .jpg/.png/.webp y que funcionen sin redirecciones. PRIORIZA Unsplash, Pexels y Pixabay.'
        },
        {
          role: 'user',
          content: enhancedPrompt
        }
      ],
      temperature: 0.1,
      top_p: 0.9,
      max_tokens: 1200,
      return_images: false,
      return_related_questions: false,
      search_domain_filter: [
        'images.unsplash.com',
        'unsplash.com',
        'images.pexels.com',
        'pexels.com',
        'cdn.pixabay.com',
        'pixabay.com',
        'upload.wikimedia.org',
        'commons.wikimedia.org'
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

  console.log('🔍 Perplexity raw response:', content.substring(0, 400));

  // Enhanced JSON parsing with multiple strategies
  let imagesData: { images: ImageResult[] };
  
  try {
    // Strategy 1: Direct JSON parse
    imagesData = JSON.parse(content.trim());
    console.log('✅ Direct JSON parse successful');
  } catch (firstError) {
    console.log('❌ Direct parse failed, trying cleanup strategies...');
    
    try {
      // Strategy 2: Clean up common JSON issues
      let cleanContent = content.trim();
      
      // Remove markdown code blocks
      cleanContent = cleanContent.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1');
      
      // Remove any leading/trailing text that's not JSON
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }
      
      // Fix common JSON issues
      cleanContent = cleanContent.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
      
      imagesData = JSON.parse(cleanContent);
      console.log('✅ Cleanup strategy successful');
      
    } catch (secondError) {
      console.error('❌ All parsing strategies failed');
      console.error('Response content:', content);
      throw new Error('Unable to parse JSON from Perplexity response');
    }
  }

  const images = imagesData.images || [];
  console.log(`🔍 Extracted ${images.length} images from response`);
  
  // Enhanced validation and filtering with priority sorting
  const validImages = images.filter(img => {
    if (!img.url || typeof img.url !== 'string') {
      console.log('❌ Invalid URL structure:', img);
      return false;
    }
    
    // Basic URL validation
    if (!img.url.startsWith('http://') && !img.url.startsWith('https://')) {
      console.log('❌ Invalid protocol:', img.url);
      return false;
    }
    
    // Check for valid domain structure
    if (!img.url.includes('.') || img.url.includes(' ')) {
      console.log('❌ Invalid URL format:', img.url);
      return false;
    }
    
    // Check for reasonable URL length
    if (img.url.length < 20 || img.url.length > 800) {
      console.log('❌ URL length suspicious:', img.url.length, img.url.substring(0, 50));
      return false;
    }
    
    return true;
  });

  // Sort by reliability - trusted services first
  const sortedImages = validImages.sort((a, b) => {
    const trustedServices = ['images.unsplash.com', 'unsplash.com', 'images.pexels.com', 'pexels.com'];
    const aIsTrusted = trustedServices.some(service => a.url.includes(service));
    const bIsTrusted = trustedServices.some(service => b.url.includes(service));
    
    if (aIsTrusted && !bIsTrusted) return -1;
    if (!aIsTrusted && bIsTrusted) return 1;
    return 0;
  });

  console.log(`✅ Format validation: ${sortedImages.length}/${images.length} valid images (sorted by reliability)`);
  
  return sortedImages;
}
