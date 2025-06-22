
// Enhanced image URL validation function with real HTTP testing
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    console.log(`🔍 Validating image URL: ${url}`);
    
    // Basic URL validation
    let urlObj: URL;
    try {
      urlObj = new URL(url);
    } catch {
      console.log(`❌ Invalid URL format: ${url}`);
      return false;
    }
    
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      console.log(`❌ Invalid protocol: ${urlObj.protocol}`);
      return false;
    }

    // Check for obvious corruption patterns
    if (/^[A-Za-z0-9+/=]{20,}$/.test(url)) {
      console.log(`❌ Detected base64/corrupted string: ${url}`);
      return false;
    }

    // Check if URL has image extension
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const hasImageExtension = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext.toLowerCase())
    );

    if (!hasImageExtension) {
      console.log(`❌ No image extension found in: ${url}`);
      return false;
    }

    // Real HTTP validation with strict timeout and proper headers
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(url, { 
        method: 'HEAD', // Use HEAD instead of GET for faster validation
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; IngredientBot/1.0)',
          'Accept': 'image/*,*/*;q=0.8'
        }
      });
      
      clearTimeout(timeoutId);
      
      // Check response status
      if (!response.ok) {
        console.log(`❌ HTTP error for ${url}: ${response.status} ${response.statusText}`);
        return false;
      }
      
      // Check content type
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.startsWith('image/')) {
        console.log(`❌ Invalid content-type for ${url}: ${contentType}`);
        return false;
      }

      // Check content length (reject if too small or too large)
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        const size = parseInt(contentLength);
        if (size < 1000 || size > 10000000) { // Between 1KB and 10MB
          console.log(`❌ Invalid file size for ${url}: ${size} bytes`);
          return false;
        }
      }
      
      console.log(`✅ Successfully validated image URL: ${url}`);
      return true;
      
    } catch (fetchError) {
      console.log(`❌ Network error validating ${url}: ${fetchError.message}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Error validating URL ${url}:`, error.message);
    return false;
  }
}

// Additional helper to check if URL is likely an image without HTTP request
export function isLikelyImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) return false;
    
    // Check for image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const hasImageExtension = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext.toLowerCase())
    );
    
    // Check for corruption patterns
    const isCorrupted = /^[A-Za-z0-9+/=]{20,}$/.test(url);
    
    return hasImageExtension && !isCorrupted;
  } catch {
    return false;
  }
}
