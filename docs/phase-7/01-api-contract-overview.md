# Phase 7 — Document 1: API Contract Overview

## Purpose

Phase 7 formalizes **machine- and human-readable API contracts** for InkEcho. These contracts are the implementation reference for Milestones 2–6. **No code is implemented in this phase.**

| Artifact | File |
|----------|------|
| REST OpenAPI 3.1 | [`openapi.yaml`](./openapi.yaml) |
| REST contracts (narrative) | [02-rest-api-contracts.md](./02-rest-api-contracts.md) |
| Server Actions contracts | [03-server-actions-contracts.md](./03-server-actions-contracts.md) |

---

## API Surfaces

| Surface | Transport | Primary consumer | Contract format |
|---------|-----------|------------------|-----------------|
| **Server Actions** | Next.js RPC | React app (MVP default) | TypeScript + Zod (Doc 3) |
| **REST Route Handlers** | HTTP JSON | Mobile web, reconnect, cron, 3rd party | OpenAPI (Doc 2 + YAML) |
| **Better Auth** | HTTP | Auth flows | Better Auth spec (external) |
| **Ably** | WebSocket | Realtime sync | [Doc 10](../phase-0/10-realtime-events.md) |

**Rule:** Server Actions and REST endpoints that perform the same operation **MUST** share identical DTO schemas and service calls.

---

## Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://inkecho.app` |
| Staging | `https://staging.inkecho.app` |
| Local | `http://localhost:3000` |

REST prefix: `{baseUrl}/api`

---

## Authentication

### Cookies (automatic on same-origin requests)

| Cookie | Purpose |
|--------|---------|
| `better-auth.session_token` | Registered user session |
| `ink_player_session` | Guest/room player JWT |

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Cookie` | Same-origin | Session cookies |
| `X-Correlation-Id` | Optional | UUID; generated if absent |
| `Content-Type` | JSON bodies | `application/json` |
| `Authorization` | Cron only | `Bearer {CRON_SECRET}` |

### Auth requirements by scope

| Scope | Auth |
|-------|------|
| Public read (health, public rooms) | None |
| Room player actions | `ink_player_session` valid for room |
| Profile | Better Auth session |
| Admin | Better Auth + `role: ADMIN` |
| Cron | Bearer secret |

---

## Standard Response Envelopes

### REST Success

```json
{
  "data": { /* payload */ },
  "meta": { /* optional pagination */ }
}
```

### REST Error

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "correlationId": "uuid",
    "details": [{ "field": "text", "message": "..." }],
    "snapshot": { /* GameSnapshotDto on VERSION_CONFLICT */ }
  }
}
```

### Server Action Success

```json
{ "success": true, "data": { /* payload */ } }
```

### Server Action Failure

```json
{ "success": false, "error": { /* same ErrorPayload */ } }
```

---

## Shared Schema Components

### Enums

```yaml
RoomVisibility: [PUBLIC, PRIVATE]
RoomStatus: [LOBBY, IN_PROGRESS, REVEAL, CLOSED]
ParticipantRole: [HOST, PLAYER, SPECTATOR]
ConnectionStatus: [ONLINE, RECONNECTING, OFFLINE]
GameStatus: [IN_PROGRESS, PAUSED, REVEAL, COMPLETED]
TurnPhase: [DESCRIBE, DRAW]
ReportTargetType: [DRAWING, DESCRIPTION, USER]
ReportReason: [NSFW, HARASSMENT, SPAM, OTHER]
ReportStatus: [PENDING, REVIEWED, DISMISSED]
```

### RoomSettings

```json
{
  "maxPlayers": 8,
  "minPlayers": 3,
  "roundCount": 1,
  "describeTimerSec": 60,
  "drawTimerSec": 90,
  "profanityFilter": false,
  "allowSpectators": true
}
```

| Field | Type | Constraints |
|-------|------|-------------|
| maxPlayers | integer | 3–12, default 8 |
| minPlayers | integer | 3, fixed MVP |
| roundCount | integer | 1–3, default 1 |
| describeTimerSec | integer | 30–120, default 60 |
| drawTimerSec | integer | 60–180, default 90 |
| profanityFilter | boolean | default false |
| allowSpectators | boolean | default true |

### Participant

```json
{
  "playerId": "550e8400-e29b-41d4-a716-446655440000",
  "displayName": "PixelPanda",
  "role": "HOST",
  "isReady": true,
  "connectionStatus": "ONLINE",
  "avatarUrl": null
}
```

### TurnPublic (non-secret fields)

```json
{
  "phase": "DRAW",
  "activePlayerId": "uuid",
  "chainIndex": 0,
  "turnIndex": 1,
  "turnEndsAt": "2026-08-28T08:01:30.000Z"
}
```

### TurnSnapshot (viewer-filtered)

Extends TurnPublic with optional fields visible only to active player:

