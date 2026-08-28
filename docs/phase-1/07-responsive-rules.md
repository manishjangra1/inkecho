# Phase 1 — Document 7: Responsive Rules

## Overview

InkEcho is **mobile-first**. The game must be fully playable on a 320px-wide phone in portrait orientation. Layout adapts progressively across breakpoints without separate mobile/desktop apps.

**Breakpoints** align with Tailwind defaults, extended where needed.

---

## Breakpoint Scale

| Token | Min Width | Target Devices |
|-------|-----------|----------------|
| `xs` | 320px | Small phones (iPhone SE) |
| `sm` | 640px | Large phones, small tablets |
| `md` | 768px | Tablets portrait |
| `lg` | 1024px | Tablets landscape, laptops |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

**Design priority:** 375px (iPhone standard) and 1280px (desktop) as primary design widths.

---

## Layout Behavior by Breakpoint

### Global Layout

| Element | xs–sm | md | lg+ |
|---------|-------|-----|-----|
| Container padding | `px-4` | `px-6` | `px-8` |
| Max content width | 100% | 100% | 1280px centered |
| Marketing header | Logo + hamburger | Logo + condensed nav | Full horizontal nav |
| Bottom nav | Visible | Hidden | Hidden |
| Footer | Stacked links | Inline links | Inline links |

---

### Landing Page

| Element | xs–sm | md | lg+ |
|---------|-------|-----|-----|
| Hero layout | Single column | Single column | 2 columns (text + illustration) |
| Headline | `text-3xl` | `text-4xl` | `text-5xl` |
| CTAs | Full-width stacked | Inline row | Inline row |
| How it works | 1 column | 2×2 grid | 4 columns |
| Quick join card | Below CTAs | Below CTAs | Beside hero |

---

### Join / Create Forms

| Element | xs–sm | md+ |
|---------|-------|-----|
| Form card width | 100% | max 480px centered |
| Room code input | 6 boxes, full width distributed | Same |
| OAuth buttons | Full width | Full width |
| Settings sliders | Stacked | 2-column grid |

---

### Lobby

| Element | xs–sm | md | lg+ |
|---------|-------|-----|-----|
| Player grid columns | 2 | 3 | 4–5 |
| Player card size | Compact (sm avatar) | md avatar | md avatar |
| Invite bar | Stacked URL + buttons | Inline | Inline |
| Ready / Start | Sticky bottom bar | Inline bottom center | Inline bottom center |
| Settings | Bottom sheet drawer | Right drawer | Right drawer |
| Host settings btn | Icon only in header | Icon + label | Icon + label |

```
Mobile sticky bottom:
┌─────────────────────────┐
│ [ ✓ Ready ] [ ▶ Start ] │  ← host sees both; player sees Ready only
└─────────────────────────┘
```

---

### Game — Describe Phase

| Element | xs–sm | md+ |
|---------|-------|-----|
| Prior drawing | Full width, max-h 40vh | max-w 640px centered |
| Textarea | Full width, min-h 80px | min-h 100px |
| Submit button | Sticky bottom full-width | Inline right |
| Timer header | Compact single row | Full game header |

---

### Game — Draw Phase

| Element | xs–sm | md | lg+ |
|---------|-------|-----|-----|
| Canvas aspect | 4:3, width 100% | 4:3, max 640px | 4:3, max 800px |
| Canvas height | ~calc(100vw * 0.75) capped | fixed ratio | fixed ratio |
| Toolbar position | Bottom horizontal scroll | Left vertical | Left vertical |
| Toolbar items | 44×44 touch targets | 40×40 | 36×36 |
| Prompt card | Above canvas, truncated | Above canvas | Side panel (lg+) |
| Submit | Sticky bottom | Below canvas | Below canvas |

**Critical mobile rule:** Canvas area must not cause vertical scroll during draw — viewport minus header, prompt, toolbar, submit.

```
Mobile viewport budget (667px height example):
  Header:     56px
  Prompt:     48px
  Canvas:    ~400px (flex-grow)
  Toolbar:    48px
  Submit:     56px
  ─────────────────
  Total:     ~608px ✓
```

---

### Game — Waiting Phase

| Element | xs–sm | md+ |
|---------|-------|-----|
| Active avatar | xl size centered | xl size |
| Turn dots | Horizontal scroll if >5 | Full row |
| Decorative elements | Hidden on xs | Subtle background |

---

### Reveal

