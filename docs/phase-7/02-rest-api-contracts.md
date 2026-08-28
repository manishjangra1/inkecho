# Phase 7 — Document 2: REST API Contracts

Formal contract for all **Route Handlers**. OpenAPI machine-readable spec: [openapi.yaml](./openapi.yaml).

---

## Health

### `GET /api/health`

| | |
|---|---|
| **Auth** | None |
| **Rate limit** | None |

**Response 200:**

```json
{
  "data": {
    "status": "ok",
    "timestamp": "2026-08-28T08:00:00.000Z",
    "services": {
      "database": "ok",
      "ably": "ok"
    }
  }
}
```

---

## Guest Session

### `POST /api/guest/session`

| | |
|---|---|
| **Auth** | Optional (anonymous OK) |
| **Rate limit** | 10/hour/IP |

**Request body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| displayName | string | ✓ | 3–20 chars, `/^[\w\s-]+$/` |
| roomCode | string | ✓* | 6 uppercase alphanumeric |
| roomId | string | ✓* | MongoDB ObjectId |

*One of `roomCode` or `roomId` required.

**Response 201:**

```json
{
  "data": {
    "playerId": "550e8400-e29b-41d4-a716-446655440000",
    "guestSessionId": "65f1a2b3c4d5e6f7a8b9c0d1",
    "roomId": "65f1a2b3c4d5e6f7a8b9c0d2",
    "displayName": "PixelPanda",
    "expiresAt": "2026-08-29T08:00:00.000Z"
  }
}
```

**Set-Cookie:** `ink_player_session=...; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`

**Errors:** `400` | `403` ROOM_FULL, KICKED, BANNED | `404` ROOM_NOT_FOUND | `429`

---

## Rooms

### `GET /api/rooms`

| | |
|---|---|
| **Auth** | None |
| **Rate limit** | 60/min/IP |

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | ≥ 1 |
| limit | integer | 20 | 1–50 |
| sort | string | lastActivityAt | `lastActivityAt` only (MVP) |

**Response 200:**

