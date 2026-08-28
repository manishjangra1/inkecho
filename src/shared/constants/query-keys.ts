export const QUERY_KEYS = {
  ROOM: (code: string) => ['room', code] as const,
  PUBLIC_ROOMS: ['public-rooms'] as const,
  AUTH_SESSION: ['auth-session'] as const,
  GUEST_SESSION: ['guest-session'] as const,
  GAME_SNAPSHOT: (code: string) => ['game-snapshot', code] as const,
} as const;
