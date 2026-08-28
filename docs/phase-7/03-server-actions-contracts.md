# Phase 7 — Document 3: Server Actions Contracts

Formal contracts for all **Server Actions** — the primary API for the Next.js UI. Each action maps 1:1 to a REST endpoint where noted.

**Return type (all actions):** `Promise<ActionResult<T>>`

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorPayload };
```

---

## Auth

### `createGuestSessionAction`

| | |
|---|---|
| **File** | `features/auth/actions/create-guest-session.action.ts` |
| **REST equivalent** | `POST /api/guest/session` |
| **Auth** | Anonymous OK |

**Input schema (`guestSessionSchema`):**

```typescript
z.object({
  displayName: displayNameSchema,
  roomCode: roomCodeSchema.optional(),
  roomId: objectIdSchema.optional(),
}).refine(d => d.roomCode || d.roomId, { message: 'roomCode or roomId required' });
```

**Output `GuestSessionResponse`:** Same as REST 201 `data`

**Side effects:** Sets `ink_player_session` cookie via `cookies().set()`

---

## Rooms

### `createRoomAction`

| | |
|---|---|
| **REST** | `POST /api/rooms` |
| **Auth** | Anonymous or registered |

**Input:**

```typescript
z.object({
  displayName: displayNameSchema.optional(), // required if anonymous
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  settings: roomSettingsSchema.partial().optional(),
});
```

**Output `CreateRoomResponse`:**

```typescript
{
  roomId: string;
  roomCode: string;
  playerId: string;
  inviteUrl: string;
}
```

---

### `joinRoomAction`

| | |
|---|---|
| **REST** | `POST /api/rooms/{code}/join` |

**Input:**

```typescript
z.object({
  roomCode: roomCodeSchema,
  displayName: displayNameSchema.optional(),
  asSpectator: z.boolean().default(false),
});
```

**Output `JoinRoomResponse`:**

```typescript
{
  playerId: string;
  role: ParticipantRole;
  redirectTo: 'lobby' | 'game' | 'reveal' | 'spectate';
  room: RoomSnapshotDto;
}
```

---

### `leaveRoomAction`

| | |
|---|---|
| **REST** | `POST /api/rooms/{code}/leave` |

**Input:** `{ roomCode: roomCodeSchema }`

**Output:** `{ left: true }`

---

### `updateRoomSettingsAction`

| | |
|---|---|
| **REST** | `PATCH /api/rooms/{code}` |
| **Permission** | `room:settings` (host) |

**Input:**

```typescript
z.object({
  roomCode: roomCodeSchema,
  settings: roomSettingsSchema.partial(),
});
```

**Output:** `RoomSnapshotDto`

---

## Lobby

### `toggleReadyAction`

| | |
|---|---|
| **REST** | `POST /api/rooms/{code}/ready` |

**Input:** `{ roomCode, isReady: boolean }`

**Output:**

```typescript
{ playerId: string; isReady: boolean; readyCount: number; totalPlayers: number }
```

---

### `kickPlayerAction`

| | |
|---|---|
| **REST** | `POST /api/rooms/{code}/kick` |
| **Permission** | Host |

**Input:** `{ roomCode, playerId: uuidSchema }`

**Output:** `{ kickedPlayerId: string }`

---

### `transferHostAction`

| | |
|---|---|
| **REST** | `POST /api/rooms/{code}/transfer-host` |

**Input:** `{ roomCode, newHostPlayerId: uuidSchema }`

**Output:** `RoomSnapshotDto`

---

### `startGameAction`

| | |
|---|---|
| **REST** | `POST /api/rooms/{code}/game/start` |
| **Permission** | Host |

**Input:** `{ roomCode: roomCodeSchema }`

**Output `StartGameResponse`:**

```typescript
{
  gameId: string;
  status: 'IN_PROGRESS';
  version: number;
  currentTurn: TurnSnapshotDto; // filtered for caller
}
```

---

## Game

### `submitDescriptionAction`

| | |
|---|---|
| **REST** | `POST /api/rooms/{code}/game/submit/description` |
| **Permission** | `game:submit` + active player |

**Input:**

```typescript
z.object({
  roomCode: roomCodeSchema,
  roomId: objectIdSchema,
  text: z.string().trim().min(1).max(200),
  expectedVersion: z.number().int().positive(),
});
```

**Output `SubmitDescriptionResponse`:**

```typescript
{
  version: number;
  gameStatus: GameStatus;
  nextTurn: TurnPublicDto | null;
}
```

**Errors:** `NOT_YOUR_TURN`, `VERSION_CONFLICT` (+ snapshot), `INVALID_GAME_TRANSITION`

---

### `submitDrawingAction`

| | |
|---|---|
| **REST** | `POST /api/rooms/{code}/game/submit/drawing` |

**Input:**

```typescript
z.object({
  roomCode: roomCodeSchema,
  roomId: objectIdSchema,
  expectedVersion: z.number().int().positive(),
  imageBase64: z.string().optional(), // Server Action binary pattern
  imageDataUrl: z.string().optional(), // data:image/webp;base64,...
}).refine(d => d.imageBase64 || d.imageDataUrl, { message: 'Image required' });
```

*Note: Server Actions use base64/dataUrl for binary; REST uses multipart.*

**Output:**

```typescript
{
  version: number;
  drawingUrl: string;
  nextTurn: TurnPublicDto | null;
}
```

---

### `pauseGameAction` / `resumeGameAction`

| | |
|---|---|
| **REST** | `POST .../pause`, `POST .../resume` |
| **Permission** | Host |

**Input:** `{ roomCode }`

**Output:** Same as REST pause/resume responses

---

### `getGameSnapshotAction` (read)

| | |
|---|---|
| **REST** | `GET /api/rooms/{code}/game` |

**Input:** `{ roomCode }`

**Output `ReconnectSnapshot`:** room + participant + game + serverTime

---

## Reveal

### `voteChainAction`

| | |
|---|---|
| **REST** | `POST /api/rooms/{code}/game/vote` |

**Input:** `{ roomCode, chainIndex: z.number().int().min(0) }`

**Output:** `{ votes: Record<string, number> }`

---

### `rematchAction`

| | |
|---|---|
| **REST** | `POST /api/rooms/{code}/game/rematch` |
| **Permission** | Host |

**Input:** `{ roomCode }`

**Output:** `{ roomStatus: 'LOBBY' }`

---

## Profile

### `updateProfileAction`

| | |
|---|---|
| **REST** | `PATCH /api/profile` |
| **Auth** | Registered only |

**Input:**

```typescript
z.object({
  name: displayNameSchema.optional(),
  image: z.string().url().nullable().optional(),
});
```

**Output:** `UserProfileDto`

---

## Admin

### `reviewReportAction`

| | |
|---|---|
| **REST** | `PATCH /api/admin/reports/{id}` |
| **Permission** | Admin |

**Input:**

```typescript
z.object({
  reportId: objectIdSchema,
  status: z.enum(['REVIEWED', 'DISMISSED']),
  action: z.enum(['DISMISS', 'BAN_USER']).optional(),
  banDurationHours: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
});
```

---

### `banUserAction`

| | |
|---|---|
| **REST** | `POST /api/admin/users/{id}/ban` |

**Input:**

```typescript
z.object({
  userId: objectIdSchema,
  permanent: z.boolean(),
  durationHours: z.number().int().positive().optional(),
  reason: z.string().min(1).max(500),
});
```

---

## Shared Zod Building Blocks

File: `shared/lib/validation/schemas.ts`

```typescript
export const roomCodeSchema = z.string().regex(/^[A-Z0-9]{6}$/);
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i);
export const uuidSchema = z.string().uuid();
export const displayNameSchema = z.string().trim().min(3).max(20).regex(/^[\w\s-]+$/);

