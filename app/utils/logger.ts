/**
 * Production-ready logging utility
 * Automatically disables debug logs in production builds
 */

const IS_DEV = __DEV__;

export const logger = {
  /**
   * Debug logging - only in development
   * Use for detailed debugging information
   */
  log: (...args: any[]) => {
    if (IS_DEV) console.log(...args);
  },

  /**
   * Warning logging - enabled in production
   * Use for non-critical issues that should be monitored
   */
  warn: (...args: any[]) => {
    console.warn(...args);
  },

  /**
   * Error logging - enabled in production
   * Use for errors that should be tracked and monitored
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Debug logging - only in development
   * Use for verbose debugging information
   */
  debug: (...args: any[]) => {
    if (IS_DEV) console.debug(...args);
  },

  /**
   * Info logging - only in development
   * Use for general information during development
   */
  info: (...args: any[]) => {
    if (IS_DEV) console.info(...args);
  },
};

