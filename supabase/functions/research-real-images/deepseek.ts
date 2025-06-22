
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
  You are an expert culinary ingredient image researcher. Your task is to find REAL, WORKING image URLs.

  INGREDIENT: ${ingredient.name} (${ingredient.name_en})
  DESCRIPTION: ${ingredient.description}

  CRITICAL REQUIREMENTS:
  - Find 4-6 DIRECT URLs to real images (NOT base64, NOT corrupted strings)
  - URLs MUST start with http:// or https://
  - URLs MUST end with image extensions: .jpg, .jpeg, .png, .webp, .gif
  - URLs MUST be from reliable sources (culinary sites, food databases, Wikipedia, etc.)
  - NO placeholder URLs, NO corrupted strings, NO invalid URLs
  - Test each URL mentally - it should be a complete, valid web address

  SEARCH STRATEGY:
  - Look for images on: Wikipedia, culinary websites, food databases, cooking blogs
  - Find different angles: raw ingredient, cooked, cut, whole, varieties
  - Ensure images are high quality and clearly show the ingredient

  RESPONSE FORMAT (JSON only, no extra text):
  {
    "images": [
      {
        "url": "https://example.com/path/to/real-image.jpg",
        "description": "Brief description of what's shown",
        "category": "raw|cooked|cut|whole|variety"
      }
    ]
  }

  EXAMPLES OF GOOD URLs:
  - https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/PerfectStrawberry.jpg/256px-PerfectStrawberry.jpg
  - https://images.unsplash.com/photo-1234567890/strawberries.jpg
  - https://www.example-food-site.com/images/ingredients/strawberry.png

  NEVER return corrupted strings like "5Z7X5Z..." or incomplete URLs.
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
          content: 'You are a professional culinary image researcher. You ONLY provide valid, working image URLs from reliable sources. Never return corrupted strings or invalid URLs. Respond ONLY with valid JSON.'
        },
        {
          role: 'user',
          content: researchPrompt
        }
      ],
      temperature: 0.1, // Lower temperature for more consistent results
      max_tokens: 1500
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

  console.log('🔍 DeepSeek raw response:', content);

  // Parse JSON response with better error handling
  let imagesData: DeepSeekImageResponse;
  try {
    // Clean the response to ensure it's valid JSON
    const cleanedContent = content.trim();
    
    // Try to parse directly first
    imagesData = JSON.parse(cleanedContent);
  } catch {
    // Try to extract JSON from response if it has extra text
    const cleanedContent = content.trim();
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        imagesData = JSON.parse(jsonMatch[0]);
      } catch {
        console.error('❌ Failed to parse extracted JSON from DeepSeek response');
        throw new Error('Invalid JSON response from DeepSeek');
      }
    } else {
      console.error('❌ No JSON found in DeepSeek response');
      throw new Error('No valid JSON found in DeepSeek response');
    }
  }

  const images = imagesData.images || [];
  
  // Pre-filter obviously invalid URLs
  const validFormatImages = images.filter(img => {
    if (!img.url || typeof img.url !== 'string') return false;
    
    // Check if it's a proper URL format
    if (!img.url.startsWith('http://') && !img.url.startsWith('https://')) return false;
    
    // Check if it has a valid image extension
    const hasImageExtension = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some(ext => 
      img.url.toLowerCase().includes(ext)
    );
    
    // Reject obviously corrupted strings (like base64 or random characters)
    const isCorrupted = /^[A-Za-z0-9+/=]{20,}$/.test(img.url) || img.url.length < 10;
    
    return hasImageExtension && !isCorrupted;
  });

  console.log(`🔍 Filtered ${validFormatImages.length}/${images.length} images with valid URL format`);
  
  return validFormatImages;
}
