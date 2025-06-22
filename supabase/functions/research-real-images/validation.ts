
// Improved image URL validation function
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    console.log(`🔍 Validating image URL: ${url}`);
    
    // Basic URL validation
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      console.log(`❌ Invalid protocol: ${urlObj.protocol}`);
      return false;
    }

    // Check if URL ends with common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const hasImageExtension = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext.toLowerCase())
    );

    // Try HTTP validation with relaxed settings
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, { 
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow', // Follow redirects
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ImageBot/1.0)',
          'Accept': 'image/*,*/*;q=0.8',
          'Range': 'bytes=0-1023' // Only download first 1KB for validation
        }
      });
      
      clearTimeout(timeoutId);
      
      const contentType = response.headers.get('content-type');
      const isValidResponse = response.ok || response.status === 206; // Accept partial content
      
      if (isValidResponse && contentType && contentType.startsWith('image/')) {
        console.log(`✅ Valid image URL (HTTP): ${url} - Content-Type: ${contentType}`);
        return true;
      }
      
      // If content-type validation fails but has image extension, still allow it
      if (isValidResponse && hasImageExtension) {
        console.log(`✅ Valid image URL (extension): ${url}`);
        return true;
      }
      
      console.log(`⚠️ HTTP validation inconclusive for: ${url} - Status: ${response.status}, Content-Type: ${contentType}`);
      
    } catch (fetchError) {
      console.log(`⚠️ HTTP validation failed for: ${url} - ${fetchError.message}`);
    }

    // Fallback: if HTTP validation fails but URL has image extension, allow it
    if (hasImageExtension) {
      console.log(`✅ Valid image URL (extension fallback): ${url}`);
      return true;
    }

    // Final fallback: check if URL contains image-related keywords
    const imageKeywords = ['image', 'img', 'photo', 'picture', 'pic'];
    const hasImageKeyword = imageKeywords.some(keyword => 
      url.toLowerCase().includes(keyword)
    );
    
    if (hasImageKeyword) {
      console.log(`✅ Valid image URL (keyword fallback): ${url}`);
      return true;
    }
    
    console.log(`❌ Could not validate image URL: ${url}`);
    return false;
    
  } catch (error) {
    console.log(`❌ Error validating URL ${url}:`, error.message);
    return false;
  }
}
