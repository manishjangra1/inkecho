# Phase 1 — Document 6: Animation System

## Overview

Motion in InkEcho is **purposeful, not decorative**. Animations communicate state changes (turn start, player join, reveal step), provide feedback (button press, ready toggle), and create delight at key moments (reveal, win). All motion respects `prefers-reduced-motion`.

**Library:** Framer Motion  
**Config:** `shared/config/motion.config.ts`

---

## Motion Principles

| Principle | Rule |
|-----------|------|
| **Purpose** | Every animation answers "what changed?" |
| **Speed** | UI transitions 150–300ms; celebrations 400–800ms |
| **Easing** | Enter: ease-out; Exit: ease-in; Move: ease-in-out |
| **Restraint** | Max 3 simultaneous animations per view |
| **Accessibility** | `prefers-reduced-motion` → instant or crossfade only |
| **Performance** | Animate `transform` and `opacity` only — not width/height |

---

## Duration Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 0ms | Reduced motion fallback |
| `--duration-fast` | 150ms | Hover, focus, tool toggle |
| `--duration-normal` | 250ms | Page transitions, card enter |
| `--duration-slow` | 400ms | Phase transitions, modals |
| `--duration-slower` | 600ms | Reveal step entrance |
| `--duration-celebration` | 800ms | Winner banner, game start |

---

## Easing Tokens

| Token | Cubic Bezier | Usage |
|-------|--------------|-------|
| `--ease-out` | `[0.0, 0.0, 0.2, 1]` | Elements entering |
| `--ease-in` | `[0.4, 0.0, 1, 1]` | Elements leaving |
| `--ease-in-out` | `[0.4, 0.0, 0.2, 1]` | State toggles |
| `--ease-spring` | `{ type: 'spring', stiffness: 400, damping: 30 }` | Playful bounces (ready badge) |
| `--ease-bounce` | `{ type: 'spring', stiffness: 300, damping: 15 }` | Reveal celebrations only |

Framer Motion mapping:

```typescript
export const MOTION = {
  duration: {
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
```

---

## Reduced Motion

```typescript
// shared/hooks/use-reduced-motion.ts
export function useReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Wrapper
const transition = reducedMotion
  ? { duration: 0 }
  : { duration: MOTION.duration.normal, ease: MOTION.ease.out };
```

| Full Motion | Reduced Motion |
|-------------|----------------|
| Slide up + fade | Opacity fade only |
| Scale bounce | No scale |
| Parallax | Disabled |
| Timer pulse | Color change only |
| Reveal slide-in | Crossfade |
| Stagger children | Simultaneous fade |

---

## Animation Catalog

### 1. Page Enter

**Used on:** Route transitions (landing → lobby → game)

```typescript
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};
// duration: normal, ease: out
```

---

### 2. Stagger List (Player Grid)

**Used on:** Lobby player cards, public room list

```typescript
const containerVariants = {
  animate: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
};
// max stagger: 8 items; rest appear instantly
```

---

### 3. Player Join

**Used on:** New player card in lobby

```
Enter: scale 0.8 → 1 + opacity 0 → 1 (spring snappy)
Avatar: subtle glow pulse once (--shadow-glow, 400ms)
```

---

### 4. Player Leave

```
Exit: scale 1 → 0.9 + opacity 1 → 0 (duration: fast)
Grid: layout animation reflow (layout prop, duration: normal)
```

---

### 5. Ready Toggle

**Used on:** Ready button / badge

```
Not ready → Ready:
  Button bg transition (duration: fast)
  Checkmark icon scale 0 → 1 (spring snappy)
  Card border glow (--ready color, shadow-glow, 300ms)
```

---

### 6. Start Game Transition

**Used on:** Lobby → Game

```
1. Start button ripple (400ms)
2. Lobby fades out (opacity, 300ms)
3. Game view fades in + timer bar fills from 0 (500ms)
4. First turn card slides up (slower, 600ms)
Total sequence: ~800ms
```

---

### 7. Phase Transition (Describe ↔ Draw ↔ Wait)

**Used on:** Game phase changes

```
Outgoing phase: opacity 1 → 0, y 0 → -12 (fast, ease-in)
Incoming phase: opacity 0 → 1, y 12 → 0 (normal, ease-out)
Overlap: 100ms crossfade
```

---

### 8. Timer Warning

**Used on:** GameTimer component

| Threshold | Animation |
|-----------|-----------|
| ≤ 25% | Bar color → `--timer-warning` (300ms) |
| ≤ 10% | Bar color → `--timer-critical` + pulse scale 1→1.02→1 (1s loop) |
| ≤ 3s | Tab title flash (no visual if reduced motion) |

```typescript
// Pulse keyframes (only if !reducedMotion)
animate={{ scale: [1, 1.02, 1] }}
transition={{ repeat: Infinity, duration: 1 }}
```