| Element | xs–sm | md+ |
|---------|-------|-----|
| Step content | Full width cards | max-w 720px centered |
| Drawing in reveal | Full width | max-w 600px |
| Controls | Bottom sticky row | Below content |
| Vote buttons | Horizontal scroll chips | Inline row |
| Chain selector | Dropdown | Tab bar |

---

### Profile & Admin

| Element | xs–sm | md+ |
|---------|-------|-----|
| Stats grid | 2×2 | 4 columns |
| History list | Card list | Table |
| Admin sidebar | Hidden → hamburger | Fixed 240px sidebar |

---

## Touch & Pointer Rules

| Rule | Value |
|------|-------|
| Min touch target | 44×44px (WCAG 2.5.5) |
| Min spacing between targets | 8px |
| Canvas touch-action | `none` on canvas element |
| Scroll during draw | Prevented on canvas container |
| Hover states | Disabled on `@media (hover: none)` |
| Tap highlight | `-webkit-tap-highlight-color: transparent` |

```css
@media (hover: none) {
  .hover-lift:hover {
    transform: none;
  }
}
```

---

## Typography Responsive Scale

| Element | xs | sm | lg |
|---------|-----|-----|-----|
| Hero H1 | 30px | 36px | 48px |
| Page H2 | 20px | 24px | 24px |
| Timer | 20px | 24px | 24px |
| Room code | 16px | 18px | 18px |
| Body | 16px | 16px | 16px |

Use `clamp()` for fluid hero:

```css
font-size: clamp(1.875rem, 4vw + 1rem, 3rem);
```

---

## Image & Media Rules

| Asset | Responsive behavior |
|-------|---------------------|
| Hero illustration | `max-w-full h-auto`; hide on xs if cramped (optional simplified SVG) |
| Prior drawing | `object-contain`, max-height responsive |
| Avatar | sm (32px) lobby mobile; md (40px) desktop |
| Reveal drawing | Full container width, maintain aspect |

---

## Orientation

| Orientation | Behavior |
|-------------|----------|
| Portrait phone | Primary design target for game |
| Landscape phone | Canvas expands; toolbar moves to side if width > 640px |
| Tablet landscape | Side-by-side prompt + canvas on draw phase |
| Desktop | Max-width game area centered; not full-bleed ultra-wide |

**Optional landscape hint (draw phase):** "Rotate for more canvas space" — dismissible toast on xs landscape only.

---

## Visibility & Conditional UI

| Feature | Hidden on xs | Visible md+ |
|---------|--------------|-------------|
| Browse nav link | In hamburger | In header |
| Player connection text | Icon dot only | Icon + label |
| Turn fraction "3/7" | "3/7" compact | "Turn 3 of 7" |
| Decorative bg blobs | Yes | lg+ |
| Keyboard shortcut hints | Hidden | lg+ (desktop) |

---

## Safe Areas (Notched Devices)

```css
padding-bottom: env(safe-area-inset-bottom);
padding-top: env(safe-area-inset-top);
```

Apply to:
- Sticky bottom bars (lobby, draw submit)
- Mobile bottom nav
- Full-screen game header

---

## Print & Reduced Context

| Context | Rule |
|---------|------|
| Print | Hide nav, timers, buttons; show reveal content only |
| `prefers-reduced-motion` | See animation doc |
| `prefers-color-scheme` | Default dark; respect light if user sets theme toggle |

---

## Responsive Testing Matrix

| Device | Width | Priority | Test flows |
|--------|-------|----------|------------|
| iPhone SE | 320 | P0 | Join, draw, submit |
| iPhone 14 | 390 | P0 | Full game flow |
| Pixel 7 | 412 | P0 | Touch draw |
| iPad Mini | 768 | P1 | Lobby, landscape draw |
| iPad Pro | 1024 | P1 | Side toolbar |
| MacBook | 1280 | P0 | Desktop full flow |
| Ultra-wide | 1920+ | P2 | Centered, no stretch |

---

## Tailwind Utility Patterns

```tsx
// Player grid
className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"

// Game layout
className="flex flex-col lg:flex-row lg:gap-6"

// Sticky mobile submit
className="sticky bottom-0 pb-safe sm:static sm:pb-0"

// Hide/show
className="hidden md:flex"
className="md:hidden"
```

---

## Related Documents

- Wireframes: [03-wireframes.md](./03-wireframes.md)
- Design tokens: [05-design-tokens.md](./05-design-tokens.md)
- Canvas design: [../phase-0/12-drawing-canvas-design.md](../phase-0/12-drawing-canvas-design.md)
