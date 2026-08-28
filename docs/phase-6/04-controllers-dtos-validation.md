# Phase 6 — Document 4: Controllers, DTOs & Validation

## Overview

**Controllers** are the HTTP/RPC boundary. They parse input, authenticate, rate-limit, delegate to services, and format responses. **DTOs** define the contract; **Zod schemas** validate at the boundary.

---

## Controller Patterns

### Server Action Template

File pattern: `features/[feature]/actions/[name].action.ts`

```typescript
'use server';

import { createServices } from '@/infrastructure/di/container';
import { getAuthContext, requirePlayerSession } from '@/infrastructure/auth/session';
import { authorize } from '@/shared/lib/auth/authorize';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import { submitDescriptionSchema } from '../schemas/submit-description.schema';

import type { ActionResult } from '@/shared/types/api.types';
import type { SubmitDescriptionResponse } from '../types/game.types';

export async function submitDescriptionAction(
  input: unknown,
): Promise<ActionResult<SubmitDescriptionResponse>> {
  const correlationId = await getCorrelationId();

  try {
    const dto = submitDescriptionSchema.parse(input);
    const ctx = await requirePlayerSession(dto.roomId);
    authorize(ctx, 'game:submit');

    const { gameService } = createServices(correlationId);
    const result = await gameService.submitDescription(dto, ctx);

    if (!result.ok) {
      return {
        success: false,
        error: {
          code: result.error.code,
          message: result.error.message,
          correlationId,
          ...(result.error.context?.snapshot && { snapshot: result.error.context.snapshot }),
        },
      };
    }

    return { success: true, data: result.value };
  } catch (error) {
    return handleActionError(error, correlationId);
  }
}
```

### Route Handler Template

File pattern: `app/api/[resource]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { parseJsonBody } from '@/shared/lib/api/parse-request';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { createServices } from '@/infrastructure/di/container';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const correlationId = request.headers.get('x-correlation-id') ?? crypto.randomUUID();

  try {
    const dto = await parseJsonBody(request, createRoomSchema);
    const ctx = await getAuthContext();
    // ... rate limit, service call
    return NextResponse.json({ data: result.value }, { status: 201 });
  } catch (error) {
    return handleApiError(error, correlationId);
  }
}
```

---

## Server Action Catalog

| Action | Feature | Service method |
|--------|---------|----------------|
| `createRoomAction` | rooms | `roomService.createRoom` |
| `joinRoomAction` | rooms | `roomService.joinRoom` |
| `leaveRoomAction` | rooms | `roomService.leaveRoom` |
| `updateRoomSettingsAction` | rooms | `roomService.updateSettings` |
| `toggleReadyAction` | lobby | `lobbyService.toggleReady` |
| `kickPlayerAction` | lobby | `lobbyService.kickPlayer` |
| `transferHostAction` | lobby | `lobbyService.transferHost` |
| `startGameAction` | lobby | `lobbyService.startGame` |
| `submitDescriptionAction` | game | `gameService.submitDescription` |
| `submitDrawingAction` | game | `gameService.submitDrawing` |
| `pauseGameAction` | game | `gameService.pauseGame` |
| `resumeGameAction` | game | `gameService.resumeGame` |
| `voteChainAction` | reveal | `revealService.voteChain` |
| `rematchAction` | reveal | `revealService.rematch` |
| `createGuestSessionAction` | auth | `guestSessionService.create` |
| `updateProfileAction` | profile | `profileService.updateProfile` |
| `reviewReportAction` | admin | `adminService.reviewReport` |
| `banUserAction` | admin | `adminService.banUser` |

---

## Route Handler Catalog

| Method | Path | Handler responsibility |
|--------|------|------------------------|
| GET | `/api/health` | Health check |
| GET/POST | `/api/auth/[...all]` | Better Auth |
| POST | `/api/guest/session` | Guest session create |
| GET | `/api/rooms` | List public rooms |
| POST | `/api/rooms` | Create room |
| GET/PATCH/DELETE | `/api/rooms/[code]` | Room CRUD |
| POST | `/api/rooms/[code]/join` | Join |
| POST | `/api/rooms/[code]/leave` | Leave |
| POST | `/api/rooms/[code]/ready` | Ready toggle |
| POST | `/api/rooms/[code]/kick` | Kick |
| POST | `/api/rooms/[code]/transfer-host` | Transfer host |
| GET | `/api/rooms/[code]/game` | Game snapshot (reconnect) |
| POST | `/api/rooms/[code]/game/start` | Start game |
| POST | `/api/rooms/[code]/game/submit/description` | Submit describe |
| POST | `/api/rooms/[code]/game/submit/drawing` | Submit draw (multipart) |
| POST | `/api/rooms/[code]/game/pause` | Pause |
| POST | `/api/rooms/[code]/game/resume` | Resume |
| POST | `/api/rooms/[code]/game/vote` | Vote |
| POST | `/api/rooms/[code]/game/rematch` | Rematch |
| GET | `/api/realtime/token` | Ably token |
| GET/PATCH | `/api/profile` | Profile |
| GET | `/api/profile/history` | History |
| POST | `/api/reports` | Create report |
| GET | `/api/admin/reports` | List reports |
| PATCH | `/api/admin/reports/[id]` | Review |
| POST | `/api/admin/users/[id]/ban` | Ban |
| POST | `/api/cron/cleanup-rooms` | Idle room cleanup |
| POST | `/api/cron/advance-reveal` | Reveal step cron |
| POST | `/api/cron/process-timers` | Timer expiry (optional) |

Route Handlers mirror Server Actions for **external REST clients** and **cron** — internal UI prefers Server Actions.

---

## DTO Conventions

### Naming