---

### 9. Active Player Highlight (Waiting View)

```
Avatar ring: rotating gradient border (3s linear infinite)
Name: subtle opacity pulse 0.8 → 1 (2s ease-in-out infinite)
Reduced motion: static ring, no pulse
```

---

### 10. Submit Success

**Used on:** Describe/draw submit button

```
1. Button text → spinner (instant)
2. On success: spinner → checkmark scale in (spring snappy)
3. Brief pause 400ms
4. Phase transition (see #7)
```

---

### 11. Canvas Tool Select

**Used on:** Toolbar buttons

```
Selected tool: scale 1 → 1.05 (fast) + bg accent
Deselected: scale → 1
Touch: active scale 0.95 (tap feedback)
```

---

### 12. Reveal Step Entrance

**Used on:** Reveal playback — core delight moment

```
Prompt/DESCRIPTION step:
  opacity 0 → 1
  y 24 → 0
  duration: slower (600ms)

DRAWING step:
  opacity 0 → 1
  scale 0.92 → 1
  duration: slower (600ms)
  optional: subtle shadow-glow

Arrow connector:
  scaleY 0 → 1 (origin top, normal duration)
  delay: 200ms after content
```

**Auto-advance:** 3s per step (from `GAME_CONFIG.REVEAL_STEP_DURATION_MS`)

---

### 13. Chain Transition

**Used on:** Moving between chains in reveal

```
Horizontal slide: outgoing x → -100%, incoming x 100% → 0
duration: slow (400ms)
ease: in-out
```

---

### 14. Vote & Winner

**Used on:** Post-reveal voting

```
Vote button press: scale 0.95 → 1 (spring)
Vote count: number count-up animation (400ms)
Winner reveal:
  confetti-lite (CSS particles, 800ms) OR gradient burst
  winner card: scale 0.9 → 1 + glow (celebration duration)
Reduced motion: winner card fade only
```

---

### 15. Toast Notifications

**Library:** Sonner (built-in slide)

```
Enter: slide from bottom + fade (default Sonner)
Exit: fade out
Duration: 4s default; 8s for errors
```

---

### 16. Modal / Drawer

**Dialog:**
```
Backdrop: opacity 0 → 0.8 (fast)
Content: opacity 0 → 1, scale 0.95 → 1 (normal, ease-out)
```

**Drawer (mobile bottom sheet):**
```
Slide y 100% → 0 (normal, ease-out)
Backdrop fade (fast)
```

---

### 17. Reconnect Banner

```
Enter: y -100% → 0 (normal)
Pulse dot: opacity 0.5 → 1 loop (1.5s) on reconnecting icon
Exit (connected): y → -100% (fast)
```

---

### 18. Theme Toggle

```
Sun/moon icon: rotate 0 → 180° (normal)
Crossfade between icons (fast)
Page colors: CSS transition on background/color (300ms)
```

---

### 19. Skeleton Loading

```
Shimmer: gradient sweep left → right (1.5s infinite linear)
Reduced motion: static muted bg, no shimmer
```

---

### 20. Hover & Focus (Micro-interactions)

| Element | Hover | Active |
|---------|-------|--------|
| Primary button | gradient shift + shadow-glow | scale 0.98 |
| Ghost button | bg accent | scale 0.98 |
| Card (lobby player) | border glow + y -2px | — |
| Link | underline offset animate | — |
| Icon button | bg accent | scale 0.95 |

All hover transitions: `--duration-fast`

---

## Layout Animations

Use Framer Motion `layout` prop sparingly:

| Component | Layout animation |
|-----------|------------------|
| PlayerGrid | ✓ reflow on join/leave |
| TurnProgressDots | ✓ dot state change |
| Canvas toolbar | ✗ fixed position |
| Game timer bar | ✗ width via CSS transition |

---

## GPU & Performance

| Do | Don't |
|----|-------|
| `transform: translate/scale` | Animate `width`, `height`, `top` |
| `opacity` | Animate `box-shadow` every frame |
| `will-change: transform` during animation | Leave `will-change` permanent |
| Remove animations off-screen | Infinite animations on hidden elements |

---

## Motion Component Wrappers

```
shared/ui/motion/
├── MotionFadeIn.tsx       # opacity + y
├── MotionSlideUp.tsx      # stagger container
├── MotionScaleIn.tsx      # scale entrance
├── MotionPage.tsx         # route transition wrapper
├── MotionPresence.tsx     # AnimatePresence helper
└── MotionReduced.tsx      # wraps children with reduced check
```

---

## Related Documents

- Design tokens: [05-design-tokens.md](./05-design-tokens.md)
- Wireframes: [03-wireframes.md](./03-wireframes.md)
- User flows: [02-user-flows.md](./02-user-flows.md)
