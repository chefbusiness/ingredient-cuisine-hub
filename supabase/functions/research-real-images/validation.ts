
// Enhanced progressive image URL validation with multiple fallback strategies
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    console.log(`🔍 Progressive validation for: ${url}`);
    
    // Step 1: Basic URL format validation
    if (!isValidUrlFormat(url)) {
      console.log(`❌ Failed basic format validation: ${url}`);
      return false;
    }

    // Step 2: Try HEAD request first (fastest)
    const headResult = await tryHeadRequest(url);
    if (headResult.success) {
      console.log(`✅ HEAD request successful: ${url}`);
      return true;
    }
    console.log(`⚠️ HEAD failed (${headResult.reason}), trying GET...`);

    // Step 3: Try partial GET request as fallback
    const getResult = await tryPartialGetRequest(url);
    if (getResult.success) {
      console.log(`✅ Partial GET successful: ${url}`);
      return true;
    }
    console.log(`⚠️ GET failed (${getResult.reason}), using format fallback...`);

    // Step 4: Fallback to format-based validation for known good patterns
    const formatResult = isKnownGoodPattern(url);
    if (formatResult) {
      console.log(`✅ Accepted via known pattern: ${url}`);
      return true;
    }

    console.log(`❌ All validation methods failed: ${url}`);
    return false;
    
  } catch (error) {
    console.log(`❌ Validation error for ${url}:`, error.message);
    return false;
  }
}

// Basic URL format validation
function isValidUrlFormat(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) return false;
    
    // Check for image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const hasImageExtension = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext.toLowerCase())
    );
    
    // Check for obvious corruption patterns
    if (/^[A-Za-z0-9+/=]{20,}$/.test(url)) return false;
    
    // Minimum length check
    if (url.length < 10) return false;
    
    return hasImageExtension;
  } catch {
    return false;
  }
}

// Try HEAD request with generous timeout and proper headers
async function tryHeadRequest(url: string): Promise<{success: boolean, reason?: string}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow', // Allow redirects
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      }
    });
    
    clearTimeout(timeoutId);
    
    // Accept broader range of status codes
    if (response.status >= 200 && response.status < 400) {
      // Check content type if available (but don't fail if missing)
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.startsWith('image/') && !contentType.includes('octet-stream')) {
        return { success: false, reason: `Invalid content-type: ${contentType}` };
      }
      
      return { success: true };
    }
    
    return { success: false, reason: `HTTP ${response.status}` };
    
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, reason: 'Timeout' };
    }
    return { success: false, reason: error.message };
  }
}

// Try partial GET request as fallback
async function tryPartialGetRequest(url: string): Promise<{success: boolean, reason?: string}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout
    
    const response = await fetch(url, { 
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Range': 'bytes=0-1023', // Only get first 1KB to check if it's an image
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8'
      }
    });
    
    clearTimeout(timeoutId);
    
    // Accept even more status codes for GET (including 206 for partial content)
    if (response.status >= 200 && response.status < 400) {
      // Check if we got some content
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) === 0) {
        return { success: false, reason: 'Empty response' };
      }
      
      return { success: true };
    }
    
    return { success: false, reason: `HTTP ${response.status}` };
    
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, reason: 'Timeout' };
    }
    return { success: false, reason: error.message };
  }
}

// Known good URL patterns that we trust even if HTTP validation fails
function isKnownGoodPattern(url: string): boolean {
  const trustedDomains = [
    'upload.wikimedia.org',
    'commons.wikimedia.org',
    'images.unsplash.com',
    'pixabay.com',
    'pexels.com',
    'foodnetwork.com',
    'allrecipes.com',
    'bonappetit.com',
    'epicurious.com',
    'seriouseats.com'
  ];
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    
    // Check if it's from a trusted domain
    const isTrustedDomain = trustedDomains.some(trusted => 
      domain === trusted || domain.endsWith('.' + trusted)
    );
    
    if (isTrustedDomain) {
      // Additional check: must have proper image extension
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      return imageExtensions.some(ext => url.toLowerCase().includes(ext));
    }
    
    return false;
  } catch {
    return false;
  }
}

// Quick format validation (used by DeepSeek filtering)
export function isLikelyImageUrl(url: string): boolean {
  return isValidUrlFormat(url);
}
