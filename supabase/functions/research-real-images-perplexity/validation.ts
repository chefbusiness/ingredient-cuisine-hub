
export function isLikelyImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // Check basic URL format
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }
  
  // Check for image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const hasImageExtension = imageExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  );
  
  if (!hasImageExtension) {
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
  
  return true;
}

export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    console.log(`🔍 Validating image URL: ${url.substring(0, 80)}...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageValidator/1.0)',
        'Accept': 'image/*',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`❌ HTTP ${response.status} for: ${url}`);
      return false;
    }
    
    const contentType = response.headers.get('content-type');
    const isValidImage = contentType && contentType.startsWith('image/');
    
    if (!isValidImage) {
      console.log(`❌ Invalid content-type "${contentType}" for: ${url}`);
      return false;
    }
    
    console.log(`✅ Valid image confirmed: ${contentType}`);
    return true;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`⏱️ Timeout validating: ${url}`);
    } else {
      console.log(`❌ Error validating ${url}: ${error.message}`);
    }
    return false;
  }
}
