/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize string input to prevent XSS attacks
 */
export const sanitizeString = (input: string): string => {
  if (!input) return '';

  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim();
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (10 digits)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ''));
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
};

/**
 * Validate required fields
 */
export const validateRequired = (fields: Record<string, any>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`${key} is required`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Rate limiting helper (client-side basic check)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
};

/**
 * Escape HTML to prevent XSS
 */
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Validate file upload
 */
export const validateFileUpload = (
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): { isValid: boolean; error?: string } => {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'] } = options;

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSize / 1024 / 1024}MB`
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type must be one of: ${allowedTypes.join(', ')}`
    };
  }

  return { isValid: true };
};

/**
 * Generate secure random ID
 */
export const generateSecureId = (prefix: string = '', length: number = 8): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Validate SQL injection attempts in strings
 */
export const containsSqlInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /(--|\*|;|'|"|\\)/g,
    /(\bOR\b.*=.*)/gi,
    /(\bAND\b.*=.*)/gi
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * Sanitize input for database operations
 */
export const sanitizeForDatabase = (input: string): string => {
  if (containsSqlInjection(input)) {
    throw new Error('Invalid input detected');
  }
  return sanitizeString(input);
};
