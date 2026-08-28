# Document 12 — Drawing Canvas Design

## Overview

The InkEcho drawing canvas is a **high-performance, mobile-first** HTML5 canvas component. It captures player drawings during DRAW turns, supports undo/redo, exports compressed images for upload, and autosaves drafts locally.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   DrawPhase UI                           │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Toolbar    │  │ Canvas View  │  │  Timer/Submit │  │
│  └──────┬──────┘  └──────┬───────┘  └───────────────┘  │
│         │                │                               │
│         ▼                ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              useCanvasEngine (hook)              │   │
│  │  stroke capture │ undo stack │ export │ autosave │   │
│  └─────────────────────────────────────────────────┘   │
│         │                │                               │
│         ▼                ▼                               │
│  ┌─────────────┐  ┌──────────────┐                      │
│  │ CanvasStore │  │ LocalStorage │                      │
│  │  (Zustand)  │  │   (draft)    │                      │
│  └─────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ submit
                   ┌──────────────┐
                   │ Export Pipe  │ → WebP compress → Server Action
                   └──────────────┘
```

---

## Canvas Rendering

### Technology

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Rendering | HTML5 Canvas 2D | Universal support, sufficient for sketching |
| Resolution | `devicePixelRatio` scaling | Crisp on Retina/high-DPI |
| Coordinate system | Normalized 0–1 + canvas pixels | Resize-safe stroke replay |
| Future path | OffscreenCanvas + Worker | If perf issues on low-end devices |

### Canvas Dimensions

| Viewport | Logical Size | Aspect Ratio |
|----------|--------------|--------------|
| Desktop | 800 × 600 | 4:3 |
| Tablet | 100% width, max 600h | 4:3 |
| Mobile | 100% width, dynamic h | 4:3 min height 280px |

Fixed aspect ratio prevents export distortion. Resize replays strokes from normalized store.

---

## Stroke Model

```typescript
interface Point {
  x: number;      // 0–1 normalized
  y: number;
  pressure: number; // 0–1, default 0.5 for mouse
}

interface Stroke {
  id: string;
  tool: 'brush' | 'eraser';
  color: string;    // hex from design tokens
  size: number;     // 1–32 logical px
  points: Point[];
  timestamp: number;
}
```

Strokes are **append-only** during drawing. Undo pops from stack; redo maintains separate stack.

---

## Tools

| Tool | Behavior | Default |
|------|----------|---------|
| **Brush** | Round cap/join, variable size | Size 4, color `#FFFFFF` (dark theme) |
| **Eraser** | `globalCompositeOperation = destination-out` | Size 12 |
| **Clear** | Clear all strokes (confirm dialog) | — |
| **Color picker** | Preset palette (8 colors) + custom | Palette from design tokens |
| **Brush size** | Slider 1–32 | 4 |

### Tool Palette Colors (Design Tokens)

```
canvas.brush.1 → canvas.brush.8
Defined in shared/config/canvas.config.ts — not hardcoded in components
```

---

## Undo / Redo

| Requirement | Implementation |
|-------------|----------------|
| Min stack depth | 20 strokes |
| Max stack depth | 50 strokes (memory cap) |
| Undo | Pop stroke → push to redo stack → replay canvas |
| Redo | Push stroke back → replay |
| Keyboard | `Ctrl/Cmd+Z` undo, `Ctrl/Cmd+Shift+Z` redo |
| Performance | Full replay from stroke array (< 50 strokes, < 5ms) |

**Optimization:** For > 50 strokes (post-MVP), use layer snapshots every N strokes.

---

## Layers (MVP Simplified)

| Layer | MVP | Post-MVP |
|-------|-----|----------|
| Single drawing layer | ✓ | — |
| Background layer (white/dark) | ✓ | — |
| Multi-layer support | — | Separate stroke arrays per layer |
| Layer visibility toggle | — | ✓ |

MVP uses a **single stroke layer** on themed background. Architecture allows `layers: Stroke[][]` extension.

---

## Pressure & Touch Support

### Pointer Events API

```typescript
// Unified handling
canvas.addEventListener('pointerdown', startStroke);
canvas.addEventListener('pointermove', extendStroke);
canvas.addEventListener('pointerup', endStroke);
canvas.addEventListener('pointercancel', endStroke);
```

