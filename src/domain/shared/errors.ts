/**
 * Pure Domain Error interfaces and codes.
 * Zero external dependencies.
 */

export interface DomainError {
  readonly code: string;
  readonly message: string;
  readonly context?: Record<string, unknown>;
}

export function createDomainError(
  code: string,
  message: string,
  context?: Record<string, unknown>
): DomainError {
  return { code, message, context };
}

export const DOMAIN_ERROR_CODES = {
  INVALID_ROOM_STATE: 'INVALID_ROOM_STATE',
  ROOM_FULL: 'ROOM_FULL',
  NOT_HOST: 'NOT_HOST',
  PLAYER_NOT_IN_ROOM: 'PLAYER_NOT_IN_ROOM',
  INVALID_GAME_TRANSITION: 'INVALID_GAME_TRANSITION',
  NOT_YOUR_TURN: 'NOT_YOUR_TURN',
  TURN_ALREADY_SUBMITTED: 'TURN_ALREADY_SUBMITTED',
  INVALID_DISPLAY_NAME: 'INVALID_DISPLAY_NAME',
  INVALID_ROOM_CODE: 'INVALID_ROOM_CODE',
} as const;

export type DomainErrorCode = (typeof DOMAIN_ERROR_CODES)[keyof typeof DOMAIN_ERROR_CODES];
