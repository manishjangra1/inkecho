import { ROOM_CONFIG } from '@/shared/config/room.config';

const DISPLAY_NAME_REGEX = /^[\w\s-]+$/;

/**
 * Validates whether a given display name satisfies length and character constraints.
 */
export function isValidDisplayName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const clean = name.trim();
  if (
    clean.length < ROOM_CONFIG.DISPLAY_NAME_MIN_LENGTH ||
    clean.length > ROOM_CONFIG.DISPLAY_NAME_MAX_LENGTH
  ) {
    return false;
  }
  return DISPLAY_NAME_REGEX.test(clean);
}

/**
 * Sanitizes and trims display name.
 */
export function sanitizeDisplayName(name: string): string {
  return name.trim().replace(/[^\w\s-]/g, '');
}