| Input | Handling |
|-------|----------|
| Mouse | pressure = 0.5 fixed |
| Touch | pressure from Touch.force or 0.5; `touch-action: none` |
| Apple Pencil | `pointerType === 'pen'`, use `pressure`, `tiltX/Y` optional |
| Palm rejection | Only process primary pointer; ignore concurrent touches |

### Mobile UX

- Toolbar collapses to bottom sheet on `< md`
- Submit button sticky at bottom
- Prevent scroll/zoom during draw (`touch-action: none`, `user-scalable: no` on canvas container)

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Stroke render | < 16ms/frame (60fps) |
| Replay on resize | < 100ms for 50 strokes |
| Export | < 500ms on mid-tier mobile |
| Memory | < 10MB canvas state |
| Main thread | No blocking > 50ms |

### Optimizations

1. **RequestAnimationFrame** batching for live strokes
2. **Simplified points** — Douglas-Peucker simplification on stroke end (tolerance 1px)
3. **No React re-render per point** — imperative canvas drawing in ref
4. **Debounced autosave** — 2s after last stroke

---

## Export Pipeline

```
1. Replay all strokes to offscreen canvas at export resolution (800×600)
2. canvas.toBlob('image/webp', quality=0.85)
3. Validate blob size < 500KB
4. If too large → reduce quality iteratively (0.85 → 0.6)
5. If still too large → scale down to 640×480
6. Return Blob for multipart upload
```

### Export Format

| Property | Value |
|----------|-------|
| Format | WebP (fallback PNG if unsupported) |
| Max dimensions | 800 × 600 |
| Max file size | 500KB |
| Background | Themed canvas background color (not transparent) |

---

## Compression

| Stage | Method |
|-------|--------|
| Client | WebP quality tuning, dimension cap |
| Transport | gzip via HTTPS |
| Server | Cloudinary auto-optimization on upload |
| Storage | Cloudinary `f_auto,q_auto` delivery |

---

## Autosave (Draft Recovery)

```typescript
interface CanvasDraft {
  gameId: string;
  turnIndex: number;
  chainIndex: number;
  strokes: Stroke[];
  savedAt: number;
}
```

| Rule | Value |
|------|-------|
| Storage | `localStorage` key: `inkecho:draft:{gameId}:{chain}:{turn}` |
| Debounce | 2000ms after last stroke |
| TTL | Cleared on successful submit or game end |
| Restore | On mount, if matching turn → prompt "Restore draft?" |

---

## Empty Canvas Detection

Before submit:
```
1. Check strokes.length === 0 → block submit
2. Check all strokes erased (bounding box empty) → block submit
3. Timer expired → allow empty (auto-submit blank handled server-side)
```

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| Tool labels | ARIA labels on toolbar buttons |
| Keyboard | Shortcuts for undo, tools (B=brush, E=eraser) |
| Screen reader | Announce "Drawing turn, X seconds remaining" |
| High contrast | Tool focus rings; palette meets contrast requirements |
| Reduced motion | Disable stroke preview animations |

---

## Component Structure

```
features/canvas/
├── components/
│   ├── DrawingCanvas.tsx       # Canvas element + pointer handlers
│   ├── CanvasToolbar.tsx       # Tools UI
│   ├── ColorPicker.tsx
│   ├── BrushSizeSlider.tsx
│   └── DraftRestoreDialog.tsx
├── hooks/
│   ├── useCanvasEngine.ts      # Core drawing logic
│   ├── useCanvasUndoRedo.ts
│   ├── useCanvasExport.ts
│   └── useCanvasAutosave.ts
├── lib/
│   ├── stroke-renderer.ts      # Pure replay functions
│   ├── stroke-simplifier.ts
│   └── canvas-utils.ts
├── schemas/
│   └── canvas.schema.ts
└── types/
    └── canvas.types.ts
```

---

## Security Considerations

| Risk | Mitigation |
|------|------------|
| XSS via exported image | Server validates MIME; Cloudinary strips metadata |
| Oversized upload | Client + server size limits (2MB raw, 500KB target) |
| Canvas fingerprinting | Not applicable — no third-party canvas tracking |

---

## Testing Strategy

| Test | Tool |
|------|------|
| Stroke render unit | Vitest + mock canvas context |
| Undo/redo logic | Vitest |
| Export size | Vitest |
| Touch draw E2E | Playwright mobile emulation |
| Performance | Lighthouse + manual profiling |

---

## Related Documents

- Functional: FR-6 (Document 2)
- API submit drawing: Document 9
- Performance: Document 14
