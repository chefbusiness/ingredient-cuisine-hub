
// Enhanced progressive image URL validation optimized for Perplexity results
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    console.log(`🔍 Validating Perplexity image: ${url}`);
    
    // Step 1: Enhanced URL format validation for Perplexity sources
    if (!isValidUrlFormat(url)) {
      console.log(`❌ Failed format validation: ${url}`);
      return false;
    }

    // Step 2: Trust Perplexity's domain filtering first
    const isTrustedPerplexitySource = isPerplexityTrustedSource(url);
    if (isTrustedPerplexitySource) {
      console.log(`✅ Trusted Perplexity source: ${url}`);
      // Still do a quick HEAD request for trusted sources
      const quickCheck = await tryQuickHeadRequest(url);
      return quickCheck.success;
    }

    // Step 3: Full validation for other sources
    const headResult = await tryHeadRequest(url);
    if (headResult.success) {
      console.log(`✅ HEAD request successful: ${url}`);
      return true;
    }

    // Step 4: GET fallback
    const getResult = await tryPartialGetRequest(url);
    if (getResult.success) {
      console.log(`✅ Partial GET successful: ${url}`);
      return true;
    }

    console.log(`❌ All validation methods failed: ${url}`);
    return false;
    
  } catch (error) {
    console.log(`❌ Validation error for ${url}:`, error.message);
    return false;
  }
}

// Enhanced format validation for Perplexity results
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
    
    // Enhanced corruption detection
    if (/^[A-Za-z0-9+/=]{30,}$/.test(url)) return false;
    if (url.length < 15) return false;
    
    // Must have proper domain structure
    if (!urlObj.hostname.includes('.')) return false;
    
    return hasImageExtension;
  } catch {
    return false;
  }
}

// Check if URL is from Perplexity's trusted culinary sources
function isPerplexityTrustedSource(url: string): boolean {
  const trustedCulinaryDomains = [
    'upload.wikimedia.org',
    'commons.wikimedia.org',
    'images.unsplash.com',
    'seriouseats.com',
    'foodnetwork.com',
    'allrecipes.com',
    'bonappetit.com',
    'epicurious.com',
    'food.com',
    'tasteofhome.com',
    'simplyrecipes.com'
  ];
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    
    return trustedCulinaryDomains.some(trusted => 
      domain === trusted || domain.endsWith('.' + trusted)
    );
  } catch {
    return false;
  }
}

// Quick HEAD request for trusted sources
async function tryQuickHeadRequest(url: string): Promise<{success: boolean, reason?: string}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Shorter timeout for trusted sources
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PerplexityBot/1.0)',
        'Accept': 'image/*,*/*;q=0.8'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.status >= 200 && response.status < 400) {
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

// Standard HEAD request with extended timeout
async function tryHeadRequest(url: string): Promise<{success: boolean, reason?: string}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.status >= 200 && response.status < 400) {
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

// Partial GET request as final fallback
async function tryPartialGetRequest(url: string): Promise<{success: boolean, reason?: string}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, { 
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PerplexityBot/1.0)',
        'Accept': 'image/*,*/*;q=0.8',
        'Range': 'bytes=0-2047' // Get first 2KB
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.status >= 200 && response.status < 400) {
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

// Quick format validation for pre-filtering
export function isLikelyImageUrl(url: string): boolean {
  return isValidUrlFormat(url);
}
