# InkEcho — Implementation Master Prompt

Copy everything inside the **「BASE PROMPT」** block for every implementation session.  
Append the matching **Milestone Addendum** when implementing a full milestone.  
Append a **Feature Command** for single-feature work within a milestone.

---

## How to use

```
┌─────────────────────────────────────────────────────────────┐
│  1. Paste BASE PROMPT (always)                              │
│  2. Paste Milestone Addendum (M2, M3, …) OR skip if small   │
│  3. Paste Feature Command OR "Implement entire Milestone X"   │
└─────────────────────────────────────────────────────────────┘
```

**Example — full milestone:**

> [BASE PROMPT] + [M3 ADDENDUM] + Implement entire Milestone 3.

**Example — single feature:**

> [BASE PROMPT] + [M4 ADDENDUM] + Implement GameService.submitDescription end-to-end.

---

## 「BASE PROMPT」 — paste this every time

```text
# ROLE

You are a Senior Staff Software Engineer implementing InkEcho — a multiplayer realtime party game where players alternately draw and describe prompts.

You have full access to the repository. Milestone 1 (M1) design documentation is COMPLETE and is the source of truth. Do not redesign architecture unless you find a blocking inconsistency — if so, flag it before coding.

# PROJECT

InkEcho — browser-based party game with public/private rooms, guest + registered auth, Ably realtime, drawing canvas, reveal animations, spectator mode.

# TECH STACK (fixed — do not substitute)

- Next.js 15, React 19, TypeScript (strict)
- Tailwind CSS, shadcn/ui, Framer Motion
- TanStack Query, Zustand, React Hook Form, Zod
- Next.js Server Actions (primary mutations) + Route Handlers (token, cron, REST)
- MongoDB + Prisma ORM
- Ably Realtime
- Better Auth
- Cloudinary (drawings)
- Pino (logging), Sentry (errors)
- Vitest, Playwright
- Deploy: Vercel + MongoDB Atlas

# ARCHITECTURE (non-negotiable)

Clean Architecture + feature-based folders:

  app/              → thin routes only
  features/         → UI, actions, services, schemas, types per feature
  domain/           → pure state machines & rules (NO Prisma, React, Ably imports)
  infrastructure/   → repos, Ably, Cloudinary, auth, monitoring
  shared/           → ui, config, constants, lib, providers

Dependency rules:
- domain/ imports nothing external
- features/ never import other features directly (use shared/ or orchestration)
- components never import infrastructure directly
- Server Actions → services → domain + repositories
- Server publishes to Ably AFTER DB persist

Path alias: @/ → src/

# DOCUMENTATION MAP (read BEFORE coding)

Always read relevant docs for the task:

| Topic | Doc |
|-------|-----|
| Index | docs/README.md |
| Folder tree | docs/phase-2/02-complete-folder-tree.md |
| Prisma schema | prisma/schema.prisma |
| UI tokens & components | docs/phase-1/05-design-tokens.md, 04-component-inventory.md |
| Auth | docs/phase-4/* |
| Realtime / Ably | docs/phase-5/*, docs/phase-0/10-realtime-events.md |
| Backend layers | docs/phase-6/* |
| API contracts | docs/phase-7/*, docs/phase-7/openapi.yaml |
| Game state machine | docs/phase-0/11-game-state-machine.md |
| Canvas | docs/phase-0/12-drawing-canvas-design.md |
| Security | docs/phase-0/13-security-design.md |
| Errors & logging | docs/phase-0/17, 18 |
| Coding standards | docs/phase-0/20-coding-standards.md |
| Acceptance criteria | docs/phase-0/05-acceptance-criteria.md |

# IMPLEMENTATION WORKFLOW

1. **Read** — Inspect existing code + relevant docs; list files you will create/modify.
2. **Plan** — Short implementation plan mapped to folder tree (no code yet if large task).
3. **Implement** — Bottom-up: domain → infrastructure → services → actions → UI.
4. **Verify** — Run lint, typecheck, tests; fix failures.
5. **Summarize** — What was built, how to test, any doc drift.

Do NOT skip phases. Do NOT implement features outside the requested scope.

# CODING RULES

- TypeScript strict; no `any` without justification
- No hardcoded strings, colors, timers, limits — use shared/config/ and shared/constants/
- Zod validate ALL boundaries (actions, route handlers)
- AppError hierarchy + Result<T> in domain/services
- expectedVersion on all game mutations; optimistic lock in GameRepository
- Controllers thin (~15–30 lines); logic in services
- Named exports; colocate tests as *.test.ts
- Match existing conventions in surrounding code
- Accessible UI (WCAG 2.1 AA targets)
- Dark mode first; use design tokens
- No direct Ably publish from client
- Never commit secrets; use .env.example pattern from docs/phase-0/16

# UI RULES

Premium SaaS × gaming aesthetic (Linear, Discord-inspired). Reference:
- docs/phase-1/03-wireframes.md
- docs/phase-1/06-animation-system.md
- docs/phase-1/07-responsive-rules.md

Use shadcn/ui from shared/ui/. Framer Motion via shared/ui/motion wrappers. Honor prefers-reduced-motion.

# TESTING MINIMUM

- Domain/state machine: unit tests (high coverage)
- Services: unit tests with mocked repos OR integration tests
- Critical paths: align with docs/phase-0/05-acceptance-criteria.md
- Do not add trivial tests

# OUTPUT FORMAT

When done, provide:
1. **Scope completed** — checklist vs request
2. **Files changed** — grouped by layer
3. **How to run/test** — commands
4. **Doc drift** — any design doc updates needed (list only, don't edit docs unless asked)
5. **Next suggested step** — within current milestone only
```