```json
{
  "data": [
    {
      "id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "code": "XYZ789",
      "playerCount": 4,
      "maxPlayers": 8,
      "hostName": "ArtistOne",
      "lastActivityAt": "2026-08-28T08:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

---

### `POST /api/rooms`

| | |
|---|---|
| **Auth** | Anonymous or registered |
| **Rate limit** | 5/hour/user or IP |

**Request body:**

| Field | Type | Required |
|-------|------|----------|
| displayName | string | ✓ (if anonymous) |
| visibility | RoomVisibility | ✓ |
| settings | Partial\<RoomSettings\> | |

**Response 201:** Room object + `inviteUrl` + sets `ink_player_session`

---

### `GET /api/rooms/{code}`

| | |
|---|---|
| **Auth** | Optional |
| **Path** | `code` — 6 char `[A-Z0-9]` |

**Response 200:** Full `RoomSnapshot` (participants, settings, status)

**Errors:** `404` ROOM_NOT_FOUND

---

### `PATCH /api/rooms/{code}`

| | |
|---|---|
| **Auth** | Player session, host only |

**Request:** `{ "settings": Partial<RoomSettings> }`

**Response 200:** Updated `RoomSnapshot`

**Errors:** `403` NOT_HOST | `400`

---

### `DELETE /api/rooms/{code}`

| | |
|---|---|
| **Auth** | Host only |

**Response 204**

Publishes `room_closed` via Ably.

---

## Room Participation

### `POST /api/rooms/{code}/join`

**Request:**

| Field | Type | Default |
|-------|------|---------|
| displayName | string | Required if no session |
| asSpectator | boolean | false |

**Response 200:**

```json
{
  "data": {
    "playerId": "uuid",
    "role": "PLAYER",
    "redirectTo": "lobby",
    "room": { /* RoomSnapshot */ }
  }
}
```

`redirectTo`: `lobby` | `game` | `reveal` | `spectate`

---

### `POST /api/rooms/{code}/leave`

**Auth:** Player session

**Response 204**

---

### `POST /api/rooms/{code}/ready`

**Request:** `{ "isReady": boolean }`

**Response 200:**

```json
{
  "data": {
    "playerId": "uuid",
    "isReady": true,
    "readyCount": 4,
    "totalPlayers": 5
  }
}
```

---

### `POST /api/rooms/{code}/kick`

**Auth:** Host

**Request:** `{ "playerId": "uuid" }`

**Response 200:** `{ "data": { "kickedPlayerId": "uuid" } }`

**Errors:** `400` CANNOT_KICK_SELF | `403` NOT_HOST

---

### `POST /api/rooms/{code}/transfer-host`

**Auth:** Host

**Request:** `{ "newHostPlayerId": "uuid" }`

**Response 200:** Updated `RoomSnapshot`

---

## Game

### `POST /api/rooms/{code}/game/start`

**Auth:** Host

**Preconditions:** ≥ 3 ready players, room status LOBBY

**Response 201:**

```json
{
  "data": {
    "gameId": "65f1a2b3c4d5e6f7a8b9c0d3",
    "status": "IN_PROGRESS",
    "version": 1,
    "currentTurn": {
      "phase": "DESCRIBE",
      "activePlayerId": "uuid",
      "chainIndex": 0,
      "turnIndex": 0,
      "turnEndsAt": "2026-08-28T08:01:30.000Z",
      "promptText": "A penguin on a skateboard"
    }
  }
}
```

*Note: `promptText` only in response to active player (HTTP filtered).*

**Errors:** `400` INSUFFICIENT_PLAYERS | `403` NOT_HOST | `409` GAME_ALREADY_STARTED

---

### `GET /api/rooms/{code}/game`

| | |
|---|---|
| **Auth** | Player/spectator session for room |
| **Purpose** | Reconnect snapshot |

**Response 200:**

```json
{
  "data": {
    "room": {
      "code": "ABC123",
      "status": "IN_PROGRESS",
      "hostPlayerId": "uuid"
    },
    "participant": {
      "playerId": "uuid",
      "role": "PLAYER",
      "displayName": "PixelPanda"
    },
    "game": { /* GameSnapshot — filtered */ },
    "serverTime": "2026-08-28T08:00:00.000Z"
  }
}
```

**Response 200 (lobby, no game):** `{ "data": { "room": {...}, "participant": {...}, "game": null, "serverTime": "..." } }`

---

### `POST /api/rooms/{code}/game/submit/description`

**Auth:** Active player only

**Request:**

| Field | Type | Required |
|-------|------|----------|
| text | string | ✓ | 1–200 chars |
| expectedVersion | integer | ✓ | ≥ 1 |

**Response 200:**

```json
{
  "data": {
    "version": 43,
    "gameStatus": "IN_PROGRESS",
    "nextTurn": {
      "phase": "DRAW",
      "activePlayerId": "uuid2",
      "chainIndex": 0,
      "turnIndex": 1,
      "turnEndsAt": "2026-08-28T08:03:00.000Z",
      "promptText": "A cat wearing a top hat"
    }
  }
}
```

**Response 409 VERSION_CONFLICT:**

```json
{
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "State updated. Syncing…",
    "correlationId": "uuid",
    "snapshot": { /* GameSnapshot */ }
  }
}
```

---

### `POST /api/rooms/{code}/game/submit/drawing`

**Auth:** Active player

**Content-Type:** `multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| image | file | ✓ | PNG or WebP, max 2MB |
| expectedVersion | string/number | ✓ |

**Response 200:**

```json
{
  "data": {
    "version": 44,
    "drawingUrl": "https://res.cloudinary.com/.../drawing.webp",
    "nextTurn": { /* TurnPublic */ }
  }
}
```

**Errors:** `413` FILE_TOO_LARGE | `422` EMPTY_CANVAS | `409` VERSION_CONFLICT

---

### `POST /api/rooms/{code}/game/pause`

**Auth:** Host

**Response 200:**

```json
{
  "data": {
    "status": "PAUSED",
    "pausedAt": "2026-08-28T08:00:00.000Z",
    "remainingSeconds": 45
  }
}
```

