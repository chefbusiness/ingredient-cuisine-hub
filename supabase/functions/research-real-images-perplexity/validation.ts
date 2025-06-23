
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

  // FASE 1: Auto-approve trusted image services (they always work)
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
    
    // FASE 3: Smart validation by service
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

    // For Wikipedia and other services, do HTTP validation but be more permissive
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout to 15s
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Referer': 'https://google.com',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`❌ HTTP ${response.status} for: ${url.substring(0, 60)}...`);
      
      // For Wikipedia, be more forgiving - sometimes thumbnails redirect
      const isWikipedia = url.includes('wikimedia.org');
      if (isWikipedia && (response.status === 404 || response.status === 403)) {
        console.log(`⚠️ Wikipedia ${response.status} - might be thumbnail issue, marking as valid anyway`);
        return true;
      }
      
      return false;
    }
    
    const contentType = response.headers.get('content-type');
    
    // More flexible content-type validation
    if (contentType) {
      const isValidImage = contentType.startsWith('image/') || 
                          contentType.includes('image') ||
                          contentType.startsWith('application/octet-stream') ||
                          contentType.startsWith('binary/octet-stream');
      
      if (!isValidImage) {
        console.log(`❌ Invalid content-type "${contentType}" for: ${url.substring(0, 60)}...`);
        return false;
      }
      
      console.log(`✅ Valid image confirmed: ${contentType}`);
    } else {
      // If no content-type header, be permissive for known services
      console.log(`✅ No content-type header but marking as valid`);
    }
    
    return true;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`⏱️ Timeout validating: ${url.substring(0, 60)}...`);
    } else {
      console.log(`❌ Error validating ${url.substring(0, 60)}...: ${error.message}`);
    }
    
    // For trusted services, even if validation fails, assume they work
    const trustedServices = ['unsplash.com', 'pexels.com', 'pixabay.com'];
    const isTrustedService = trustedServices.some(service => url.includes(service));
    
    if (isTrustedService) {
      console.log(`✅ Validation failed but trusting service anyway`);
      return true;
    }
    
    return false;
  }
}
