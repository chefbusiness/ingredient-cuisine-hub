
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

  // Allow known image services even without explicit extensions
  const imageServices = [
    'images.unsplash.com',
    'unsplash.com',
    'upload.wikimedia.org',
    'commons.wikimedia.org',
    'cdn.pixabay.com',
    'images.pexels.com',
    'cdn.stockvault.net'
  ];

  const hasKnownImageService = imageServices.some(service => url.includes(service));
  
  if (hasKnownImageService) {
    console.log(`✅ Known image service detected: ${url.substring(0, 60)}...`);
    return true;
  }
  
  // Check for explicit image extensions for other domains
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
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased timeout
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageValidator/1.0)',
        'Accept': 'image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`❌ HTTP ${response.status} for: ${url.substring(0, 60)}...`);
      return false;
    }
    
    const contentType = response.headers.get('content-type');
    
    // More flexible content-type validation
    if (contentType) {
      const isValidImage = contentType.startsWith('image/') || 
                          contentType.includes('image') ||
                          contentType.startsWith('application/octet-stream'); // Some CDNs use this
      
      if (!isValidImage) {
        console.log(`❌ Invalid content-type "${contentType}" for: ${url.substring(0, 60)}...`);
        return false;
      }
      
      console.log(`✅ Valid image confirmed: ${contentType}`);
    } else {
      // If no content-type header, assume it's valid for known image services
      const knownServices = ['unsplash.com', 'wikimedia.org', 'pexels.com'];
      const isKnownService = knownServices.some(service => url.includes(service));
      
      if (isKnownService) {
        console.log(`✅ Known service without content-type header, assuming valid`);
      } else {
        console.log(`❌ No content-type header for unknown service: ${url.substring(0, 60)}...`);
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`⏱️ Timeout validating: ${url.substring(0, 60)}...`);
    } else {
      console.log(`❌ Error validating ${url.substring(0, 60)}...: ${error.message}`);
    }
    return false;
  }
}