---

### `POST /api/rooms/{code}/game/resume`

**Auth:** Host

**Response 200:**

```json
{
  "data": {
    "status": "IN_PROGRESS",
    "turnEndsAt": "2026-08-28T08:00:45.000Z",
    "remainingSeconds": 45
  }
}
```

---

### `POST /api/rooms/{code}/game/vote`

**Auth:** Player or spectator

**Request:** `{ "chainIndex": 0 }`

**Response 200:**

```json
{
  "data": {
    "votes": { "0": 3, "1": 1, "2": 0 }
  }
}
```

---

### `POST /api/rooms/{code}/game/rematch`

**Auth:** Host

**Response 200:**

```json
{
  "data": {
    "roomStatus": "LOBBY"
  }
}
```

---

## Realtime

### `GET /api/realtime/token`

| | |
|---|---|
| **Auth** | Player session for room |

**Query:** `roomId` (ObjectId, required)

**Response 200:**

```json
{
  "data": {
    "tokenRequest": {
      "keyName": "...",
      "timestamp": 1693238400000,
      "nonce": "...",
      "clientId": "player-uuid",
      "capability": "{\"room:65f...\":[\"subscribe\",\"presence\"]}",
      "mac": "..."
    }
  }
}
```

**Errors:** `401` | `403` NOT_IN_ROOM

---

## Profile

### `GET /api/profile`

**Auth:** Registered

**Response 200:** `{ "data": { "user": {...}, "stats": {...} } }`

---

### `PATCH /api/profile`

**Request:** `{ "name"?: string, "image"?: string | null }`

**Response 200:** Updated user object

---

### `GET /api/profile/history`

**Query:** `page`, `limit`

**Response 200:** Paginated `GameHistoryItem[]`

---

## Reports

### `POST /api/reports`

**Auth:** Player session

**Request:**

| Field | Type | Required |
|-------|------|----------|
| gameId | ObjectId | ✓ |
| targetType | ReportTargetType | ✓ |
| targetId | string | ✓ |
| reason | ReportReason | ✓ |
| notes | string | | max 500 |

**Response 201:** `{ "data": { "reportId": "..." } }`

---

## Admin

### `GET /api/admin/reports`

**Auth:** Admin

**Query:** `status`, `page`, `limit`

**Response 200:** Paginated reports with preview metadata

---

### `PATCH /api/admin/reports/{id}`

**Request:**

```json
{
  "status": "REVIEWED",
  "action": "DISMISS" | "BAN_USER",
  "banDurationHours": 24,
  "notes": "optional"
}
```

---

### `POST /api/admin/users/{id}/ban`

**Request:**

```json
{
  "permanent": false,
  "durationHours": 72,
  "reason": "string"
}
```

**Response 200:** `{ "data": { "bannedUntil": "..." } }`

---

## Cron (Internal)

### `POST /api/cron/cleanup-rooms`

**Auth:** `Authorization: Bearer {CRON_SECRET}`

**Response 200:** `{ "data": { "closedCount": 5 } }`

---

### `POST /api/cron/advance-reveal`

**Auth:** Bearer secret

**Response 200:** `{ "data": { "advancedRooms": 2 } }`

---

### `POST /api/cron/process-timers`

**Auth:** Bearer secret

**Response 200:** `{ "data": { "expiredTurnsProcessed": 1 } }`

---

## Better Auth Routes

Delegated to Better Auth — not duplicated here. See [Better Auth docs](https://www.better-auth.com/docs).

| Method | Path |
|--------|------|
| POST | `/api/auth/sign-up/email` |
| POST | `/api/auth/sign-in/email` |
| POST | `/api/auth/sign-in/social` |
| POST | `/api/auth/sign-out` |
| GET | `/api/auth/session` |

---

## Related Documents

- Overview: [01-api-contract-overview.md](./01-api-contract-overview.md)
- Server Actions: [03-server-actions-contracts.md](./03-server-actions-contracts.md)
- OpenAPI: [openapi.yaml](./openapi.yaml)
