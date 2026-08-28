# Document 20 — Coding Standards

## Overview

These standards ensure InkEcho remains consistent, maintainable, and scalable across contributors and AI-assisted development. All code is **TypeScript strict**, **feature-based**, and follows **SOLID**, **DRY**, and **KISS**.

---

## General Principles

| Principle | Rule |
|-----------|------|
| **SOLID** | Single responsibility per module; depend on abstractions |
| **DRY** | Extract shared logic after second duplication |
| **KISS** | Simplest solution that meets requirements |
| **Clean Architecture** | Domain pure; infrastructure at edges |
| **No hardcoding** | Use config, constants, env vars |
| **Composition** | Prefer composition over inheritance |
| **Immutability** | Prefer readonly; immutable state updates |

---

## TypeScript

```json
// tsconfig.json (strict)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "exactOptionalPropertyTypes": true
  }
}
```

| Rule | Detail |
|------|--------|
| No `any` | Use `unknown` + narrow; eslint `@typescript-eslint/no-explicit-any: error` |
| Explicit return types | Required on exported functions |
| Enums vs unions | Prefer `as const` objects + derived types |
| Type imports | `import type { Foo }` for type-only |
| Null handling | Use optional chaining; avoid non-null assertion (`!`) |

```typescript
// Prefer
export const GAME_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  PAUSED: 'PAUSED',
} as const;

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];
```

---

## Naming Conventions

| Entity | Convention | Example |
|--------|------------|---------|
| Files (components) | PascalCase | `DrawingCanvas.tsx` |
| Files (utils/hooks) | kebab-case or camelCase | `use-canvas-engine.ts` |
| Components | PascalCase | `RoomLobby` |
| Hooks | camelCase, `use` prefix | `useGameState` |
| Server Actions | camelCase, `Action` suffix | `joinRoomAction` |
| Services | PascalCase + `Service` | `GameService` |
| Repositories | PascalCase + `Repository` | `GameRepository` |
| Schemas (Zod) | camelCase + `Schema` | `createRoomSchema` |
| Types | PascalCase | `GameSnapshot` |
| Constants | SCREAMING_SNAKE in config | `MAX_PLAYERS` |
| Ably events | snake_case | `player_joined` |
| Error codes | SCREAMING_SNAKE | `ROOM_NOT_FOUND` |
| DB fields | camelCase | `turnEndsAt` |
| CSS variables | kebab-case | `--color-primary` |

---

## Folder Rules

### Feature-Based Structure

```
src/
├── app/                    # Next.js App Router (thin — delegates to features)
├── features/
│   └── [feature]/
│       ├── components/     # Feature UI only
│       ├── hooks/          # Feature hooks
│       ├── actions/        # Server Actions
│       ├── services/       # Application services
│       ├── repositories/   # Data access (if feature-specific)
│       ├── schemas/        # Zod schemas
│       ├── types/          # Feature types
│       ├── lib/            # Pure helpers
│       └── index.ts        # Public API barrel (optional)
├── shared/
│   ├── ui/                 # shadcn + shared components
│   ├── lib/                # Cross-feature utilities
│   ├── config/             # App configuration
│   ├── constants/          # Copy strings, enums
│   └── types/              # Shared types
├── domain/                 # Pure game/room domain logic
└── infrastructure/
    ├── db/                 # Prisma client, repositories
    ├── realtime/           # Ably client/server
    ├── storage/            # Cloudinary
    └── monitoring/         # Pino, Sentry
```

### Rules

| Rule | Detail |
|------|--------|
| Max component size | ~150 lines; split if larger |
| No cross-feature imports | Import via feature public API or `shared/` |
| Colocate tests | `foo.test.ts` next to `foo.ts` |
| No business logic in `app/` | Route files delegate to features |
| `domain/` has zero imports from infrastructure | Enforced by eslint boundary rules |

---

## Components

```typescript
// ✅ Good — typed props, single responsibility
interface PlayerCardProps {
  player: RoomParticipant;
  isHost?: boolean;
  onKick?: (playerId: string) => void;
}

export function PlayerCard({ player, isHost, onKick }: PlayerCardProps) {
  // ...
}
```

| Rule | Detail |
|------|--------|
| Props interface | Named `[Component]Props` |
| Default export | Avoid — use named exports |
| Client directive | `'use client'` only when needed |
| Server components | Default; fetch data at route level |
| Styling | Tailwind + `cn()` utility; no inline styles |

---

## Hooks

```typescript
// hooks/use-game-state.ts
export function useGameState(roomCode: string) {
  const store = useGameStore(useShallow(selectGameSlice));
  // ...
  return { game: store, submitDescription, isLoading };
}
```

| Rule | Detail |
|------|--------|
| One concern per hook | `useCanvasEngine`, not `useEverything` |
| Return stable shape | Object return, not array (except low-level) |
| Side effects | `useEffect` minimal; prefer event handlers |
| Server data | TanStack Query for fetch; Zustand for realtime UI state |

---

## Services

