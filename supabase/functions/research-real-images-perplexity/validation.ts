
export function isLikelyImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // Check basic URL format
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }
  
  // Check for basic domain structure
  if (!url.includes('.') || url.includes(' ')) {
    return false;
  }
  
  // Reject obviously corrupted strings (base64, too short, etc.)
  if (/^[A-Za-z0-9+/=]{20,}$/.test(url) || url.length < 15) {
    return false;
  }

  // ENHANCED: Auto-approve trusted image services (they always work)
  const trustedServices = [
    'images.unsplash.com',
    'unsplash.com',
    'images.pexels.com',
    'pexels.com',
    'cdn.pixabay.com',
    'pixabay.com'
  ];

  const isTrustedService = trustedServices.some(service => url.includes(service));
  
  if (isTrustedService) {
    console.log(`✅ TRUSTED SERVICE - Auto-approved: ${url.substring(0, 60)}...`);
    return true;
  }

  // Allow Wikipedia but will validate later
  const wikipediaServices = [
    'upload.wikimedia.org',
    'commons.wikimedia.org'
  ];

  const isWikipedia = wikipediaServices.some(service => url.includes(service));
  
  if (isWikipedia) {
    console.log(`🔍 WIKIPEDIA - Will validate: ${url.substring(0, 60)}...`);
    return true;
  }
  
  // ENHANCED: Reject URLs with problematic patterns
  const problematicPatterns = [
    '/thumb/', // Wikipedia thumbnails
    'profile', 'avatar', // Profile images
    'people', 'person', // Human subjects
    'cooking', 'recipe', 'kitchen' // Cooking contexts
  ];
  
  const hasProblematicPattern = problematicPatterns.some(pattern => 
    url.toLowerCase().includes(pattern)
  );
  
  if (hasProblematicPattern) {
    console.log(`❌ Problematic pattern detected: ${url.substring(0, 60)}...`);
    return false;
  }
  
  // For other domains, require explicit image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const hasImageExtension = imageExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  );
  
  if (!hasImageExtension) {
    console.log(`❌ No image extension found: ${url.substring(0, 60)}...`);
    return false;
  }
  
  return true;
}

export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    console.log(`🔍 Validating image URL: ${url.substring(0, 80)}...`);
    
    // ENHANCED: Smart validation by service with stricter timeouts
    const trustedServices = [
      'images.unsplash.com',
      'unsplash.com', 
      'images.pexels.com',
      'pexels.com',
      'cdn.pixabay.com',
      'pixabay.com'
    ];

    const isTrustedService = trustedServices.some(service => url.includes(service));
    
    if (isTrustedService) {
      console.log(`✅ TRUSTED SERVICE - Skipping HTTP validation: ${url.substring(0, 60)}...`);
      return true;
    }

    // For Wikipedia and other services, do quick HTTP validation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced timeout to 8s
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Connection': 'close', // Don't keep connection alive
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`❌ HTTP ${response.status} for: ${url.substring(0, 60)}...`);
      
      // For Wikipedia, be more forgiving with certain status codes
      const isWikipedia = url.includes('wikimedia.org');
      if (isWikipedia && (response.status === 404 || response.status === 403)) {
        console.log(`⚠️ Wikipedia ${response.status} - might be thumbnail issue, rejecting for safety`);
        return false; // More strict now
      }
      
      return false;
    }
    
    const contentType = response.headers.get('content-type');
    
    // ENHANCED: Stricter content-type validation
    if (contentType) {
      const isValidImage = contentType.startsWith('image/') || 
                          contentType.includes('image');
      
      if (!isValidImage) {
        console.log(`❌ Invalid content-type "${contentType}" for: ${url.substring(0, 60)}...`);
        return false;
      }
      
      console.log(`✅ Valid image confirmed: ${contentType}`);
    } else {
      console.log(`⚠️ No content-type header, proceeding with caution`);
    }
    
    return true;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`⏱️ Timeout validating: ${url.substring(0, 60)}...`);
    } else {
      console.log(`❌ Error validating ${url.substring(0, 60)}...: ${error.message}`);
    }
    
    return false; // Fail fast for problematic URLs
  }
}
