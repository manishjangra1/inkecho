# Phase 3 — Document 1: Schema Review & Improvements

## Overview

This document reviews the Phase 0 database design (Document 7) against implementation constraints, applies improvements, and records the finalized Prisma schema in `prisma/schema.prisma`.

**Status:** Finalized — ready for Phase 4 (auth flow design).

---

## Review Process

| Step | Outcome |
|------|---------|
| 1. Map Document 7 → Prisma models | All 12 collections covered |
| 2. Better Auth compatibility check | User, Account, Session, Verification aligned |
| 3. MongoDB + Prisma constraint check | Composite types for embeds; relations validated |
| 4. Game engine requirements (Doc 11) | Version, reveal sync, pause fields added |
| 5. Security requirements (Doc 13) | `kickedPlayerIds` blocklist added |
| 6. Index strategy | Prisma `@@index` + manual TTL documented |

---

## Improvements Over Phase 0 Design

### 1. Better Auth Field Alignment

| Phase 0 | Finalized | Reason |
|---------|-----------|--------|
| `emailVerified: DateTime?` | `emailVerified: Boolean @default(false)` | Better Auth Prisma adapter expects boolean |
| Separate auth collections | Merged into standard Better Auth models | Avoid duplicate session tables |

InkEcho-specific fields (`role`, `bannedUntil`, `bannedPermanently`, `deletedAt`) extend the Better Auth `User` model without breaking the adapter.

---

### 2. Turn `id` on Embedded Turns

**Added:** `GameTurn.id` (String, UUID generated server-side)

| Problem | Solution |
|---------|----------|
| Reports reference `targetId` as turn ID (Doc 7, Doc 9) | Stable turn ID independent of array index |
| Reconnect during reveal needs precise step reference | ID survives array mutations |

---

### 3. Reveal Sync Fields on Game

**Added:**

| Field | Type | Purpose |
|-------|------|---------|
| `revealChainIndex` | Int | Current chain in reveal playback |
| `revealStepIndex` | Int | Current step within chain |
| `votes` | `GameVotes?` | Embedded vote counts `{ counts: Json }` |

Enables reconnect during REVEAL phase — client fetches snapshot and resumes at exact step (Document 10 `reveal_chain_step`).

---

### 4. Pause State Preservation

**Added:**

| Field | Type | Purpose |
|-------|------|---------|
| `pauseRemainingMs` | Int? | Milliseconds remaining when paused |
| `pausedAt` | DateTime? | Already in Phase 0 — kept |

On resume, server recalculates `turnEndsAt` from `pauseRemainingMs` — avoids clock drift during pause.

---

### 5. Room Kick Blocklist

**Added:** `kickedPlayerIds String[] @default([])`

| Problem | Solution |
|---------|----------|
| Kicked player rejoins same room (Doc 13) | Check `playerId` against blocklist on join |
| Session invalidation alone insufficient | Persistent per-room block until room closes |

---

### 6. Room Close Metadata

**Added:**

| Field | Type | Purpose |
|-------|------|---------|
| `closedAt` | DateTime? | When room closed |
| `closeReason` | `RoomCloseReason?` | HOST, IDLE_TIMEOUT, EMPTY, ADMIN |

Supports analytics and `room_closed` Ably event payload (Document 10).

---

### 7. Game `updatedAt`

**Added:** `updatedAt DateTime @updatedAt`

Audit trail for debugging sync issues and stale snapshot detection.

---

### 8. Prisma Composite Types for Embeds

Phase 0 described TypeScript embeds. Finalized schema uses Prisma MongoDB composite types:

| Composite Type | Used In |
|----------------|---------|
| `RoomSettings` | `Room.settings` |
| `GameTurn` | `GameChain.turns[]` |
| `GameChain` | `Game.chains[]` |
| `GameVotes` | `Game.votes` |

**Benefit:** Type-safe nested structure in Prisma Client.  
**Tradeoff:** Full game document rewritten on each turn — acceptable for ≤12 players, ≤3 chains (Document 14).

---

### 9. Relation Design: Room ↔ Game

Two relations between Room and Game:

| Relation | Name | Purpose |
|----------|------|---------|
| `Room.currentGameId` → `Game.id` | `RoomCurrentGame` | Fast active game lookup |
| `Room.games` → `Game.roomId` | `RoomGames` | Historical games list |