export const roomSettingsSchema = z.object({
  maxPlayers: z.number().int().min(3).max(12),
  minPlayers: z.number().int().min(3).max(3),
  roundCount: z.number().int().min(1).max(3),
  describeTimerSec: z.number().int().min(30).max(120),
  drawTimerSec: z.number().int().min(60).max(180),
  profanityFilter: z.boolean(),
  allowSpectators: z.boolean(),
});
```

---

## Action ↔ Service ↔ Event Matrix

| Action | Service | Ably events published |
|--------|---------|----------------------|
| createRoomAction | RoomService.createRoom | — (join implicit) |
| joinRoomAction | RoomService.joinRoom | player_joined |
| leaveRoomAction | RoomService.leaveRoom | player_left |
| toggleReadyAction | LobbyService.toggleReady | player_ready_changed |
| kickPlayerAction | LobbyService.kickPlayer | player_kicked |
| startGameAction | LobbyService.startGame | game_started |
| submitDescriptionAction | GameService.submitDescription | description_submitted, turn_changed |
| submitDrawingAction | GameService.submitDrawing | drawing_submitted, turn_changed |
| pauseGameAction | GameService.pauseGame | game_paused |
| resumeGameAction | GameService.resumeGame | game_resumed |
| voteChainAction | RevealService.voteChain | — |
| rematchAction | RevealService.rematch | returned_to_lobby |

---

## Client Usage Pattern

```typescript
'use client';

import { submitDescriptionAction } from '@/features/game/actions/submit-description.action';
import { useGameStore } from '@/features/game/stores/game-store';

async function onSubmit(text: string) {
  const { version, roomId, roomCode } = useGameStore.getState();
  const result = await submitDescriptionAction({ roomCode, roomId, text, expectedVersion: version });

  if (!result.success) {
    if (result.error.code === 'VERSION_CONFLICT' && result.error.snapshot) {
      useGameStore.getState().replaceFromSnapshot(result.error.snapshot);
    }
    toast.error(result.error.message);
    return;
  }

  useGameStore.getState().reconcile(result.data);
}
```

---

## Contract Compliance Checklist (M2+)

- [ ] Every action has Zod schema in `features/*/schemas/`
- [ ] Every action output type exported from `features/*/types/`
- [ ] REST endpoint returns identical `data` shape as action `data`
- [ ] Error codes match Error Registry (Doc 1)
- [ ] OpenAPI schemas align with Zod constraints
- [ ] Integration tests cover happy path + 409 + 403 per action

---

## Related Documents

- REST contracts: [02-rest-api-contracts.md](./02-rest-api-contracts.md)
- Overview: [01-api-contract-overview.md](./01-api-contract-overview.md)
- Phase 6 controllers: [../phase-6/04-controllers-dtos-validation.md](../phase-6/04-controllers-dtos-validation.md)
