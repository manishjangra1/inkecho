# Document 19 — Testing Strategy

## Overview

InkEcho uses a **testing pyramid**: many unit tests, focused integration tests, critical-path E2E tests, and targeted load/realtime tests. All tests run in CI before deploy.

**Tools:** Vitest, Playwright, Testing Library, MSW (optional), k6 (load)

---

## Testing Pyramid

```
                    ┌─────────┐
                    │  E2E    │  ~15 scenarios
                    │Playwright│
                   ┌┴─────────┴┐
                   │ Integration│  ~40 tests
                   │  Vitest    │
                  ┌┴───────────┴┐
                  │    Unit     │  ~200 tests
                  │   Vitest    │
                  └─────────────┘

        Load (k6) ──────► Periodic / pre-release
        Realtime ───────► Integration + manual chaos
```

---

## Coverage Targets

| Area | Target | Priority |
|------|--------|----------|
| Game state machine | 100% transitions | P0 |
| Domain services | ≥ 90% | P0 |
| Auth flows | ≥ 80% | P0 |
| API Route Handlers | ≥ 70% | P1 |
| React components | ≥ 60% | P1 |
| Canvas engine | ≥ 80% | P0 |
| UI pages | E2E critical paths | P0 |

---

## Unit Tests (Vitest)

### Scope

| Module | Tests |
|--------|-------|
| `game/state-machine` | Every valid/invalid transition |
| `game/turn-manager` | Order, phase alternation, chain completion |
| `game/timer-engine` | Remaining time, pause/resume, expiry |
| `rooms/code-generator` | Uniqueness, format |
| `canvas/stroke-renderer` | Replay, bounds, simplification |
| `canvas/undo-redo` | Stack operations |
| `shared/lib/errors` | Error mapping |
| `validation schemas` | Zod edge cases |

### Example

```typescript
describe('transitionGame', () => {
  it('rejects describe submit when not active player', () => {
    const result = transitionGame(activeGame, {
      type: 'SUBMIT_DESCRIPTION',
      text: 'hello',
      playerId: 'wrong-player',
    });
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('NOT_YOUR_TURN');
  });
});
```

### Conventions

- Co-locate: `foo.ts` → `foo.test.ts`
- Pure domain tests — no DB, no network
- Use factories: `createMockGame()`, `createMockRoom()`
- Fast: entire unit suite < 30s

---

## Integration Tests (Vitest)

### Scope

| Integration | Setup |
|-------------|-------|
| Repositories + MongoDB | Test container or in-memory MongoDB |
| Server Actions | Mock auth context + test DB |
| Ably publish | Mock Ably REST client |
| Cloudinary upload | Mock upload service |
| Rate limiting | Mock Redis |

### Example Scenarios

```
- Create room → join 3 players → all ready → start game
- Submit description → verify DB + mock Ably publish called
- Version conflict → second submit returns 409
- Guest session expiry → join rejected
- Kick player → participant removed
```

### Database

```typescript
// tests/setup/db.ts
beforeEach(async () => {
  await prisma.game.deleteMany();
  await prisma.room.deleteMany();
});
```

Use dedicated `DATABASE_URL` for test (`inkecho_test`).

---

## E2E Tests (Playwright)

### Critical Paths (P0)

| ID | Scenario |
|----|----------|
| E2E-1 | Landing → create room → lobby visible |
| E2E-2 | Join room by code as guest |
| E2E-3 | 3 players ready → start game |
| E2E-4 | Describe turn → submit → next player sees draw phase |
| E2E-5 | Draw turn → submit drawing → turn advances |
| E2E-6 | Game completes → reveal animation plays |
| E2E-7 | Player disconnect → reconnect → restored |
| E2E-8 | Host kicks player → player redirected |
| E2E-9 | Spectator joins mid-game |
| E2E-10 | Register → login → profile visible |

### Setup

```typescript
// playwright.config.ts
projects: [
  { name: 'chromium' },
  { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
],
```

### Multi-Player E2E