`onDelete: NoAction` on current game relation prevents accidental cascade when archiving.

---

### 10. Achievement `criteria` as Json

**Added:** `criteria Json` on `Achievement`

Flexible rule definitions for post-MVP badge engine without schema migrations per badge.

---

## Items Unchanged from Phase 0

| Design decision | Kept because |
|-----------------|--------------|
| Embedded chains/turns in Game | Atomic turn writes; no N+1 |
| Separate RoomParticipant collection | Lobby queries without loading game |
| GuestSession TTL on `expiresAt` | Ephemeral guest identity |
| Soft delete on User, Room | GDPR + code recycling |
| UserStats denormalized | Fast profile reads |
| PromptPool separate collection | Seedable, filterable prompts |

---

## Index Strategy

### Defined in Prisma Schema (`@@index`)

| Model | Index | Purpose |
|-------|-------|---------|
| User | `deletedAt` | Soft delete filter |
| Account | `userId` | User's OAuth accounts |
| Session | `userId`, `expiresAt` | Session lookup + cleanup |
| GuestSession | `roomId`, `playerId`, `expiresAt` | Join + TTL |
| Room | `[status, visibility, lastActivityAt]` | Public lobby |
| Room | `lastActivityAt` | Idle cleanup job |
| RoomParticipant | `[roomId, playerId]` unique | Participant lookup |
| Game | `[roomId, status]` | Active game |
| GameHistory | `[userId, playedAt]` | Profile history |
| Report | `[status, createdAt]` | Admin queue |
| PromptPool | `[isActive, category]` | Prompt selection |

### Manual Indexes (MongoDB Atlas / migration script)

Prisma does not fully express TTL indexes. Create manually after first deploy:

```javascript
// scripts/create-ttl-indexes.js (run once per environment)

// Guest sessions — expire when expiresAt reached
db.guest_sessions.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "guest_session_ttl" }
);

// Optional: inactive rooms (prefer cron job for soft-close logic)
// db.rooms.createIndex(
//   { lastActivityAt: 1 },
//   { expireAfterSeconds: 7200, name: "room_idle_ttl" }
// );
```

**Decision:** Room idle cleanup uses **Vercel cron** (Document 15) rather than TTL delete — preserves history and allows graceful `room_closed` event.

---

## Validation Boundaries

Prisma schema defines **structure**, not business rules. Enforced in Zod + domain:

| Rule | Enforced In |
|------|-------------|
| Room code format `[A-Z0-9]{6}` | `domain/room/room-code.ts` + Zod |
| Display name 3–20 chars | `domain/shared/display-name.ts` + Zod |
| Settings ranges (timers, max players) | `shared/config/room.config.ts` + Zod |
| Turn submit authorization | `domain/game/game-state-machine.ts` |
| Optimistic lock `version` | `GameRepository` compare-and-set |

---

## Known Limitations & Future Paths

| Limitation | Mitigation | Future |
|------------|------------|--------|
| Full game doc rewrite per turn | Single indexed update; ≤50 turns/game | Shard turns to separate collection if >20 players |
| Json vote counts | Simple MVP voting | Typed `VoteRecord[]` embed |
| No full-text search on prompts | Random selection by category | Atlas Search index |
| GuestSession 1:1 room | Guest rejoining different room needs new session | By design |
| `participantIds` denormalized on Room | Sync on join/leave in service layer | Could derive from RoomParticipant query only |

---

## Schema Validation Checklist

- [x] All Document 7 collections represented
- [x] Better Auth models compatible
- [x] Game state machine fields complete (Doc 11)
- [x] Report targetId references stable turn IDs
- [x] Reveal reconnect fields present
- [x] Indexes for all Document 7 query patterns
- [x] Soft deletes on User, Room
- [x] Enums match domain constants
- [x] Relations avoid circular cascade on Game/Room
- [x] Seed data plan for PromptPool + Achievement

---

## Related Documents

- Prisma schema: [`../../prisma/schema.prisma`](../../prisma/schema.prisma)
- Schema reference: [02-prisma-schema-reference.md](./02-prisma-schema-reference.md)
- Phase 0 DB design: [../phase-0/07-database-design.md](../phase-0/07-database-design.md)
- ER diagram: [../phase-0/08-er-diagram.md](../phase-0/08-er-diagram.md)

## Approval Gate

Phase 4 (authentication flow design) begins after Phase 3 approval.
