/**
 * Input Validation Schemas using Zod
 *
 * Provides type-safe validation for all user inputs.
 * Includes sanitization and custom error messages.
 */

import { z } from 'zod';

// ============================================================================
// Common Validators
// ============================================================================

/**
 * Safe string that strips HTML/script tags and trims whitespace
 */
const safeString = z
  .string()
  .transform(val => val.trim())
  .transform(val => val.replace(/<[^>]*>/g, '')) // Strip HTML tags
  .transform(val => val.replace(/[<>'"&]/g, '')); // Remove dangerous chars

/**
 * UUID validator
 */
const uuid = z.string().uuid({ message: 'Nieprawidłowy format identyfikatora' });

/**
 * Date string in YYYY-MM-DD format
 */
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data musi być w formacie YYYY-MM-DD' })
  .refine(
    val => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    { message: 'Nieprawidłowa data' }
  );

/**
 * Positive number with bounds
 */
const positiveNumber = (min: number, max: number, fieldName: string) =>
  z
    .number()
    .min(min, { message: `${fieldName} musi być minimum ${min}` })
    .max(max, { message: `${fieldName} może być maksymalnie ${max}` });

// ============================================================================
// Authentication Validators
// ============================================================================

// Common password patterns to block
const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', 'master', 'dragon', 'letmein', 'login',
  'admin', 'welcome', 'passw0rd', 'password1', 'p@ssword',
];

/**
 * Email validation schema
 */
export const emailSchema = z
  .string({ required_error: 'Email jest wymagany' })
  .min(1, { message: 'Email jest wymagany' })
  .max(254, { message: 'Email jest zbyt długi' })
  .email({ message: 'Nieprawidłowy format adresu email' })
  .transform(val => val.toLowerCase().trim())
  .refine(
    val => {
      // Additional validation: must have a valid TLD
      const parts = val.split('@');
      if (parts.length !== 2) return false;
      const domain = parts[1];
      return domain.includes('.') && domain.split('.').pop()!.length >= 2;
    },
    { message: 'Nieprawidłowy format adresu email' }
  );

/**
 * Password validation schema for registration
 */
export const passwordSchema = z
  .string({ required_error: 'Hasło jest wymagane' })
  .min(8, { message: 'Hasło musi mieć minimum 8 znaków' })
  .max(128, { message: 'Hasło jest zbyt długie' })
  .refine(val => /[A-Z]/.test(val), {
    message: 'Hasło musi zawierać przynajmniej jedną wielką literę',
  })
  .refine(val => /[a-z]/.test(val), {
    message: 'Hasło musi zawierać przynajmniej jedną małą literę',
  })
  .refine(val => /[0-9]/.test(val), {
    message: 'Hasło musi zawierać przynajmniej jedną cyfrę',
  })
  .refine(val => !COMMON_PASSWORDS.includes(val.toLowerCase()), {
    message: 'To hasło jest zbyt powszechne. Wybierz bardziej unikalne hasło.',
  });

/**
 * Password validation schema for login (less strict - just check presence)
 */
export const loginPasswordSchema = z
  .string({ required_error: 'Hasło jest wymagane' })
  .min(1, { message: 'Hasło jest wymagane' })
  .max(128, { message: 'Hasło jest zbyt długie' });

/**
 * Name validation schema
 */
export const nameSchema = z
  .string({ required_error: 'To pole jest wymagane' })
  .min(2, { message: 'Minimum 2 znaki' })
  .max(50, { message: 'Maksymalnie 50 znaków' })
  .transform(val => val.trim())
  .transform(val => val.replace(/<[^>]*>/g, ''))
  .refine(val => /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s'-]+$/.test(val), {
    message: 'Imię może zawierać tylko litery, spacje, myślniki i apostrofy',
  });

/**
 * Login form schema
 */
export const loginFormSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

/**
 * Registration form schema
 */
export const signupFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
});

// ============================================================================
// Project Validators
// ============================================================================

/**
 * Project status enum
 */
export const projectStatusSchema = z.enum(
  ['W trakcie', 'Planowany', 'Zakończony', 'Wstrzymany'],
  { errorMap: () => ({ message: 'Nieprawidłowy status projektu' }) }
);

/**
 * Project name validation
 */
export const projectNameSchema = safeString
  .pipe(z.string().min(1, { message: 'Nazwa projektu jest wymagana' }))
  .pipe(z.string().max(50, { message: 'Nazwa projektu może mieć maksymalnie 50 znaków' }))
  .refine(val => val.length >= 2, {
    message: 'Nazwa projektu musi mieć minimum 2 znaki',
  });

/**
 * Project description validation
 */
export const projectDescriptionSchema = safeString
  .pipe(z.string().max(500, { message: 'Opis projektu może mieć maksymalnie 500 znaków' }))
  .optional()
  .default('');

/**
 * Project creation form schema
 */