```typescript
test('full game flow', async ({ browser }) => {
  const host = await browser.newPage();
  const p2 = await browser.newPage();
  const p3 = await browser.newPage();
  // ... parallel player actions
});
```

### CI

- Run against Vercel preview URL or local `pnpm dev`
- Record trace on failure
- Retry flaky tests once (realtime tolerance)

---

## Realtime Tests

### Automated

| Test | Method |
|------|--------|
| Event envelope shape | Unit test serializers |
| Version ordering | Integration: publish sequence |
| Reconnect snapshot | Integration: simulate gap |
| Token scoping | API test: non-member denied |

### Manual Chaos Testing

| Scenario | Expected |
|----------|----------|
| Kill Ably connection mid-turn | Reconnect banner; resume |
| Delay Ably 2s | UI stays consistent after sync |
| Two submits same turn | One wins; other gets 409 |
| Server deploy mid-game | Clients reconnect; state preserved |

---

## Load Tests (k6)

### Scenarios

```javascript
// tests/load/room-create.js
export default function () {
  http.post(`${BASE_URL}/api/rooms`, { ... });
  sleep(1);
}

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<400'],
    http_req_failed: ['rate<0.01'],
  },
};
```

| Test | Target |
|------|--------|
| Room create storm | 100 VUs, P95 < 400ms |
| Public room list | 200 RPS, P95 < 200ms |
| Turn submit | 50 rooms × 8 players |

Run pre-release or weekly — not every PR.

---

## Canvas Tests

| Test | Type |
|------|------|
| Stroke capture | Unit |
| Undo/redo stack | Unit |
| Export blob size | Unit (< 500KB) |
| Empty canvas detection | Unit |
| Touch drawing | Playwright mobile |
| Performance 50 strokes | Unit (< 100ms replay) |

Mock canvas context for unit tests:

```typescript
const ctx = {
  beginPath: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  // ...
};
```

---

## Auth Tests

| Test | Type |
|------|------|
| Email signup/login | E2E |
| OAuth callback | Integration (mock provider) |
| Guest session JWT | Unit (sign/verify/expiry) |
| Protected route redirect | E2E |
| Banned user blocked | Integration |

---

## Accessibility Tests

| Tool | Scope |
|------|-------|
| axe-playwright | Landing, lobby, game, profile |
| Manual | Screen reader spot check |

CI gate: zero critical axe violations on P0 pages.

---

## Test Data & Factories

```
tests/
├── factories/
│   ├── room.factory.ts
│   ├── game.factory.ts
│   └── user.factory.ts
├── fixtures/
│   ├── sample-drawing.webp
│   └── prompts.json
├── setup/
│   ├── db.ts
│   └── vitest.setup.ts
└── e2e/
    ├── game-flow.spec.ts
    └── auth.spec.ts
```

---

## CI Pipeline

```yaml
# PR checks
- pnpm lint
- pnpm typecheck
- pnpm test          # Vitest unit + integration
- pnpm test:e2e      # Playwright (on preview deploy)

# Nightly
- pnpm test:load     # k6
- axe full scan
```

---

## Mocking Strategy

| Dependency | Unit | Integration | E2E |
|------------|------|-------------|-----|
| MongoDB | Mock repo | Real test DB | Real test DB |
| Ably | Mock | Mock REST | Real Ably dev app |
| Cloudinary | Mock | Mock | Mock or test cloud |
| Auth | Mock session | Test auth helper | Real auth |
| Timer | Fake timers | Fake timers | Real (short timers in test env) |

Test env overrides:

```bash
# .env.test
GUEST_SESSION_TTL_HOURS=1
GAME_DESCRIBE_TIMER_SEC=10
GAME_DRAW_TIMER_SEC=15
```

---

## Definition of Test Done

- [ ] New domain logic has unit tests
- [ ] New API endpoints have integration tests
- [ ] Critical UI flows have E2E coverage
- [ ] No regression in coverage for game engine
- [ ] All tests pass in CI
- [ ] Flaky tests quarantined or fixed within 48h

---

## Related Documents

- Acceptance criteria: Document 5
- Game state machine: Document 11
- CI/CD: Document 15
