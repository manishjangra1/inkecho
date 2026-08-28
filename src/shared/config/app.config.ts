export const APP_CONFIG = {
  name: 'InkEcho',
  description:
    'A multiplayer realtime party game where players alternately draw and describe prompts.',
  tagline: 'Draw. Describe. Watch it echo.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  defaultTheme: 'dark',
  version: '0.1.0',
} as const;
