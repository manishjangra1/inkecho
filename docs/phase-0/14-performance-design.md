# Document 14 — Performance Design

## Overview

InkEcho must feel instant on desktop and playable on mid-tier mobile devices during 60-second draw turns with realtime sync. Performance is designed into architecture, not bolted on later.

---

## Performance Budgets

| Metric | Budget | Measurement |
|--------|--------|-------------|
| LCP | < 2.5s | Lighthouse, Vercel Speed Insights |
| INP | < 200ms | Web Vitals |
| CLS | < 0.1 | Web Vitals |
| JS bundle (initial) | < 200KB gzip | `@next/bundle-analyzer` |
| API read P95 | < 200ms | Server timing headers |
| API write P95 | < 400ms | APM |
| Ably delivery P95 | < 500ms | Ably dashboard |
| Canvas frame time | < 16ms | Performance API |
| Drawing upload | < 2s on 4G | RUM |

---

## Frontend Performance

### Code Splitting

| Route | Strategy |
|-------|----------|
| `/` (landing) | Minimal JS; defer Framer Motion |
| `/room/[code]/lobby` | Load lobby feature chunk |
| `/room/[code]/game` | Lazy load canvas + game engine |
| `/profile` | Lazy load charts/history |

```typescript
const DrawingCanvas = dynamic(() => import('@/features/canvas'), {
  ssr: false,
  loading: () => <CanvasSkeleton />,
});
```

### React Optimizations

| Technique | Application |
|-----------|-------------|
| `React.memo` | Player list items, toolbar buttons |
| Stable callbacks | `useCallback` for canvas handlers |
| Selective Zustand | Slice subscriptions (`useShallow`) |
| Avoid re-renders | Canvas draws imperatively outside React |
| Virtualization | Public room list if > 50 items |

### Asset Optimization

| Asset | Strategy |
|-------|----------|
| Images | `next/image`, WebP/AVIF |
| Icons | Lucide tree-shake imports |
| Fonts | `next/font` with subset |
| Illustrations | SVG or optimized WebP lazy loaded |

### TanStack Query Caching

| Query | staleTime | gcTime |
|-------|-----------|--------|
| Room snapshot | 5s | 5min |
| Public rooms | 30s | 10min |
| Profile | 60s | 30min |
| Game state | 0 (event-driven) | 5min |

Realtime events invalidate queries; no polling during active game.

---

## Canvas Performance

See Document 12 for detail. Summary:

| Technique | Benefit |
|-----------|---------|
| Pointer events off React tree | 60fps drawing |
| RAF batching | Smooth strokes |
| Douglas-Peucker simplification | Smaller stroke data |
| Debounced autosave | No localStorage thrash |
| WebP export | 60–80% smaller than PNG |

---

## Backend Performance

### Serverless Considerations

| Challenge | Mitigation |
|-----------|------------|
| Cold starts | Keep functions warm via cron ping (optional); edge for static |
| Connection pooling | Prisma Data Proxy or `@prisma/extension-accelerate` |
| Large game documents | Embed turns (avoid N+1); cap chain count |
| Sequential writes | Single document update per turn |

### Database Query Optimization

| Query | Index | Target |
|-------|-------|--------|
| Room by code | `{ code: 1 }` unique | < 5ms |
| Active game | `{ roomId: 1, status: 1 }` | < 10ms |
| Public rooms | `{ status, visibility, lastActivityAt }` | < 50ms |
| Profile history | `{ userId, playedAt }` | < 20ms |

### N+1 Prevention

- Load game document once per action (embedded chains/turns)
- Batch participant lookup with `$in` query for lobby
- No separate turn collection in MVP

---

## Realtime Performance

| Strategy | Detail |
|----------|--------|
| Event payload size | < 2KB per event; no full game in events |
| Snapshot on reconnect only | Not on every turn |
| Timer sync | Client computes locally; server tick every 10s |
| Channel per room | Isolated fan-out; no global channels |
| Ably connection | Single connection per client; multiplex channels |

---

## Network Optimization

| Technique | Application |
|-----------|-------------|
| HTTP/2 | Vercel default |
| Compression | gzip/brotli automatic |
| Drawing upload | Compress before upload; max 500KB |
| Prefetch | `router.prefetch` for likely next routes |
| Service worker | Not in MVP (add for offline lobby later) |

---

## Rendering & Animation Performance

| Animation | Strategy |
|-----------|----------|
| Page transitions | Framer Motion with `layoutId` sparingly |
| Reveal sequence | CSS transforms (GPU); `will-change` during animation |
| Timer pulse | CSS animation; disabled with `prefers-reduced-motion` |
| Lobby list | Stagger children max 8 items |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Caching Strategy

```
Browser → CDN (static) → Vercel Edge → Serverless → MongoDB
                ↓
           Cloudinary CDN (drawings)
```

| Layer | Cache | TTL |
|-------|-------|-----|
| Static assets | CDN | 1 year (hashed) |
| API responses | No cache (private, dynamic) | — |
| Public room list | CDN stale-while-revalidate | 30s |
| Drawings | Cloudinary CDN | 90 days |
| Ably tokens | Client memory | 55 min |

---

## Load Testing Plan

| Scenario | Tool | Target |
|----------|------|--------|
| 100 concurrent rooms | k6 | P95 API < 400ms |
| 1000 room list reads | k6 | P95 < 200ms |
| 8 players × 100 rooms Ably | Ably load test | P95 delivery < 500ms |
| Drawing upload storm | k6 | No 5xx errors |

---

## Monitoring & Alerting

| Signal | Threshold | Action |
|--------|-----------|--------|
| API P95 latency | > 800ms for 5min | Page on-call |
| Error rate | > 1% | Alert |
| Ably connection failures | > 5% | Alert |
| LCP P75 | > 3s | Investigate |
| MongoDB slow queries | > 100ms | Review indexes |

Tools: Vercel Analytics, Sentry Performance, Ably dashboard, MongoDB Atlas profiler.

---

## Optimization Roadmap

### MVP

- Code splitting for canvas
- Prisma query indexes
- WebP export
- Zustand selective subscriptions

### Post-MVP

- OffscreenCanvas worker for drawing
- Edge caching for public room list
- Image CDN transformations
- Database read replicas
- Connection pooling via Prisma Accelerate

---

## Related Documents

- NFRs: Document 3
- Canvas: Document 12
- Deployment: Document 15
