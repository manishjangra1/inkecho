# Document 9 — API Design

## Overview

InkEcho uses two API surfaces:

1. **Server Actions** — Primary mutation path for the Next.js app (typed, session-aware)
2. **Route Handlers** — Public REST endpoints (Ably token, webhooks, optional public API)

All requests/responses validated with **Zod**. Errors follow Document 17.

**Base URL:** `https://[domain]/api`  
**Auth:** httpOnly session cookie (Better Auth) or guest JWT cookie  
**Correlation:** `X-Correlation-Id` header (generated if missing)

---

## Standard Error Response

```json
{
  "error": {
    "code": "ROOM_NOT_FOUND",
    "message": "Room not found",
    "correlationId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

| HTTP | When |
|------|------|
| 400 | Validation failure |
| 401 | Unauthenticated |
| 403 | Forbidden (not host, banned, wrong room) |
| 404 | Resource not found |
| 409 | Version conflict / duplicate submit |
| 429 | Rate limited |
| 500 | Internal error |

---

## Authentication

### POST `/api/auth/*`

Handled by **Better Auth** — standard routes for sign up, sign in, sign out, OAuth callbacks.

| Route | Description |
|-------|-------------|
| `POST /api/auth/sign-up/email` | Email registration |
| `POST /api/auth/sign-in/email` | Email login |
| `POST /api/auth/sign-in/social` | OAuth |
| `POST /api/auth/sign-out` | Logout |
| `GET /api/auth/session` | Current session |

---

## Guest Session

### POST `/api/guest/session`

Create guest player session when joining a room.

**Request:**
```json
{
  "displayName": "PixelPanda",
  "roomCode": "ABC123"
}
```

**Response 201:**
```json
{
  "playerId": "uuid",
  "guestSessionId": "objectId",
  "roomId": "objectId",
  "displayName": "PixelPanda",
  "expiresAt": "2026-08-29T08:00:00.000Z"
}
```

**Errors:** `400` invalid name | `404` room not found | `403` room full | `429` rate limited

---

## Rooms

### POST `/api/rooms`

Create a new room. Caller becomes host.

**Request:**
```json
{
  "visibility": "PRIVATE",
  "settings": {
    "maxPlayers": 8,
    "describeTimerSec": 60,
    "drawTimerSec": 90,
    "roundCount": 1,
    "profanityFilter": false
  }
}
```

**Response 201:**
```json
{
  "id": "objectId",
  "code": "ABC123",
  "visibility": "PRIVATE",
  "status": "LOBBY",
  "hostPlayerId": "uuid",
  "settings": { "...": "..." },
  "inviteUrl": "https://inkecho.app/join/ABC123"
}
```

**Errors:** `401` | `429` max rooms per user

---

### GET `/api/rooms`

List public rooms in lobby state.

**Query:** `?page=1&limit=20&sort=lastActivityAt`

**Response 200:**
```json
{
  "data": [
    {
      "id": "objectId",
      "code": "XYZ789",
      "playerCount": 4,
      "maxPlayers": 8,
      "hostName": "ArtistOne",
      "lastActivityAt": "2026-08-28T08:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 42 }
}
```

---

### GET `/api/rooms/[code]`

Get room details + lobby snapshot.

**Response 200:**
```json
{
  "id": "objectId",
  "code": "ABC123",
  "status": "LOBBY",
  "visibility": "PRIVATE",
  "hostPlayerId": "uuid",
  "settings": { "...": "..." },
  "participants": [
    {
      "playerId": "uuid",
      "displayName": "PixelPanda",
      "role": "HOST",
      "isReady": true,
      "connectionStatus": "ONLINE",
      "avatarUrl": null
    }
  ],
  "spectatorCount": 0
}
```

**Errors:** `404` ROOM_NOT_FOUND

---

### PATCH `/api/rooms/[code]`

Update room settings. **Host only.**

**Request:**
```json
{
  "settings": {
    "maxPlayers": 6,
    "describeTimerSec": 45
  }
}
```

**Response 200:** Updated room object  
**Errors:** `403` NOT_HOST | `400` invalid settings

---

### DELETE `/api/rooms/[code]`

Close room. **Host only.**

**Response 204**  
**Errors:** `403` | `404`

---

## Room Participation

### POST `/api/rooms/[code]/join`

Join room as player or spectator.

**Request:**
```json
{
  "asSpectator": false
}
```

**Response 200:**
```json
{
  "playerId": "uuid",
  "role": "PLAYER",
  "room": { "...snapshot..." }
}
```

**Errors:** `403` ROOM_FULL | GAME_IN_PROGRESS (spectator only) | `403` BANNED

---

### POST `/api/rooms/[code]/leave`

Leave room.

**Response 204**

---

### POST `/api/rooms/[code]/ready`

Toggle ready state.

**Request:**
```json
{ "isReady": true }
```

**Response 200:**
```json
{ "playerId": "uuid", "isReady": true }
```

---

### POST `/api/rooms/[code]/kick`

Kick player. **Host only.**

**Request:**
```json
{ "playerId": "uuid-to-kick" }
```

**Response 200:** `{ "kickedPlayerId": "uuid" }`  
**Errors:** `403` NOT_HOST | `400` CANNOT_KICK_SELF

---

### POST `/api/rooms/[code]/transfer-host`

Transfer host role. **Host only.**

**Request:**
```json
{ "newHostPlayerId": "uuid" }
```

**Response 200:** Updated room snapshot

---

## Game

### POST `/api/rooms/[code]/game/start`

Start game. **Host only.** Min 3 ready players.

**Response 201:**
```json
{
  "gameId": "objectId",
  "status": "IN_PROGRESS",
  "currentTurn": {
    "phase": "DESCRIBE",
    "activePlayerId": "uuid",
    "turnEndsAt": "2026-08-28T08:01:30.000Z",
    "chainIndex": 0,
    "turnIndex": 0
  },
  "version": 1
}
```

**Errors:** `403` NOT_HOST | `400` INSUFFICIENT_PLAYERS | `409` GAME_ALREADY_STARTED

---

### GET `/api/rooms/[code]/game`

Get current game snapshot (for reconnect).

**Response 200:**
```json
{
  "gameId": "objectId",
  "status": "IN_PROGRESS",
  "version": 42,
  "currentTurn": { "...": "..." },
  "chains": [ "...redacted for non-active player..." ],
  "playerOrder": ["uuid1", "uuid2"]
}
```

**Note:** Response filtered by requesting player's visibility rules.

---

### POST `/api/rooms/[code]/game/pause`

Pause game. **Host only.**

**Response 200:** `{ "status": "PAUSED", "pausedAt": "..." }`

---

### POST `/api/rooms/[code]/game/resume`

Resume paused game. **Host only.**

**Response 200:** `{ "status": "IN_PROGRESS", "turnEndsAt": "..." }`

---

### POST `/api/rooms/[code]/game/submit/description`

Submit describe turn. **Active player only.**

**Request:**
```json
{
  "text": "A cat wearing a top hat",
  "expectedVersion": 42
}
```

**Response 200:**
```json
{
  "version": 43,
  "nextTurn": {
    "phase": "DRAW",
    "activePlayerId": "uuid2",
    "turnEndsAt": "...",
    "promptText": "A cat wearing a top hat"
  }
}
```

**Errors:** `403` NOT_YOUR_TURN | `409` VERSION_CONFLICT | `400` VALIDATION_ERROR

---

### POST `/api/rooms/[code]/game/submit/drawing`

Submit draw turn. **Active player only.**

**Request:** `multipart/form-data`
- `image`: PNG/WebP blob (max 2MB raw)
- `expectedVersion`: number

**Response 200:**
```json
{
  "version": 44,
  "drawingUrl": "https://res.cloudinary.com/.../drawing.webp",
  "nextTurn": { "...": "..." }
}
```

**Errors:** `413` FILE_TOO_LARGE | `422` EMPTY_CANVAS

---

### POST `/api/rooms/[code]/game/vote`

Vote for funniest chain (optional feature).

**Request:**
```json
{ "chainIndex": 0 }
```

**Response 200:** `{ "votes": { "0": 3, "1": 1 } }`

---

### POST `/api/rooms/[code]/game/rematch`

Return to lobby after reveal. **Host only.**

**Response 200:** `{ "roomStatus": "LOBBY" }`

---

## Realtime

### GET `/api/realtime/token`

Issue Ably token for room subscription.

**Query:** `?roomId=objectId`

**Response 200:**
```json
{
  "tokenRequest": { "...ably token request..." }
}
```

**Errors:** `403` NOT_IN_ROOM | `401`

---

## Profile

### GET `/api/profile`

Current user profile + stats. **Registered only.**

**Response 200:**
```json
{
  "user": {
    "id": "objectId",
    "name": "PlayerOne",
    "image": "https://...",
    "createdAt": "..."
  },
  "stats": {
    "gamesPlayed": 12,
    "gamesWon": 3,
    "chainsCompleted": 48
  }
}
```

---

### PATCH `/api/profile`

Update profile.

**Request:**
```json
{ "name": "NewName", "image": "https://..." }
```

**Response 200:** Updated user object

---

### GET `/api/profile/history`

Paginated game history.

**Query:** `?page=1&limit=10`

**Response 200:**
```json
{
  "data": [
    {
      "gameId": "objectId",
      "roomCode": "ABC123",
      "playedAt": "...",
      "placement": 1,
      "wonVote": true
    }
  ],
  "pagination": { "...": "..." }
}
```

---

## Admin

### GET `/api/admin/reports`

List pending reports. **Admin only.**

**Query:** `?status=PENDING&page=1`

**Response 200:** Paginated report list

---

### PATCH `/api/admin/reports/[id]`

Review report. **Admin only.**

**Request:**
```json
{ "status": "REVIEWED", "action": "BAN_USER", "banDurationHours": 24 }
```

**Response 200:** Updated report

---

### POST `/api/admin/users/[id]/ban`

Ban user. **Admin only.**

**Request:**
```json
{ "permanent": false, "durationHours": 72, "reason": "..." }
```

**Response 200:** `{ "bannedUntil": "..." }`

---

## Reports (Player)

### POST `/api/reports`

Report content.

**Request:**
```json
{
  "gameId": "objectId",
  "targetType": "DRAWING",
  "targetId": "turn-uuid",
  "reason": "NSFW",
  "notes": "optional"
}
```

**Response 201:** `{ "reportId": "objectId" }`

---

## Health

### GET `/api/health`

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "services": {
    "database": "ok",
    "ably": "ok"
  }
}
```

---

## Server Actions (Primary App Interface)

Server Actions mirror the above operations with typed inputs. Naming convention:

| Action | Maps To |
|--------|---------|
| `createRoomAction` | POST /api/rooms |
| `joinRoomAction` | POST /api/rooms/[code]/join |
| `toggleReadyAction` | POST /api/rooms/[code]/ready |
| `startGameAction` | POST /api/rooms/[code]/game/start |
| `submitDescriptionAction` | POST .../submit/description |
| `submitDrawingAction` | POST .../submit/drawing |

Route Handlers remain for:
- Ably token (CORS-safe GET)
- Better Auth routes
- Health checks
- Future public API / webhooks

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| POST /api/rooms | 5 / hour / user |
| POST /api/guest/session | 10 / hour / IP |
| POST .../submit/* | 30 / min / player |
| GET /api/rooms (public) | 60 / min / IP |
| POST /api/reports | 5 / hour / user |

Implemented via Upstash Redis or Vercel KV (Document 13).

---

## Versioning

- MVP: unversioned `/api/...`
- Future: `/api/v1/...` when breaking changes needed
- Game documents use internal `version` for optimistic concurrency
