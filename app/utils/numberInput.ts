/**
 * Normalizes decimal separator in numeric input strings
 * Converts comma (,) to period (.) for consistent parsing
 * 
 * @param value - Input string that may contain comma or period as decimal separator
 * @returns Normalized string with period as decimal separator
 */
export function normalizeDecimalSeparator(value: string): string {
  // Replace comma with period for decimal separator
  return value.replace(/,/g, '.');
}

/**
 * Handles numeric input with support for both comma and period as decimal separators
 * Normalizes the input and updates the state
 * 
 * @param value - Raw input value from TextInput
 * @param setValue - State setter function
 */
export function handleNumericInput(value: string, setValue: (value: string) => void): void {
  // Normalize decimal separator (comma to period)
  const normalized = normalizeDecimalSeparator(value);
  setValue(normalized);
}

