/**
 * InkEcho Avatar Generator & Utility
 *
 * Provides vibrant, colorful people avatars using DiceBear styles (Avataaars / Adventurer / Lorelei)
 * and rich offline deterministic SVG illustrated people portraits.
 */

export type AvatarStyle =
  | 'avataaars'
  | 'adventurer'
  | 'lorelei'
  | 'open-peeps'
  | 'personas'
  | 'thumbs'
  | 'fun-emoji';

const COLORFUL_BACKGROUNDS = [
  'b6e3f4', // sky blue
  'c0aede', // lavender
  'd1d4f9', // periwinkle
  'ffd5dc', // soft pink
  'ffdfbf', // peach
  'c1f4c5', // mint green
  'fef08a', // warm yellow
  'fed7aa', // orange cream
  'a7f3d0', // aqua
  'ddd6fe', // violet
];

/**
 * Returns a DiceBear SVG Avatar URL for a given seed (user ID, player ID, or display name).
 * Defaults to 'avataaars' with vibrant multi-colored backgrounds.
 */
export function getAvatarUrl(
  seed: string,
  style: AvatarStyle = 'avataaars',
  options: { size?: number; backgroundColor?: string } = {}
): string {
  const cleanSeed = encodeURIComponent(seed.trim() || 'player');
  const size = options.size ?? 128;
  const bg = options.backgroundColor ?? COLORFUL_BACKGROUNDS.join(',');

  return `https://api.dicebear.com/9.x/${style}/svg?seed=${cleanSeed}&size=${size}&backgroundColor=${bg}`;
}

/**
 * Simple deterministic hash for consistent color and shape generation.
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

const BG_PALETTES = [
  '#60A5FA', // Sky Blue
  '#34D399', // Mint Green
  '#A78BFA', // Purple
  '#FBBF24', // Amber
  '#F472B6', // Pink
  '#38BDF8', // Cyan
  '#FB7185', // Rose
  '#818CF8', // Indigo
  '#FB923C', // Orange
  '#2DD4BF', // Teal
];

const SKIN_TONES = ['#FDDFD0', '#F5D0C5', '#E8BA9B', '#D39B72', '#C68642', '#8D5524'];
const CLOTHES_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];
const HAIR_COLORS = ['#1E293B', '#78350F', '#451A03', '#92400E', '#B45309', '#6366F1', '#D97706'];

/**
 * Generates an instant, zero-latency deterministic SVG Data URI depicting a colorful illustrated person.
 * Works completely offline with zero external network requests.
 */
export function getDeterministicAvatarSvg(seed: string): string {
  const hash = hashString(seed || 'player');
  const bg = BG_PALETTES[hash % BG_PALETTES.length] ?? '#60A5FA';
  const skin = SKIN_TONES[(hash >> 2) % SKIN_TONES.length] ?? '#FDDFD0';
  const clothes = CLOTHES_COLORS[(hash >> 4) % CLOTHES_COLORS.length] ?? '#3B82F6';
  const hair = HAIR_COLORS[(hash >> 6) % HAIR_COLORS.length] ?? '#1E293B';
  const hairStyle = hash % 3;
  const mouthStyle = (hash >> 3) % 3;

  // Hair SVGs
  let hairSvg = `
    <path d="M22 36 C22 16, 58 16, 58 36 C58 24, 22 24, 22 36 Z" fill="${hair}"/>
    <path d="M20 30 C20 12, 60 12, 60 30 C55 20, 25 20, 20 30 Z" fill="${hair}"/>
  `;
  if (hairStyle === 1) {
    // Short / Spiky hair
    hairSvg = `
      <path d="M20 34 C20 14, 60 14, 60 34 C60 18, 50 10, 40 10 C30 10, 20 18, 20 34 Z" fill="${hair}"/>
      <circle cx="28" cy="18" r="6" fill="${hair}"/>
      <circle cx="40" cy="14" r="7" fill="${hair}"/>
      <circle cx="52" cy="18" r="6" fill="${hair}"/>
    `;
  } else if (hairStyle === 2) {
    // Curly / Bob hair
    hairSvg = `
      <path d="M18 36 C18 14, 62 14, 62 36 C64 48, 62 50, 58 50 C58 32, 22 32, 22 50 C18 50, 16 48, 18 36 Z" fill="${hair}"/>
      <circle cx="20" cy="32" r="7" fill="${hair}"/>
      <circle cx="60" cy="32" r="7" fill="${hair}"/>
    `;
  }

  // Mouth SVGs
  let mouthSvg = '<path d="M34 50 Q40 56 46 50" stroke="#78350F" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  if (mouthStyle === 1) {
    mouthSvg = '<path d="M33 49 Q40 58 47 49 Z" fill="#EF4444"/><path d="M35 49 Q40 52 45 49 Z" fill="#FFFFFF"/>';
  } else if (mouthStyle === 2) {
    mouthSvg = '<path d="M35 50 Q40 55 45 50" stroke="#78350F" stroke-width="2" fill="none" stroke-linecap="round"/>';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
    <rect width="80" height="80" rx="8" fill="${bg}"/>
    <!-- Clothes / Hoodie -->
    <path d="M12 80 C12 60, 24 58, 40 58 C56 58, 68 60, 68 80 Z" fill="${clothes}"/>
    <circle cx="40" cy="58" r="8" fill="${skin}"/>
    <!-- Head / Face -->
    <circle cx="40" cy="38" r="18" fill="${skin}"/>
    <!-- Blush -->
    <circle cx="28" cy="45" r="3" fill="#FCA5A5" opacity="0.6"/>
    <circle cx="52" cy="45" r="3" fill="#FCA5A5" opacity="0.6"/>
    <!-- Eyes -->
    <circle cx="32" cy="39" r="2.5" fill="#1E293B"/>
    <circle cx="48" cy="39" r="2.5" fill="#1E293B"/>
    <!-- Eyebrows -->
    <path d="M29 34 Q32 32 35 34" stroke="${hair}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M45 34 Q48 32 51 34" stroke="${hair}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- Mouth -->
    ${mouthSvg}
    <!-- Hair -->
    ${hairSvg}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Extracts 1-2 uppercase initials from a display name.
 */
export function getInitials(displayName?: string | null): string {
  if (!displayName) return 'P';
  const parts = displayName.trim().split(/\s+/);
  if (parts.length === 1) {
    return (parts[0]?.slice(0, 2) || 'P').toUpperCase();
  }
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}