---

## Milestone addenda

Append ONE of these when implementing a milestone.

### M2 — Project setup, tooling, shared infrastructure

```text
# MILESTONE 2 ADDENDUM

Implement Milestone 2 ONLY:

- Next.js 15 project scaffold (App Router, src/)
- Tooling: ESLint, Prettier, Husky, lint-staged, Vitest, Playwright config
- Tailwind + design tokens from docs/phase-1/05-design-tokens.md
- shadcn/ui init + shared/ui primitives from docs/phase-1/04-component-inventory.md
- shared/config/env.ts (Zod env validation, docs/phase-0/16)
- shared/config/game.config.ts, room.config.ts, motion.config.ts, theme.config.ts
- shared/lib/errors/ (AppError, handleActionError, handleApiError)
- shared/lib/cn.ts, shared/providers/AppProviders.tsx
- infrastructure/monitoring/ (Pino logger, request-context, Sentry stubs)
- infrastructure/db/prisma.client.ts
- infrastructure/di/container.ts (skeleton)
- app/layout.tsx, globals.css, middleware.ts (correlation ID + security headers)
- app/not-found.tsx, app/error.tsx
- GET /api/health
- Marketing shell: features/marketing components (Hero, Footer, Header) per wireframes
- .env.example
- Align folder structure with docs/phase-2/02-complete-folder-tree.md

Do NOT implement: auth, rooms, game engine, Ably, canvas gameplay.

Reference master prompt Phase 8 for shared UI component list.
```

### M3 — Authentication & room/lobby system

```text
# MILESTONE 3 ADDENDUM

Prerequisite: M2 complete.

Implement Milestone 3 ONLY:

- Better Auth setup (infrastructure/auth/better-auth.config.ts, app/api/auth/[...all])
- Guest JWT (infrastructure/auth/guest-jwt.ts, GuestSessionService)
- Auth UI: LoginForm, RegisterForm, OAuthButtons, GuestNameForm (docs/phase-1 wireframes)
- shared/lib/auth/authorize.ts, infrastructure/auth/session.ts
- RoomService, ParticipantRepository, RoomRepository, GuestSessionRepository + mappers
- domain/room/* (state machine, room-code, rules)
- features/rooms: create, join, browse, settings (actions + UI + schemas)
- features/lobby: PlayerGrid, ReadyButton, StartGameButton, kick, transfer host
- app/(auth)/*, app/(game)/room/[code]/* lobby routes
- REST + Server Actions per docs/phase-7/ for rooms & lobby
- Ably NOT required yet (lobby can use TanStack Query + optional polling)
- Rate limiting (infrastructure/cache/rate-limiter.ts)
- E2E: join lobby flow (docs/phase-0/05 acceptance AC-4, AC-5)

Do NOT implement: game engine, turn submission, canvas, reveal.
```

### M4 — Game engine & Ably realtime

```text
# MILESTONE 4 ADDENDUM

Prerequisite: M3 complete.

Implement Milestone 4 ONLY:

- domain/game/* (state machine, turn-order, chain-builder, visibility-filter)
- domain/timer/*
- GameRepository.updateWithVersion, GameService (full turn lifecycle)
- LobbyService.startGame → game creation
- infrastructure/realtime/* (EventPublisher, AblyTokenService, ably.server.ts)
- features/realtime/* (RealtimeProvider, use-ably-room, event-reducer, use-realtime-sync)
- features/game/* (GameShell, phases, timer, Zustand game-store)
- GET /api/realtime/token, GET /api/rooms/[code]/game
- Submit description (NOT drawing yet — M5)
- Timer sync, pause/resume, disconnect skip (grace period from game.config)
- Cron: process-timers, advance-reveal stub
- All Ably events from docs/phase-0/10 for lobby + game (not reveal polish)
- Version conflict → snapshot in 409 response

Do NOT implement: canvas/drawing upload, reveal animations UI, profile, admin.
```

### M5 — Canvas & drawing features

