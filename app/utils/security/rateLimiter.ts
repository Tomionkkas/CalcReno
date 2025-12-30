/**
 * Client-side Rate Limiter
 *
 * Provides protection against brute force attacks and API abuse.
 * Uses a sliding window approach with configurable limits.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../logger';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitEntry {
  attempts: number[];
  blockedUntil: number | null;
}

// Rate limit configurations for different actions
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Authentication - strict limits
  'auth:login': {
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
    blockDurationMs: 15 * 60 * 1000, // 15 minutes block
  },
  'auth:signup': {
    maxAttempts: 3,
    windowMs: 10 * 60 * 1000, // 10 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block
  },
  'auth:password_reset': {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
  },
  'auth:resend_confirmation': {
    maxAttempts: 3,
    windowMs: 10 * 60 * 1000, // 10 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block
  },

  // API operations - moderate limits
  'api:project_create': {
    maxAttempts: 10,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000, // 5 minutes block
  },
  'api:room_create': {
    maxAttempts: 20,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000, // 5 minutes block
  },
  'api:export': {
    maxAttempts: 5,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000, // 5 minutes block
  },

  // Database operations
  'db:sync': {
    maxAttempts: 10,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 2 * 60 * 1000, // 2 minutes block
  },

  // General API calls
  'api:general': {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 60 * 1000, // 1 minute block
  },
};

// In-memory cache for faster access
const memoryCache: Map<string, RateLimitEntry> = new Map();

// Storage key prefix
const STORAGE_PREFIX = 'calcreno_rate_limit_';

class RateLimiter {
  private static instance: RateLimiter;

  private constructor() {}

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Get storage key for a rate limit action
   */
  private getStorageKey(action: string, identifier?: string): string {
    const baseKey = `${STORAGE_PREFIX}${action}`;
    return identifier ? `${baseKey}_${identifier}` : baseKey;
  }

  /**
   * Load rate limit entry from storage
   */
  private async loadEntry(key: string): Promise<RateLimitEntry> {
    // Check memory cache first
    const cached = memoryCache.get(key);
    if (cached) {
      return cached;
    }

    try {
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const entry = JSON.parse(stored) as RateLimitEntry;
        memoryCache.set(key, entry);
        return entry;
      }
    } catch (error) {
      logger.error('[RateLimiter] Error loading entry:', error);
    }

    return { attempts: [], blockedUntil: null };
  }

  /**
   * Save rate limit entry to storage
   */
  private async saveEntry(key: string, entry: RateLimitEntry): Promise<void> {
    memoryCache.set(key, entry);

    try {
      await AsyncStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      logger.error('[RateLimiter] Error saving entry:', error);
    }
  }

  /**
   * Clean up old attempts outside the window
   */
  private cleanOldAttempts(attempts: number[], windowMs: number): number[] {
    const cutoff = Date.now() - windowMs;
    return attempts.filter(timestamp => timestamp > cutoff);
  }

  /**
   * Check if an action is allowed and record the attempt
   * @param action - The action type (e.g., 'auth:login')
   * @param identifier - Optional identifier (e.g., email or IP)
   * @returns Object with allowed status and remaining info
   */
  async checkAndRecord(
    action: string,
    identifier?: string
  ): Promise<{
    allowed: boolean;
    remainingAttempts: number;
    retryAfterMs: number | null;
    message?: string;
  }> {
    const config = RATE_LIMIT_CONFIGS[action];
    if (!config) {
      // No rate limit configured for this action
      return { allowed: true, remainingAttempts: Infinity, retryAfterMs: null };
    }

    const key = this.getStorageKey(action, identifier);
    const entry = await this.loadEntry(key);
    const now = Date.now();

    // Check if blocked
    if (entry.blockedUntil && entry.blockedUntil > now) {
      const retryAfterMs = entry.blockedUntil - now;
      const retryMinutes = Math.ceil(retryAfterMs / 60000);

      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterMs,
        message: `Zbyt wiele prób. Spróbuj ponownie za ${retryMinutes} minut.`,
      };
    }

    // Clean old attempts
    entry.attempts = this.cleanOldAttempts(entry.attempts, config.windowMs);

    // Check if limit exceeded
    if (entry.attempts.length >= config.maxAttempts) {
      // Block the user
      entry.blockedUntil = now + config.blockDurationMs;
      entry.attempts = []; // Clear attempts after blocking
      await this.saveEntry(key, entry);

      const retryMinutes = Math.ceil(config.blockDurationMs / 60000);

      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterMs: config.blockDurationMs,
        message: `Zbyt wiele prób. Spróbuj ponownie za ${retryMinutes} minut.`,
      };
    }

    // Record this attempt
    entry.attempts.push(now);
    entry.blockedUntil = null;
    await this.saveEntry(key, entry);

    const remainingAttempts = config.maxAttempts - entry.attempts.length;

    return {
      allowed: true,
      remainingAttempts,
      retryAfterMs: null,
    };
  }

  /**
   * Check if an action is allowed without recording an attempt
   */
  async isAllowed(action: string, identifier?: string): Promise<boolean> {
    const config = RATE_LIMIT_CONFIGS[action];
    if (!config) {
      return true;
    }

    const key = this.getStorageKey(action, identifier);
    const entry = await this.loadEntry(key);
    const now = Date.now();

    // Check if blocked
    if (entry.blockedUntil && entry.blockedUntil > now) {
      return false;
    }

    // Clean and check attempts
    const cleanedAttempts = this.cleanOldAttempts(entry.attempts, config.windowMs);
    return cleanedAttempts.length < config.maxAttempts;
  }

  /**
   * Record a successful attempt (clears failed attempts)
   */
  async recordSuccess(action: string, identifier?: string): Promise<void> {
    const key = this.getStorageKey(action, identifier);
    const entry: RateLimitEntry = {
      attempts: [],
      blockedUntil: null,
    };
    await this.saveEntry(key, entry);
  }

  /**
   * Get remaining attempts for an action
   */
  async getRemainingAttempts(action: string, identifier?: string): Promise<number> {
    const config = RATE_LIMIT_CONFIGS[action];
    if (!config) {
      return Infinity;
    }

    const key = this.getStorageKey(action, identifier);
    const entry = await this.loadEntry(key);

    if (entry.blockedUntil && entry.blockedUntil > Date.now()) {
      return 0;
    }

    const cleanedAttempts = this.cleanOldAttempts(entry.attempts, config.windowMs);
    return Math.max(0, config.maxAttempts - cleanedAttempts.length);
  }

  /**
   * Clear all rate limit data (for logout/testing)
   */
  async clearAll(): Promise<void> {
    memoryCache.clear();

    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const rateLimitKeys = allKeys.filter(key => key.startsWith(STORAGE_PREFIX));
      if (rateLimitKeys.length > 0) {
        await AsyncStorage.multiRemove(rateLimitKeys);
      }
    } catch (error) {
      logger.error('[RateLimiter] Error clearing all:', error);
    }
  }

  /**
   * Clear rate limit for a specific action
   */
  async clear(action: string, identifier?: string): Promise<void> {
    const key = this.getStorageKey(action, identifier);
    memoryCache.delete(key);

    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.error('[RateLimiter] Error clearing:', error);
    }
  }
}

// Export singleton instance
export const rateLimiter = RateLimiter.getInstance();

/**
 * Higher-order function to wrap async functions with rate limiting
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  action: string,
  fn: T,
  getIdentifier?: (...args: Parameters<T>) => string
): (...args: Parameters<T>) => Promise<ReturnType<T> | { error: string; rateLimited: true }> {
  return async (...args: Parameters<T>) => {
    const identifier = getIdentifier ? getIdentifier(...args) : undefined;
    const result = await rateLimiter.checkAndRecord(action, identifier);

    if (!result.allowed) {
      return {
        error: result.message || 'Rate limit exceeded',
        rateLimited: true,
      };
    }

    try {
      const response = await fn(...args);
      // On success, clear rate limit
      if (response?.success !== false) {
        await rateLimiter.recordSuccess(action, identifier);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };
}
