# Phase 1 — Document 5: Design Tokens

## Overview

All visual values are defined as **CSS custom properties** and referenced in Tailwind config. **No hardcoded colors or spacing in components.** Tokens support dark (default) and light themes via `next-themes`.

Implementation path: `shared/config/theme.config.ts` → `app/globals.css` → `tailwind.config.ts`

---

## Color Palette

### Brand Colors

Inspired by premium dark SaaS with playful accent gradients (Linear × Discord).

| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--brand-primary` | `262 83% 58%` (#7C3AED violet) | `262 83% 50%` | Primary actions, links |
| `--brand-secondary` | `330 81% 60%` (#EC4899 pink) | `330 70% 50%` | Accents, gradients |
| `--brand-accent` | `199 89% 48%` (#0EA5E9 cyan) | `199 80% 40%` | Highlights, timer OK |

**Brand gradient (CTAs, hero):**
```css
--gradient-brand: linear-gradient(135deg, hsl(262 83% 58%) 0%, hsl(330 81% 60%) 100%);
--gradient-brand-hover: linear-gradient(135deg, hsl(262 83% 65%) 0%, hsl(330 81% 67%) 100%);
```

---

### Semantic Surface Colors

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--background` | `240 10% 4%` (#09090B) | `0 0% 100%` | Page background |
| `--foreground` | `0 0% 98%` | `240 10% 4%` | Primary text |
| `--card` | `240 10% 6%` (#0F0F12) | `0 0% 100%` | Card surfaces |
| `--card-foreground` | `0 0% 98%` | `240 10% 4%` | Card text |
| `--popover` | `240 10% 8%` | `0 0% 100%` | Dropdowns, popovers |
| `--muted` | `240 5% 16%` | `240 5% 96%` | Subtle backgrounds |
| `--muted-foreground` | `240 5% 65%` | `240 4% 46%` | Secondary text |
| `--border` | `240 5% 18%` | `240 6% 90%` | Borders, dividers |
| `--input` | `240 5% 18%` | `240 6% 90%` | Input borders |
| `--ring` | `262 83% 58%` | `262 83% 50%` | Focus rings |

---

### Glassmorphism (Selective Use)

Used on: hero cards, lobby player cards hover, reveal step cards.

| Token | Dark | Light |
|-------|------|-------|
| `--glass-bg` | `240 10% 10% / 0.6` | `0 0% 100% / 0.7` |
| `--glass-border` | `0 0% 100% / 0.08` | `0 0% 0% / 0.06` |
| `--glass-blur` | `16px` | `16px` |

```css
.glass {
  background: hsl(var(--glass-bg));
  border: 1px solid hsl(var(--glass-border));
  backdrop-filter: blur(var(--glass-blur));
}
```

**Do not** use glass on: forms, canvas area, timer bar.

---

### Interactive States

| Token | Dark | Usage |
|-------|------|-------|
| `--primary` | `262 83% 58%` | Primary button bg |
| `--primary-foreground` | `0 0% 100%` | Primary button text |
| `--secondary` | `240 5% 16%` | Secondary button |
| `--destructive` | `0 72% 51%` (#DC2626) | Kick, delete, errors |
| `--destructive-foreground` | `0 0% 98%` | — |
| `--accent` | `240 5% 16%` | Hover backgrounds |
| `--accent-foreground` | `0 0% 98%` | — |

---

### Game-Specific Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--canvas-bg` | `240 20% 12%` (#1A1A2E) | Drawing surface |
| `--canvas-border` | `240 5% 22%` | Canvas frame |
| `--timer-normal` | `199 89% 48%` | > 25% remaining |
| `--timer-warning` | `38 92% 50%` | ≤ 25% remaining |
| `--timer-critical` | `0 72% 51%` | ≤ 10% remaining |
| `--ready` | `142 71% 45%` | Ready badge |
| `--waiting` | `240 5% 40%` | Not ready |
| `--online` | `142 71% 45%` | Presence dot |
| `--reconnecting` | `38 92% 50%` | Amber pulse |
| `--offline` | `240 5% 40%` | Gray dot |
| `--spectator` | `199 89% 48%` | Spectator badge |

---

### Canvas Brush Palette

Defined in `shared/config/canvas.config.ts`:

| Token | Hex | Name |
|-------|-----|------|
| `--brush-1` | `#FFFFFF` | White |
| `--brush-2` | `#000000` | Black |
| `--brush-3` | `#EF4444` | Red |
| `--brush-4` | `#F97316` | Orange |
| `--brush-5` | `#EAB308` | Yellow |
| `--brush-6` | `#22C55E` | Green |
| `--brush-7` | `#3B82F6` | Blue |
| `--brush-8` | `#A855F7` | Purple |

---

## Typography

### Font Families

| Token | Font | Usage |
|-------|------|-------|
| `--font-sans` | **Inter** (via next/font) | UI, body, buttons |
| `--font-display` | **Cal Sans** or **Satoshi** fallback Inter | Headlines, hero |
| `--font-mono` | **JetBrains Mono** | Room codes, timers, debug |

```typescript
// app/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google';
```

---

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-xs` | 12px / 0.75rem | 16px | 400 | Captions, badges |
| `--text-sm` | 14px / 0.875rem | 20px | 400 | Secondary UI, labels |
| `--text-base` | 16px / 1rem | 24px | 400 | Body default |
| `--text-lg` | 18px / 1.125rem | 28px | 400 | Lead text |
| `--text-xl` | 20px / 1.25rem | 28px | 500 | Section titles |
| `--text-2xl` | 24px / 1.5rem | 32px | 600 | Page titles |
| `--text-3xl` | 30px / 1.875rem | 36px | 600 | Hero subhead |
| `--text-4xl` | 36px / 2.25rem | 40px | 700 | Hero headline |
| `--text-5xl` | 48px / 3rem | 48px | 700 | Landing hero (desktop) |

### Typography Rules

| Element | Style |
|---------|-------|
| H1 (hero) | `text-5xl font-display font-bold tracking-tight` |
| H2 (section) | `text-2xl font-semibold tracking-tight` |
| H3 (card title) | `text-lg font-medium` |
| Body | `text-base text-foreground` |
| Muted | `text-sm text-muted-foreground` |
| Room code | `font-mono text-lg tracking-widest uppercase` |
| Timer | `font-mono text-2xl font-semibold tabular-nums` |

---

## Spacing System

Based on **4px base unit** (Tailwind default aligned).

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--space-0` | 0 | `0` | — |
| `--space-1` | 4px | `1` | Tight inline |
| `--space-2` | 8px | `2` | Icon gaps |
| `--space-3` | 12px | `3` | Compact padding |
| `--space-4` | 16px | `4` | Default padding |
| `--space-5` | 20px | `5` | — |
| `--space-6` | 24px | `6` | Card padding |
| `--space-8` | 32px | `8` | Section gaps |
| `--space-10` | 40px | `10` | — |
| `--space-12` | 48px | `12` | Large section gaps |
| `--space-16` | 64px | `16` | Hero spacing |
| `--space-20` | 80px | `20` | Page section margins |
| `--space-24` | 96px | `24` | Landing section padding |

### Layout Spacing Rules

| Context | Padding | Gap |
|---------|---------|-----|
| Page horizontal | `px-4 sm:px-6 lg:px-8` | — |
| Card internal | `p-6` | — |
| Player grid | — | `gap-4` |
| Form fields | — | `gap-4` vertical |
| Toolbar icons | — | `gap-2` |
| Section vertical | `py-16 lg:py-24` | — |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Badges, small chips |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards |
| `--radius-xl` | 16px | Modals, drawers |
| `--radius-2xl` | 24px | Hero cards, canvas frame |
| `--radius-full` | 9999px | Avatars, dots, pills |

**Default shadcn `--radius`:** `0.75rem` (12px) → maps to `--radius-lg`

---

## Shadows & Elevation

| Token | Dark Value | Usage |
|-------|------------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.4)` | Subtle lift |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.5)` | Cards |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.6)` | Modals, drawers |
| `--shadow-glow` | `0 0 24px hsl(262 83% 58% / 0.3)` | Active turn, CTA hover |
| `--shadow-glow-pink` | `0 0 24px hsl(330 81% 60% / 0.25)` | Reveal celebration |

---

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Default content |
| `--z-dropdown` | 50 | Menus, popovers |
| `--z-sticky` | 100 | Headers |
| `--z-drawer` | 200 | Drawers, sheets |
| `--z-modal` | 300 | Dialogs |
| `--z-toast` | 400 | Toasts |
| `--z-banner` | 350 | Reconnect banner |
| `--z-tooltip` | 500 | Tooltips |

---

## Iconography

**Library:** Lucide React (tree-shaken imports)

| Context | Size | Stroke |
|---------|------|--------|
| Toolbar | 20px | 2 |
| Header | 18px | 2 |
| Inline | 16px | 2 |
| Feature icons | 24px | 1.5 |
| Empty states | 48px | 1.5 |

Common icons: `Pencil`, `Eraser`, `Palette`, `Undo2`, `Redo2`, `Copy`, `Share2`, `Settings`, `Users`, `Crown`, `Eye`, `Timer`, `Play`, `Check`, `X`

---

## globals.css Structure (Reference)

```css
@layer base {
  :root {
    /* light tokens */
  }
  .dark {
    /* dark tokens */
  }
}
```

Tailwind extends:

```typescript
colors: {
  background: 'hsl(var(--background))',
  primary: { DEFAULT: 'hsl(var(--primary))', foreground: '...' },
  canvas: { DEFAULT: 'hsl(var(--canvas-bg))', border: '...' },
  timer: { normal: '...', warning: '...', critical: '...' },
}
```

---

## Related Documents

- Animation: [06-animation-system.md](./06-animation-system.md)
- Responsive: [07-responsive-rules.md](./07-responsive-rules.md)
- Canvas colors: [../phase-0/12-drawing-canvas-design.md](../phase-0/12-drawing-canvas-design.md)