```typescript
// features/game/services/game.service.ts
export class GameService {
  constructor(
    private readonly gameRepo: GameRepository,
    private readonly realtime: RealtimePublisher,
    private readonly logger: Logger,
  ) {}

  async submitDescription(input: SubmitDescriptionDto): Promise<Result<GameSnapshot>> {
    // orchestrate domain + persist + publish
  }
}
```

| Rule | Detail |
|------|--------|
| Application services | Orchestrate; no HTTP concerns |
| Domain logic | Stays in `domain/` pure functions |
| DI | Constructor injection; factory in infrastructure |
| Single public method per use case | `submitDescription`, not generic `update` |

---

## DTOs & Schemas

```typescript
// schemas/create-room.schema.ts
export const createRoomSchema = z.object({
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  settings: roomSettingsSchema.partial().optional(),
});

export type CreateRoomDto = z.infer<typeof createRoomSchema>;
```

| Rule | Detail |
|------|--------|
| Validate at boundary | Server Actions, Route Handlers |
| DTO naming | `[Action]Dto` |
| Response types | `[Action]Response` separate from DTO |
| No duplicate schemas | Share between client/server from `schemas/` |

---

## Types

```typescript
// types/game.types.ts
export interface GameSnapshot {
  gameId: string;
  status: GameStatus;
  version: number;
  currentTurn: TurnSnapshot;
}
```

| Rule | Detail |
|------|--------|
| `interface` vs `type` | `interface` for object shapes; `type` for unions |
| Avoid enum keyword | Use const objects |
| Shared types | `shared/types/` |
| Feature types | `features/[x]/types/` |
| Prisma types | Re-export or map to domain types at repo boundary |

---

## Imports

```typescript
// Order (eslint-plugin-import)
import { useState } from 'react';                    // 1. External
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/shared/ui/button';          // 2. Internal absolute
import { useGameState } from '@/features/game/hooks';

import { PlayerCard } from './PlayerCard';            // 3. Relative
```

| Rule | Detail |
|------|--------|
| Path alias | `@/` → `src/` |
| No deep relative | `../../../` — use alias |
| Barrel exports | Sparingly; avoid circular deps |
| Feature public API | Export from `features/game/index.ts` if needed |

---

## Server Actions vs Route Handlers

| Use Server Action | Use Route Handler |
|-------------------|-------------------|
| Form mutations from UI | Ably token endpoint |
| Typed client-server contract | Webhooks |
| Internal app operations | Health check |
| | Public REST API |
| | Cron jobs |

---

## State Management

| State Type | Tool |
|------------|------|
| Server/cache | TanStack Query |
| Realtime game UI | Zustand |
| Form | React Hook Form |
| URL state | `nuqs` or searchParams |
| Theme | next-themes |

---

## Styling & Design Tokens

```typescript
// shared/config/theme.config.ts — colors referenced in tailwind.config.ts
export const THEME = {
  colors: {
    primary: 'hsl(var(--primary))',
    // ...
  },
  spacing: { /* ... */ },
  animation: { /* ... */ },
} as const;
```

| Rule | Detail |
|------|--------|
| No hardcoded colors | Design tokens only |
| No magic numbers | Spacing from scale |
| Responsive | Mobile-first Tailwind breakpoints |
| shadcn/ui | Extend, don't fork unnecessarily |

---

## Error & Logging

- Throw `AppError` subclasses in application layer only
- Domain returns `Result` — never throws
- Always include `correlationId` in server logs
- Never `console.log` in production server code — use Pino

---

## Git & Code Review

| Rule | Detail |
|------|--------|
| Branch naming | `feature/`, `fix/`, `chore/` |
| Commit messages | Conventional commits: `feat:`, `fix:`, `docs:` |
| PR size | < 400 lines preferred |
| Required checks | Lint, typecheck, test |
| Review focus | Architecture, security, tests |

---

## ESLint & Prettier

```javascript
// .eslintrc — key rules
{
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
  'import/order': ['error', { 'newlines-between': 'always' }],
  'no-console': ['warn', { allow: ['warn', 'error'] }],
}
```

Prettier: single quotes, trailing comma es5, 100 print width.

Husky pre-commit: lint-staged (eslint + prettier on changed files).

---

## Documentation in Code

| Write comments when | Don't comment |
|---------------------|---------------|
| Non-obvious business rule | Obvious code |
| Workaround with ticket link | Every line |
| Public API JSDoc on shared lib | Implementation details |

---

## Anti-Patterns (Avoid)

| Anti-Pattern | Instead |
|--------------|---------|
| God component (500+ lines) | Split into feature components |
| Logic in JSX | Extract to hook or helper |
| Direct Prisma in components | Repository + service |
| Prop drilling 5+ levels | Context or Zustand slice |
| Hardcoded `"60"` timer | `GAME_CONFIG.DESCRIBE_TIMER_SEC` |
| Client publishes to Ably | Server publishes only |
| `any` for API response | Zod parse + typed response |

---

## Related Documents

- Architecture: Document 6
- Testing: Document 19
- Error handling: Document 17
- Folder tree detail: Phase 2
