import { ROOM_CONFIG } from '@/shared/config/room.config';

/**
 * Validates whether a given string is a valid room code.
 * Must be uppercase, exactly ROOM_CODE_LENGTH, using allowed alphabet.
 */
export function isValidRoomCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const clean = code.trim().toUpperCase();
  if (clean.length !== ROOM_CONFIG.ROOM_CODE_LENGTH) return false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (char && !ROOM_CONFIG.ROOM_CODE_ALPHABET.includes(char)) {
      return false;
    }
  }
  return true;
}

/**
 * Generates a random room code using the configured alphabet.
 */
export function generateRoomCode(): string {
  const chars = ROOM_CONFIG.ROOM_CODE_ALPHABET;
  let code = '';
  for (let i = 0; i < ROOM_CONFIG.ROOM_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  return code;
}

/**
 * Normalizes input room code to uppercase and trimmed.
 */
export function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase();
}