| Type | Pattern | Example |
|------|---------|---------|
| Input | `[Action]Dto` | `SubmitDescriptionDto` |
| Output | `[Action]Response` | `SubmitDescriptionResponse` |
| Snapshot | `[Entity]SnapshotDto` | `GameSnapshotDto` |
| List item | `[Entity]ListItem` | `PublicRoomListItem` |

### Location

```
features/game/schemas/     Zod schemas (infer DTO types)
features/game/types/       Response interfaces
shared/types/api.types.ts  ActionResult, Paginated
```

### Infer types from Zod

```typescript
export const submitDescriptionSchema = z.object({
  roomId: z.string().regex(/^[a-f\d]{24}$/i),
  roomCode: z.string().length(6),
  text: z.string().trim().min(1).max(200),
  expectedVersion: z.number().int().positive(),
});

export type SubmitDescriptionDto = z.infer<typeof submitDescriptionSchema>;
```

---

## Core DTO Definitions

### Room DTOs

```typescript
interface CreateRoomDto {
  displayName: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  settings?: Partial<RoomSettingsDto>;
}

interface CreateRoomResponse {
  roomId: string;
  roomCode: string;
  playerId: string;
  inviteUrl: string;
}

interface RoomSnapshotDto {
  id: string;
  code: string;
  status: RoomStatus;
  hostPlayerId: string;
  settings: RoomSettingsDto;
  participants: ParticipantDto[];
  spectatorCount: number;
}
```

### Game DTOs

```typescript
interface SubmitDescriptionDto {
  roomId: string;
  roomCode: string;
  text: string;
  expectedVersion: number;
}

interface SubmitDescriptionResponse {
  version: number;
  nextTurn: TurnPublicDto | null;
  gameStatus: GameStatus;
}

interface GameSnapshotDto {
  gameId: string;
  version: number;
  status: GameStatus;
  currentTurn: TurnSnapshotDto | null;
  chains: ChainSnapshotDto[];
  playerOrder: string[];
  revealChainIndex: number;
  revealStepIndex: number;
  serverTime: string;
}

interface TurnSnapshotDto {
  phase: TurnPhase;
  activePlayerId: string;
  turnEndsAt: string;
  chainIndex: number;
  turnIndex: number;
  // promptText ONLY if viewer is active player
  promptText?: string;
  priorDrawingUrl?: string;
}
```

### Auth DTOs

```typescript
interface CreateGuestSessionDto {
  displayName: string;
  roomCode?: string;
  roomId?: string;
}

interface GuestSessionResponse {
  playerId: string;
  guestSessionId: string;
  roomId: string;
  displayName: string;
  expiresAt: string;
}
```

### Error Response DTO

```typescript
interface ErrorPayload {
  code: string;
  message: string;
  correlationId: string;
  details?: { field: string; message: string }[];
  snapshot?: GameSnapshotDto;
}
```

---

## Validation Strategy

### Three Layers

| Layer | Tool | Examples |
|-------|------|----------|
| **Boundary** | Zod | String length, formats, numeric ranges |
| **Domain** | Pure functions | State transitions, turn ownership |
| **Database** | Prisma types | Schema shape |

Never skip boundary validation because domain also checks.

### Shared Validators

File: `shared/lib/validation/` (reusable Zod refinements)

```typescript
export const roomCodeSchema = z.string().regex(/^[A-Z0-9]{6}$/);
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i);
export const displayNameSchema = z.string().trim().min(3).max(20)
  .regex(/^[\w\s-]+$/);
export const roomSettingsSchema = z.object({
  maxPlayers: z.number().int().min(3).max(12),
  describeTimerSec: z.number().int().min(30).max(120),
  drawTimerSec: z.number().int().min(60).max(180),
  roundCount: z.number().int().min(1).max(3),
  profanityFilter: z.boolean(),
  allowSpectators: z.boolean(),
});
```

Constants min/max imported from `shared/config/` — Zod uses same values.

### Multipart Validation (Drawing)

```typescript
const MAX_DRAWING_BYTES = 2 * 1024 * 1024;

async function parseDrawingForm(request: NextRequest) {
  const form = await request.formData();
  const file = form.get('image');
  if (!(file instanceof File)) throw new ValidationError('Missing image');
  if (file.size > MAX_DRAWING_BYTES) throw new ValidationError('FILE_TOO_LARGE');
  if (!['image/png', 'image/webp'].includes(file.type)) throw new ValidationError('Invalid MIME');
  const expectedVersion = Number(form.get('expectedVersion'));
  // magic byte check on buffer...
  return { buffer, expectedVersion };
}
```

---

## Response Wrappers

### Server Actions

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorPayload };
```

### Route Handlers

```typescript
// Success
{ data: T, meta?: PaginationMeta }

// Error
{ error: ErrorPayload }
```

HTTP status from `AppError.statusCode`.

---

## Rate Limiting in Controllers

```typescript
await rateLimiter.check({
  key: `room:create:${ctx.type === 'registered' ? ctx.userId : ip}`,
  limit: RATE_LIMIT.ROOM_CREATE.limit,
  windowMs: RATE_LIMIT.ROOM_CREATE.windowMs,
});
```

Config from `shared/config/rate-limit.config.ts`.

---

## Cron Controller Security

```typescript
export async function POST(request: NextRequest) {
  const secret = request.headers.get('authorization');
  if (secret !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ...
}
```

---

## Related Documents

- Overview: [01-backend-architecture-overview.md](./01-backend-architecture-overview.md)
- Middleware & errors: [05-middleware-and-errors.md](./05-middleware-and-errors.md)
- API design: [../phase-0/09-api-design.md](../phase-0/09-api-design.md)
- Phase 7: Formal API contracts (next phase)
