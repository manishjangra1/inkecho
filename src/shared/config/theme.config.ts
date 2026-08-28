/**
 * Design system tokens & constants
 * Reference: docs/phase-1/05-design-tokens.md
 */

export const THEME_CONFIG = {
  colors: {
    brandPrimary: '#7C3AED', // HSL 262 83% 58%
    brandSecondary: '#EC4899', // HSL 330 81% 60%
    brandAccent: '#0EA5E9', // HSL 199 89% 48%
    canvasBg: '#1A1A2E',
    destructive: '#DC2626',
    online: '#22C55E',
    warning: '#F59E0B',
  },
  brushPalette: [
    { hex: '#FFFFFF', name: 'White' },
    { hex: '#000000', name: 'Black' },
    { hex: '#EF4444', name: 'Red' },
    { hex: '#F97316', name: 'Orange' },
    { hex: '#EAB308', name: 'Yellow' },
    { hex: '#22C55E', name: 'Green' },
    { hex: '#3B82F6', name: 'Blue' },
    { hex: '#A855F7', name: 'Purple' },
  ],
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },
} as const;
