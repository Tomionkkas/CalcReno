/**
 * Developer email configuration for feedback system
 *
 * TODO: Update this array with your actual developer email address(es)
 * These emails will have special privileges:
 * - Can comment on any feedback post
 * - Display "Developer" badge on comments
 */
export const DEVELOPER_EMAILS = [
  'airize.technologies@gmail.com', // Replace with actual developer email
];

/**
 * Check if an email belongs to a developer
 * @param email - Email address to check
 * @returns true if email is in DEVELOPER_EMAILS array
 */
export const isDeveloper = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return DEVELOPER_EMAILS.includes(email.toLowerCase());
};
