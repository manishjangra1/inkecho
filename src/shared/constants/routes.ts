export const ROUTES = {
  HOME: '/',
  BROWSE: '/browse',
  CREATE: '/create',
  JOIN: '/join',
  JOIN_CODE: (code: string) => `/join/${code}`,
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  ROOM: {
    ROOT: (code: string) => `/room/${code}`,
    LOBBY: (code: string) => `/room/${code}/lobby`,
    GAME: (code: string) => `/room/${code}/game`,
    REVEAL: (code: string) => `/room/${code}/reveal`,
    SPECTATE: (code: string) => `/room/${code}/spectate`,
  },
  PROFILE: {
    ROOT: '/profile',
    HISTORY: '/profile/history',
    STATS: '/profile/stats',
    ACHIEVEMENTS: '/profile/achievements',
  },
  LEGAL: {
    PRIVACY: '/legal/privacy',
    TERMS: '/legal/terms',
  },
  API: {
    HEALTH: '/api/health',
    AUTH: '/api/auth',
    GUEST_SESSION: '/api/guest/session',
    ROOMS: '/api/rooms',
    REALTIME_TOKEN: '/api/realtime/token',
  },
} as const;
