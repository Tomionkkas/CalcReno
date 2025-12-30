/**
 * Input Sanitization Utilities
 *
 * Provides sanitization functions to prevent XSS, injection attacks,
 * and other security vulnerabilities.
 */

/**
 * HTML entities map for escaping
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(/[&<>"'`=/]/g, char => HTML_ENTITIES[char] || char);
}

/**
 * Remove HTML tags from a string
 */
export function stripHtml(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Remove script tags and event handlers
 */
export function stripScripts(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  // Remove script tags
  let result = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove event handlers
  result = result.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  result = result.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  // Remove javascript: URLs
  result = result.replace(/javascript:/gi, '');
  // Remove data: URLs (potential XSS vector)
  result = result.replace(/data:/gi, '');
  return result;
}

/**
 * Sanitize a string for safe display
 * Use this for text content that will be displayed to users
 */
export function sanitizeText(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  return stripHtml(str).trim();
}

/**
 * Sanitize a string for database storage
 * Removes potentially dangerous content while preserving readability
 */
export function sanitizeForStorage(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  return stripHtml(stripScripts(str)).trim();
}

/**
 * Sanitize a filename
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') {
    return '';
  }
  // Remove path traversal attempts
  let result = filename.replace(/\.\./g, '');
  // Remove special characters except dots, dashes, and underscores
  result = result.replace(/[^a-zA-Z0-9._-]/g, '_');
  // Remove leading dots and spaces
  result = result.replace(/^[.\s]+/, '');
  // Limit length
  result = result.substring(0, 255);
  return result || 'unnamed';
}

/**
 * Sanitize a URL
 */
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = trimmed.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return null;
    }
  }

  // Only allow http, https, and relative URLs
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    !trimmed.includes(':')
  ) {
    return trimmed;
  }

  return null;
}

/**
 * Sanitize JSON string to prevent prototype pollution
 */
export function sanitizeJsonParse<T>(jsonString: string, fallback: T): T {
  if (typeof jsonString !== 'string') {
    return fallback;
  }

  try {
    const parsed = JSON.parse(jsonString);

    // Prevent prototype pollution
    if (parsed && typeof parsed === 'object') {
      delete parsed.__proto__;
      delete parsed.constructor;
      delete parsed.prototype;
    }

    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * Sanitize an object's string properties recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item as any)) as unknown as T;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip prototype pollution keys
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    if (typeof value === 'string') {
      result[key] = sanitizeForStorage(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Remove null bytes and control characters
 */
export function sanitizeControlChars(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  // Remove null bytes and other control characters (except newlines and tabs)
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Truncate a string to a maximum length safely
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (typeof str !== 'string') {
    return '';
  }
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Normalize whitespace in a string
 */
export function normalizeWhitespace(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }
  return email.toLowerCase().trim().substring(0, 254);
}

/**
 * Sanitize a numeric string input
 */
export function sanitizeNumericString(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  // Allow only digits, decimal point, and minus sign
  return str.replace(/[^\d.-]/g, '');
}

/**
 * Parse and validate a numeric input
 */
export function parseNumber(
  value: string | number,
  fallback: number = 0,
  min?: number,
  max?: number
): number {
  let num: number;

  if (typeof value === 'number') {
    num = value;
  } else if (typeof value === 'string') {
    num = parseFloat(sanitizeNumericString(value));
  } else {
    return fallback;
  }

  if (isNaN(num) || !isFinite(num)) {
    return fallback;
  }

  if (min !== undefined && num < min) {
    return min;
  }

  if (max !== undefined && num > max) {
    return max;
  }

  return num;
}

/**
 * Sanitize and validate an ID string (UUID or numeric)
 */
export function sanitizeId(id: string): string | null {
  if (typeof id !== 'string') {
    return null;
  }

  const trimmed = id.trim();

  // UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  // Numeric ID
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Check if a string contains suspicious patterns
 */
export function containsSuspiciousPatterns(str: string): boolean {
  if (typeof str !== 'string') {
    return false;
  }

  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers
    /data:/i,
    /vbscript:/i,
    /expression\s*\(/i, // CSS expression
    /url\s*\(/i, // CSS url (potential XSS in older browsers)
    /import\s/i, // CSS import
    /@import/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(str));
}
