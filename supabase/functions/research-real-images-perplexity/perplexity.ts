
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
  const culinaryPrompt = `
  Find high-quality culinary images for the ingredient: ${ingredient.name} (${ingredient.name_en})
  
  SEARCH REQUIREMENTS:
  - Find 6-8 DIRECT IMAGE URLs from reliable culinary sources
  - Focus on food photography, cooking websites, and culinary databases
  - Look for images showing: raw ingredient, cooked preparations, cut/sliced forms, whole forms
  - Prioritize sources like: Wikipedia, food blogs, cooking websites, culinary databases
  - URLs MUST be direct links ending in: .jpg, .jpeg, .png, .webp, .gif
  - NO base64 strings, NO placeholder URLs, NO corrupted strings
  
  TRUSTED CULINARY DOMAINS TO SEARCH:
  - upload.wikimedia.org (Wikipedia food images)
  - commons.wikimedia.org 
  - images.unsplash.com (food photography)
  - www.seriouseats.com
  - www.foodnetwork.com
  - www.allrecipes.com
  - www.bonappetit.com
  - www.epicurious.com
  - cooking websites and food blogs
  
  INGREDIENT CONTEXT:
  ${ingredient.description}
  
  Please search the internet and provide a JSON response with this exact format:
  {
    "images": [
      {
        "url": "https://direct-image-url.jpg",
        "description": "Brief description of what's shown in the image",
        "category": "raw|cooked|cut|whole|variety",
        "source": "domain or source name"
      }
    ]
  }
  
  CRITICAL: Only return valid, working image URLs that you find through your internet search.
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
          content: 'You are a specialized culinary image researcher with internet access. You search for and find real, working image URLs from reliable culinary sources. You ONLY provide direct image URLs that actually exist and work. Always respond with valid JSON format.'
        },
        {
          role: 'user',
          content: culinaryPrompt
        }
      ],
      temperature: 0.1,
      top_p: 0.9,
      max_tokens: 2000,
      return_images: false,
      return_related_questions: false,
      search_domain_filter: [
        'upload.wikimedia.org',
        'commons.wikimedia.org',
        'images.unsplash.com',
        'seriouseats.com',
        'foodnetwork.com',
        'allrecipes.com',
        'bonappetit.com',
        'epicurious.com'
      ],
      search_recency_filter: 'year',
      frequency_penalty: 1,
      presence_penalty: 0
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status} - ${await response.text()}`);
  }

  const data: PerplexityResponse = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content received from Perplexity');
  }

  console.log('🔍 Perplexity Sonar raw response:', content.substring(0, 500));

  // Parse JSON response with enhanced error handling
  let imagesData: { images: ImageResult[] };
  try {
    // Clean the response to ensure it's valid JSON
    const cleanedContent = content.trim();
    
    // Try to parse directly first
    imagesData = JSON.parse(cleanedContent);
  } catch {
    // Try to extract JSON from response if it has extra text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        imagesData = JSON.parse(jsonMatch[0]);
      } catch {
        console.error('❌ Failed to parse extracted JSON from Perplexity response');
        throw new Error('Invalid JSON response from Perplexity');
      }
    } else {
      console.error('❌ No JSON found in Perplexity response');
      throw new Error('No valid JSON found in Perplexity response');
    }
  }

  const images = imagesData.images || [];
  
  // Enhanced pre-filtering for Perplexity results
  const validFormatImages = images.filter(img => {
    if (!img.url || typeof img.url !== 'string') return false;
    
    // Check if it's a proper URL format
    if (!img.url.startsWith('http://') && !img.url.startsWith('https://')) return false;
    
    // Check if it has a valid image extension
    const hasImageExtension = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some(ext => 
      img.url.toLowerCase().includes(ext)
    );
    
    // Reject obviously corrupted strings
    const isCorrupted = /^[A-Za-z0-9+/=]{20,}$/.test(img.url) || img.url.length < 15;
    
    // Additional validation for Perplexity sources
    const hasValidDomain = img.url.includes('.') && !img.url.includes(' ');
    
    return hasImageExtension && !isCorrupted && hasValidDomain;
  });

  console.log(`🔍 Perplexity filtered ${validFormatImages.length}/${images.length} images with valid URL format`);
  
  return validFormatImages;
}
