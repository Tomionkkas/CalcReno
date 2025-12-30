/**
 * Security Utilities
 *
 * Central export point for all security-related utilities.
 */

// Rate limiting
export {
  rateLimiter,
  withRateLimit,
  RATE_LIMIT_CONFIGS,
} from './rateLimiter';

// Validation schemas
export {
  // Auth schemas
  emailSchema,
  passwordSchema,
  loginPasswordSchema,
  nameSchema,
  loginFormSchema,
  signupFormSchema,
  // Project schemas
  projectStatusSchema,
  projectNameSchema,
  projectDescriptionSchema,
  createProjectSchema,
  // Room schemas
  roomShapeSchema,
  roomCornerSchema,
  roomDimensionSchema,
  roomDimensionsSchema,
  roomNameSchema,
  roomElementTypeSchema,
  roomElementSchema,
  createRoomSchema,
  // Other schemas
  materialInputSchema,
  searchQuerySchema,
  paginationSchema,
  // Helpers
  validateWithSchema,
  getFirstError,
  validateField,
} from './validation';

// Types from validation
export type {
  LoginFormData,
  SignupFormData,
  CreateProjectData,
  CreateRoomData,
  RoomElement,
  RoomDimensions,
  ProjectStatus,
  RoomShape,
} from './validation';

// Sanitization utilities
export {
  escapeHtml,
  stripHtml,
  stripScripts,
  sanitizeText,
  sanitizeForStorage,
  sanitizeFilename,
  sanitizeUrl,
  sanitizeJsonParse,
  sanitizeObject,
  sanitizeControlChars,
  truncate,
  normalizeWhitespace,
  sanitizeEmail,
  sanitizeNumericString,
  parseNumber,
  sanitizeId,
  containsSuspiciousPatterns,
} from './sanitize';