export const createProjectSchema = z
  .object({
    name: projectNameSchema,
    description: projectDescriptionSchema,
    status: projectStatusSchema,
    startDate: dateString,
    endDate: dateString,
  })
  .refine(
    data => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    },
    {
      message: 'Data zakończenia musi być późniejsza niż data rozpoczęcia',
      path: ['endDate'],
    }
  );

// ============================================================================
// Room Validators
// ============================================================================

/**
 * Room shape enum
 */
export const roomShapeSchema = z.enum(['rectangle', 'l-shape'], {
  errorMap: () => ({ message: 'Nieprawidłowy kształt pomieszczenia' }),
});

/**
 * Room corner orientation for L-shape
 */
export const roomCornerSchema = z.enum(
  ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
  { errorMap: () => ({ message: 'Nieprawidłowa orientacja narożnika' }) }
);

/**
 * Room dimension validation (in meters)
 */
export const roomDimensionSchema = positiveNumber(0.1, 100, 'Wymiar');

/**
 * Room dimensions schema
 */
export const roomDimensionsSchema = z
  .object({
    width: roomDimensionSchema,
    length: roomDimensionSchema,
    height: positiveNumber(1, 10, 'Wysokość'),
    width2: roomDimensionSchema.optional(),
    length2: roomDimensionSchema.optional(),
  })
  .refine(
    data => {
      // For L-shape rooms, width2 and length2 are required
      // This is handled separately in room validation
      return true;
    },
    { message: 'Nieprawidłowe wymiary' }
  );

/**
 * Room name validation
 */
export const roomNameSchema = safeString
  .pipe(z.string().min(1, { message: 'Nazwa pomieszczenia jest wymagana' }))
  .pipe(z.string().max(50, { message: 'Nazwa może mieć maksymalnie 50 znaków' }));

/**
 * Room element type
 */
export const roomElementTypeSchema = z.enum(['door', 'window'], {
  errorMap: () => ({ message: 'Nieprawidłowy typ elementu' }),
});

/**
 * Room element schema
 */
export const roomElementSchema = z.object({
  id: uuid,
  type: roomElementTypeSchema,
  width: positiveNumber(0.1, 10, 'Szerokość'),
  height: positiveNumber(0.1, 5, 'Wysokość'),
  position: z.number().min(0).max(100),
  wall: z.number().int().min(1).max(6),
});

/**
 * Create room schema
 */
export const createRoomSchema = z
  .object({
    name: roomNameSchema,
    shape: roomShapeSchema,
    dimensions: roomDimensionsSchema,
    corner: roomCornerSchema.optional(),
    elements: z.array(roomElementSchema).max(50, { message: 'Maksymalnie 50 elementów' }).optional(),
  })
  .refine(
    data => {
      if (data.shape === 'l-shape') {
        return (
          data.dimensions.width2 !== undefined &&
          data.dimensions.length2 !== undefined &&
          data.corner !== undefined
        );
      }
      return true;
    },
    {
      message: 'Pomieszczenie w kształcie L wymaga dodatkowych wymiarów i orientacji narożnika',
      path: ['shape'],
    }
  );

// ============================================================================
// Material Validators
// ============================================================================

/**
 * Material calculation input schema
 */
export const materialInputSchema = z.object({
  floorArea: positiveNumber(0.01, 10000, 'Powierzchnia podłogi'),
  wallArea: positiveNumber(0.01, 10000, 'Powierzchnia ścian'),
  perimeter: positiveNumber(0.1, 1000, 'Obwód'),
});

// ============================================================================
// Search & Filter Validators
// ============================================================================

/**
 * Search query validation
 */
export const searchQuerySchema = safeString
  .pipe(z.string().max(100, { message: 'Zbyt długie zapytanie wyszukiwania' }));

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// ============================================================================
// Type Exports
// ============================================================================

export type LoginFormData = z.infer<typeof loginFormSchema>;
export type SignupFormData = z.infer<typeof signupFormSchema>;
export type CreateProjectData = z.infer<typeof createProjectSchema>;
export type CreateRoomData = z.infer<typeof createRoomSchema>;
export type RoomElement = z.infer<typeof roomElementSchema>;
export type RoomDimensions = z.infer<typeof roomDimensionsSchema>;
export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type RoomShape = z.infer<typeof roomShapeSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate data against a schema and return formatted errors
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach(err => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });

  return { success: false, errors };
}

/**
 * Get first validation error message
 */
export function getFirstError<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): string | null {
  const result = schema.safeParse(data);

  if (result.success) {
    return null;
  }

  return result.error.errors[0]?.message || 'Błąd walidacji';
}

/**
 * Validate a single field
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { valid: true; value: T } | { valid: false; error: string } {
  const result = schema.safeParse(value);

  if (result.success) {
    return { valid: true, value: result.data };
  }

  return {
    valid: false,
    error: result.error.errors[0]?.message || 'Nieprawidłowa wartość',
  };
}