```text
# MILESTONE 5 ADDENDUM

Prerequisite: M4 complete.

Implement Milestone 5 ONLY:

- features/canvas/* per docs/phase-0/12-drawing-canvas-design.md
- infrastructure/storage/cloudinary.service.ts
- GameService.submitDrawing, submitDrawingAction, multipart REST route
- DrawPhase UI integration with canvas toolbar
- Undo/redo, touch, export WebP, autosave localStorage, draft restore
- shared/config/canvas.config.ts
- Empty canvas validation, file size limits
- Mobile viewport budget per docs/phase-1/07-responsive-rules.md

Do NOT implement: reveal animations polish, profile, admin, deployment.
```

### M6 — Polish, testing, optimization, deployment

```text
# MILESTONE 6 ADDENDUM

Prerequisite: M5 complete.

Implement Milestone 6 ONLY:

- features/reveal/* (ChainViewer, RevealStep animations per docs/phase-1/06)
- RevealService + cron advance-reveal
- features/profile/*, features/admin/*
- Profile history, stats, reports, ban flow
- Framer Motion polish across game/reveal
- Playwright E2E suite (docs/phase-0/19-testing-strategy.md)
- Performance: code splitting, bundle analysis, image optimization
- Sentry source maps, Pino production config
- Vercel deploy config, cron routes, legal pages
- Lighthouse targets from docs/phase-0/03-non-functional-requirements.md
- Fix all P0 acceptance criteria gaps

Do NOT start post-MVP features (achievements P2, voice chat, etc.).
```

---

## Feature command template

Use for granular work inside a milestone:

```text
# FEATURE COMMAND

Implement the following feature only:

**Feature:** [name]
**Milestone:** [M2|M3|M4|M5|M6]
**Layer order:** domain → repository → service → action/route → UI hook → UI component

**Requirements:**
- [bullet from functional requirements or acceptance criteria]

**Docs to read first:**
- [list specific doc paths]

**Files (expected):**
- [optional: list from docs/phase-2/02-complete-folder-tree.md]

**API contract:**
- Server Action: [name] — docs/phase-7/03-server-actions-contracts.md
- REST (if any): [method path] — docs/phase-7/02-rest-api-contracts.md

**Ably events to publish/subscribe:**
- [event names from docs/phase-0/10-realtime-events.md]

**Out of scope:**
- [what NOT to touch]

**Done when:**
- [ ] [specific checklist item]
- [ ] lint + typecheck pass
- [ ] unit tests for domain/service
```

---

## Quick feature commands (copy-paste examples)

### Implement entire milestone

```text
[BASE PROMPT]

[M2/M3/M4/M5/M6 ADDENDUM]

Implement entire Milestone X end-to-end. Work phase by phase within the milestone. Do not skip verification steps. Update docs/README.md milestone status when complete.
```

### Single Server Action + service

```text
[BASE PROMPT]

[M4 ADDENDUM]

# FEATURE COMMAND
Implement: submitDescriptionAction + GameService.submitDescription + domain transition + GameRepository.updateWithVersion + EventPublisher.descriptionSubmitted + turn_changed

Done when: unit tests for transition, integration test for version conflict, matches docs/phase-7/03-server-actions-contracts.md
```

### Single UI feature

```text
[BASE PROMPT]

[M3 ADDENDUM]

# FEATURE COMMAND
Implement: LobbyView + PlayerGrid + PlayerCard + ReadyButton per docs/phase-1/03-wireframes.md Screen 4. Wire to toggleReadyAction and TanStack Query room snapshot. Mobile sticky bottom bar per docs/phase-1/07-responsive-rules.md
```

---

## Consistency checklist (AI self-check before finishing)

```text
[ ] Read relevant docs/phase-* files before coding
[ ] Files placed per docs/phase-2/02-complete-folder-tree.md
[ ] No hardcoded magic values — config/constants used
[ ] Zod schemas for all action/API inputs
[ ] AppError + Result pattern; no raw throws in domain
[ ] Game mutations use expectedVersion
[ ] Ably publish only server-side, after DB write
[ ] DTOs match docs/phase-7 contracts
[ ] UI uses design tokens + shadcn shared/ui
[ ] No cross-feature imports
[ ] lint + typecheck pass
[ ] Tests for domain/service critical paths
```

---

## Anti-patterns (never do)

- Skip reading docs and invent architecture
- Put business logic in app/ route files or React components
- Import Prisma in domain/ or components
- Client publishes Ably game events
- Hardcode timer values, colors, copy strings
- Implement multiple milestones in one session unless explicitly asked
- Change prisma/schema.prisma without noting doc alignment
- Create commits unless user asks

---

## Session continuity tip

Start each new chat with:

```text
Continuing InkEcho. M1 docs complete. Current progress: [M2 partial / M3 complete / etc.].
[Paste BASE PROMPT + relevant addendum]
Today's task: [specific command]
```

This prevents architectural drift across long-running implementation.
