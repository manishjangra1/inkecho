/**
 * Motion Tokens and Framer Motion easing configurations
 * Reference: docs/phase-1/06-animation-system.md
 */

export const MOTION = {
  duration: {
    instant: 0,
    fast: 0.15,
    normal: 0.25,
    slow: 0.4,
    slower: 0.6,
    celebration: 0.8,
  },
  ease: {
    out: [0, 0, 0.2, 1],
    in: [0.4, 0, 1, 1],
    inOut: [0.4, 0, 0.2, 1],
  },
  spring: {
    snappy: { type: 'spring', stiffness: 400, damping: 30 },
    bouncy: { type: 'spring', stiffness: 300, damping: 15 },
  },
} as const;

export const pageTransitionVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION.duration.normal, ease: MOTION.ease.out },
  },
  exit: { opacity: 0, y: -8, transition: { duration: MOTION.duration.fast, ease: MOTION.ease.in } },
};

export const staggerContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const staggerItemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION.duration.normal, ease: MOTION.ease.out },
  },
};
