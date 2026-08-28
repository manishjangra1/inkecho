# Document 3 — Non-Functional Requirements

## Overview

Non-functional requirements (NFRs) define **how well** InkEcho must perform. All NFRs are measurable and testable.

---

## NFR-1: Performance

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| NFR-1.1 | Initial page load (LCP) | < 2.5s on 4G | Lighthouse, RUM |
| NFR-1.2 | Time to Interactive | < 3.5s | Lighthouse |
| NFR-1.3 | API P95 latency (read) | < 200ms | APM / Vercel Analytics |
| NFR-1.4 | API P95 latency (write) | < 400ms | APM |
| NFR-1.5 | Realtime event delivery P95 | < 500ms | Ably metrics |
| NFR-1.6 | Canvas stroke render | < 16ms/frame (60fps) | Performance API |
| NFR-1.7 | Drawing upload size | < 500KB compressed | Cloudinary metrics |
| NFR-1.8 | Room list query | < 100ms P95 | DB profiling |

---

## NFR-2: Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-2.1 | Concurrent active rooms | 1,000+ (horizontal via serverless) |
| NFR-2.2 | Players per room | Up to 12 players + 20 spectators |
| NFR-2.3 | Ably channel fan-out | Per-room isolation; no global broadcast |
| NFR-2.4 | Database connections | Pooled via Prisma; serverless-friendly |
| NFR-2.5 | Stateless API handlers | No in-memory room state on server |

---

## NFR-3: Availability & Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-3.1 | Uptime SLA (production) | 99.9% monthly |
| NFR-3.2 | Graceful degradation if Ably unavailable | Queue + retry; show banner |
| NFR-3.3 | Graceful degradation if Cloudinary unavailable | Block submit; allow retry |
| NFR-3.4 | Zero data loss on submitted turns | Persist before ACK to client |
| NFR-3.5 | Idempotent turn submission | Duplicate submits ignored |

---

## NFR-4: Security

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-4.1 | All inputs validated with Zod | 100% API/action coverage |
| NFR-4.2 | HTTPS only | HSTS enabled |
| NFR-4.3 | Rate limiting on auth & room create | Per IP + per user |
| NFR-4.4 | Ably token scoped to room + capabilities | Least privilege |
| NFR-4.5 | No secrets in client bundle | Env audit in CI |
| NFR-4.6 | OWASP Top 10 mitigations documented | See Document 13 |

---

## NFR-5: Maintainability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-5.1 | Feature-based folder structure | Enforced via lint rules |
| NFR-5.2 | TypeScript strict mode | No `any` without justification |
| NFR-5.3 | Test coverage (critical paths) | ≥ 80% game engine & auth |
| NFR-5.4 | Cyclomatic complexity per function | ≤ 10 (warn), ≤ 15 (fail CI) |
| NFR-5.5 | Documentation for public APIs | OpenAPI-style in Document 9 |

---

## NFR-6: Usability & Accessibility

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-6.1 | WCAG 2.1 AA for core flows | axe-core CI gate |
| NFR-6.2 | Color contrast ratio | ≥ 4.5:1 text, ≥ 3:1 UI |
| NFR-6.3 | Touch target size | ≥ 44×44px |
| NFR-6.4 | Screen reader labels on interactive elements | 100% components |
| NFR-6.5 | Reduced motion support | `prefers-reduced-motion` honored |

---

## NFR-7: Compatibility

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-7.1 | Browsers | Chrome, Firefox, Safari, Edge (last 2 versions) |
| NFR-7.2 | Mobile | iOS Safari 16+, Chrome Android 12+ |
| NFR-7.3 | Viewports | 320px minimum width |
| NFR-7.4 | Offline | Lobby cached read-only; game requires connection |

---

## NFR-8: Observability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-8.1 | Structured logging (Pino) | JSON in production |
| NFR-8.2 | Error tracking (Sentry) | 100% unhandled exceptions |
| NFR-8.3 | Correlation IDs | All requests & game actions |
| NFR-8.4 | Key business metrics | Rooms created, games started, completion rate |
| NFR-8.5 | Alerting on error rate spike | > 1% over 5 min |

---

## NFR-9: Data Management

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-9.1 | Guest session TTL | 24 hours |
| NFR-9.2 | Inactive room TTL | 2 hours (configurable) |
| NFR-9.3 | Soft delete for users | 30-day retention |
| NFR-9.4 | Game history retention | Indefinite for registered; none for guests |
| NFR-9.5 | Drawing asset TTL | 90 days unless pinned to history |

---

## NFR-10: Deployment & DevOps

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-10.1 | CI pipeline | Lint, typecheck, test on every PR |
| NFR-10.2 | Preview deployments | Per PR on Vercel |
| NFR-10.3 | Zero-downtime deploys | Vercel rolling |
| NFR-10.4 | Database migrations | Prisma migrate; backward compatible |
| NFR-10.5 | Rollback capability | < 5 min via Vercel promote |

---

## NFR-11: Localization (Future)

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-11.1 | i18n-ready copy | Externalized strings MVP |
| NFR-11.2 | RTL support | Post-MVP |
| NFR-11.3 | Locale-aware dates/numbers | Post-MVP |

---

## NFR-12: Legal & Compliance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-12.1 | Privacy policy & ToS pages | Required before public launch |
| NFR-12.2 | Cookie consent where applicable | GDPR-friendly |
| NFR-12.3 | COPPA — no under-13 registration | Age gate on signup |
| NFR-12.4 | Content reporting workflow | FR-12.1 |

---

## Tradeoffs

| Decision | Benefit | Cost |
|----------|---------|------|
| Serverless (Vercel) | Auto-scale, low ops | Cold starts; no sticky sessions |
| MongoDB | Flexible game documents | Relational queries harder |
| Ably managed realtime | Reliability, presence | Vendor cost at scale |
| Server-authoritative game | Cheat resistance | Higher server load |
| Cloudinary for drawings | CDN, transforms | External dependency |

---

## Verification Matrix

| NFR Category | Verification Method |
|--------------|---------------------|
| Performance | Lighthouse CI, k6 load tests |
| Security | OWASP ZAP, dependency audit |
| Accessibility | axe-playwright |
| Reliability | Chaos testing (Ably disconnect) |
| Scalability | Load test 1k concurrent rooms |
