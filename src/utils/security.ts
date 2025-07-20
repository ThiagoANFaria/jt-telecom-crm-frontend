import DOMPurify from 'dompurify';

// Environment validation
export const validateEnvironment = () => {
  const requiredVars = ['VITE_API_BASE_URL'];
  const missing = requiredVars.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Secure HTML sanitization
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'li', 'ul', 'ol', 'br', 'hr'],
    ALLOWED_ATTR: ['class'],
    FORBID_ATTR: ['style', 'onclick', 'onload', 'onerror'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input']
  });
};

// Input validation
export const validateInput = (input: string, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input type');
  }
  
  if (input.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }
  
  // Remove potentially harmful characters
  return input.replace(/[<>\"'&]/g, '').trim();
};

// Token validation
export const isValidToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp && payload.exp > currentTime;
  } catch {
    return false;
  }
};

// Secure logging (remove sensitive data)
export const secureLog = (message: string, data?: any) => {
  if (import.meta.env.MODE === 'production') return;
  
  if (data) {
    const sanitizedData = { ...data };
    // Remove sensitive fields
    delete sanitizedData.password;
    delete sanitizedData.token;
    delete sanitizedData.access_token;
    delete sanitizedData.refresh_token;
    
    console.log(message, sanitizedData);
  } else {
    console.log(message);
  }
};