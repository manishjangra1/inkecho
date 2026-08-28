export const CANVAS_CONFIG = {
  DIMENSIONS: {
    LOGICAL_WIDTH: 800,
    LOGICAL_HEIGHT: 600,
    ASPECT_RATIO: 4 / 3,
    MIN_HEIGHT_MOBILE_PX: 280,
  },
  TOOLS: {
    BRUSH: 'brush',
    ERASER: 'eraser',
  } as const,
  BRUSH: {
    MIN_SIZE: 1,
    MAX_SIZE: 32,
    DEFAULT_SIZE: 4,
    DEFAULT_ERASER_SIZE: 12,
    DEFAULT_COLOR: '#FFFFFF',
    PRESET_SIZES: [2, 4, 8, 16, 24] as const,
    PALETTE: [
      { id: 'brush-1', name: 'White', hex: '#FFFFFF' },
      { id: 'brush-2', name: 'Black', hex: '#000000' },
      { id: 'brush-3', name: 'Red', hex: '#EF4444' },
      { id: 'brush-4', name: 'Orange', hex: '#F97316' },
      { id: 'brush-5', name: 'Yellow', hex: '#EAB308' },
      { id: 'brush-6', name: 'Green', hex: '#22C55E' },
      { id: 'brush-7', name: 'Blue', hex: '#3B82F6' },
      { id: 'brush-8', name: 'Purple', hex: '#A855F7' },
    ] as const,
  },
  UNDO_REDO: {
    MIN_STACK_DEPTH: 20,
    MAX_STACK_DEPTH: 50,
  },
  EXPORT: {
    MIME_TYPE: 'image/webp',
    FALLBACK_MIME_TYPE: 'image/png',
    DEFAULT_QUALITY: 0.85,
    MIN_QUALITY: 0.6,
    QUALITY_STEP: 0.1,
    MAX_FILE_SIZE_BYTES: 500 * 1024, // 500 KB target
    MAX_UPLOAD_SIZE_BYTES: 2 * 1024 * 1024, // 2 MB raw limit
    EXPORT_WIDTH: 800,
    EXPORT_HEIGHT: 600,
    BACKGROUND_DARK: '#262626',
    BACKGROUND_LIGHT: '#262626',
  },
  AUTOSAVE: {
    DEBOUNCE_MS: 2000,
    STORAGE_KEY_PREFIX: 'inkecho:draft:',
    MAX_AGE_HOURS: 24,
  },
  SIMPLIFICATION: {
    TOLERANCE_PX: 1.0,
  },
} as const;

export type CanvasTool = (typeof CANVAS_CONFIG.TOOLS)[keyof typeof CANVAS_CONFIG.TOOLS];
