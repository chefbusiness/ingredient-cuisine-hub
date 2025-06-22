
// Input sanitization and validation utilities

export const sanitizeHtml = (input: string): string => {
  // Remove HTML tags and potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const sanitizeUrl = (url: string): string => {
  // Only allow http, https, and data URLs
  const allowedProtocols = /^(https?:\/\/|data:image\/)/i;
  
  if (!allowedProtocols.test(url)) {
    return '';
  }
  
  // Remove any script-related content
  return url.replace(/javascript:/gi, '').replace(/on\w+\s*=/gi, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

export const validateTextLength = (text: string, maxLength: number): boolean => {
  return typeof text === 'string' && text.length <= maxLength;
};

export const sanitizeSearchQuery = (query: string): string => {
  // Remove special characters that could be used for injection
  return query
    .replace(/[<>\"'%;()&+]/g, '')
    .trim()
    .slice(0, 100); // Limit search query length
};

export const rateLimit = {
  requests: new Map<string, { count: number; timestamp: number }>(),
  
  isAllowed(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier);
    
    if (!userRequests || now - userRequests.timestamp > windowMs) {
      this.requests.set(identifier, { count: 1, timestamp: now });
      return true;
    }
    
    if (userRequests.count >= maxRequests) {
      return false;
    }
    
    userRequests.count++;
    return true;
  },
  
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.requests.entries()) {
      if (now - value.timestamp > 60000) {
        this.requests.delete(key);
      }
    }
  }
};

// Cleanup rate limit data every 5 minutes
setInterval(() => rateLimit.cleanup(), 5 * 60 * 1000);