```json
{
  "phase": "DESCRIBE",
  "activePlayerId": "uuid",
  "chainIndex": 0,
  "turnIndex": 0,
  "turnEndsAt": "...",
  "promptText": "A penguin on a skateboard",
  "priorDrawingUrl": "https://res.cloudinary.com/..."
}
```

### GameSnapshot

```json
{
  "gameId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "version": 42,
  "status": "IN_PROGRESS",
  "currentTurn": { /* TurnSnapshot | null */ },
  "chains": [ /* filtered ChainSnapshot[] */ ],
  "playerOrder": ["uuid1", "uuid2"],
  "revealChainIndex": 0,
  "revealStepIndex": 0,
  "isPaused": false,
  "serverTime": "2026-08-28T08:00:00.000Z"
}
```

### Pagination

```json
{
  "page": 1,
  "limit": 20,
  "total": 42,
  "totalPages": 3
}
```

---

## HTTP Status Code Matrix

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful read/update |
| 201 | Created | Room/game/report created |
| 204 | No Content | Leave, delete, close |
| 400 | Bad Request | ValidationError |
| 401 | Unauthorized | Missing/invalid session |
| 403 | Forbidden | Wrong role, banned, not your turn |
| 404 | Not Found | Room/game/user missing |
| 409 | Conflict | VERSION_CONFLICT, GAME_ALREADY_STARTED |
| 413 | Payload Too Large | Drawing > 2MB |
| 422 | Unprocessable | Empty canvas |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Error | Unexpected failure |
| 502 | Bad Gateway | External service failure |

---

## Error Code Registry

| Code | HTTP | Retry |
|------|------|-------|
| `VALIDATION_ERROR` | 400 | Fix input |
| `UNAUTHORIZED` | 401 | Re-auth |
| `FORBIDDEN` | 403 | No |
| `NOT_FOUND` | 404 | No |
| `ROOM_NOT_FOUND` | 404 | No |
| `ROOM_FULL` | 403 | No |
| `NOT_HOST` | 403 | No |
| `NOT_YOUR_TURN` | 403 | No |
| `NOT_IN_ROOM` | 403 | Re-join |
| `KICKED` | 403 | No |
| `BANNED` | 403 | No |
| `GAME_NOT_FOUND` | 404 | No |
| `GAME_ALREADY_STARTED` | 409 | No |
| `INVALID_GAME_TRANSITION` | 409 | Sync + retry |
| `VERSION_CONFLICT` | 409 | Apply snapshot + retry |
| `INSUFFICIENT_PLAYERS` | 400 | Wait for players |
| `CANNOT_KICK_SELF` | 400 | No |
| `FILE_TOO_LARGE` | 413 | Compress |
| `EMPTY_CANVAS` | 422 | Draw something |
| `RATE_LIMITED` | 429 | Backoff |
| `EXTERNAL_SERVICE_ERROR` | 502 | Retry |
| `INTERNAL_ERROR` | 500 | Retry |

---

## Rate Limits

| Operation | Key | Limit | Window |
|-----------|-----|-------|--------|
| Create room | userId / IP | 5 | 1 hour |
| Guest session | IP | 10 | 1 hour |
| Join room | IP | 20 | 1 hour |
| Turn submit | playerId | 30 | 1 minute |
| Public room list | IP | 60 | 1 minute |
| Report | userId | 5 | 1 hour |

Response headers (when limited):

```
Retry-After: 42
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
```

---

## Idempotency

| Endpoint | Idempotent | Key |
|----------|------------|-----|
| Submit description/drawing | Yes | `expectedVersion` + turn state |
| Toggle ready | Yes | Same value no-op |
| Start game | No | 409 if already started |
| Join room | No | Creates new participant if new session |

---

## Versioning Strategy

| Layer | Version |
|-------|---------|
| URL | Unversioned `/api/...` for MVP |
| Game state | `expectedVersion` integer on mutations |
| OpenAPI document | `info.version: 1.0.0` |
| Breaking changes | Introduce `/api/v1/...` |

---

## Contract Testing (M2+)

| Test | Tool |
|------|------|
| Zod schema ↔ OpenAPI alignment | Manual review + codegen optional |
| REST contract | Schemathesis or Dredd against OpenAPI |
| Server Action types | TypeScript compile-time |
| E2E | Playwright against live endpoints |

---

## Related Documents

- Phase 0 API design: [../phase-0/09-api-design.md](../phase-0/09-api-design.md)
- Phase 6 DTOs: [../phase-6/04-controllers-dtos-validation.md](../phase-6/04-controllers-dtos-validation.md)
- OpenAPI file: [openapi.yaml](./openapi.yaml)

## M1 Completion

After Phase 7 approval, **Milestone 1 (Documentation & Architecture) is complete.** Implementation begins at **Milestone 2: Project setup, tooling, shared infrastructure.**
