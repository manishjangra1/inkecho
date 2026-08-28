# Phase 3 — Document 2: Prisma Schema Reference

## Quick Reference

| Item | Value |
|------|-------|
| Provider | MongoDB |
| ORM | Prisma 5.x+ |
| Schema file | `prisma/schema.prisma` |
| Seed file | `prisma/seed.ts` |
| Collections | 16 models + 4 composite types |

---

## Model Catalog

| Model | Collection | Purpose |
|-------|------------|---------|
| `User` | `users` | Registered accounts (+ Better Auth) |
| `Account` | `accounts` | OAuth provider links |
| `Session` | `sessions` | Better Auth sessions |
| `Verification` | `verifications` | Email verification tokens |
| `GuestSession` | `guest_sessions` | Ephemeral guest players |
| `Room` | `rooms` | Game room container |
| `RoomParticipant` | `room_participants` | Player/spectator in room |
| `Game` | `games` | Active/completed game state |
| `GameHistory` | `game_history` | Profile game records |
| `UserStats` | `user_stats` | Aggregated player stats |
| `Achievement` | `achievements` | Badge definitions |
| `UserAchievement` | `user_achievements` | Unlocked badges |
| `Report` | `reports` | Moderation queue |
| `PromptPool` | `prompt_pool` | Starter prompts |

---

## Composite Types

### RoomSettings

```prisma
type RoomSettings {
  maxPlayers       Int     @default(8)
  minPlayers       Int     @default(3)
  roundCount       Int     @default(1)
  describeTimerSec Int     @default(60)
  drawTimerSec     Int     @default(90)
  profanityFilter  Boolean @default(false)
  allowSpectators  Boolean @default(true)
}
```

Defaults match `shared/config/room.config.ts` (implemented in M2).

---

### GameTurn

```prisma
type GameTurn {
  id               String      // UUID — report targetId
  turnIndex        Int
  playerId         String
  phase            TurnPhase
  textContent      String?
  drawingUrl       String?
  drawingPublicId  String?
  submittedAt      DateTime?
  skipped          Boolean   @default(false)
  autoSubmitted    Boolean   @default(false)
}
```

---

### GameChain

```prisma
type GameChain {
  chainIndex    Int
  starterPrompt String
  turns         GameTurn[]
}
```

**Turn count per chain:** `2N - 1` where N = player count (Document 11).

---

### GameVotes

```prisma
type GameVotes {
  counts Json  // { "0": 3, "1": 1 }
}
```

---

## Enum Reference

| Enum | Values | Used By |
|------|--------|---------|
| `UserRole` | USER, ADMIN | User.role |
| `RoomVisibility` | PUBLIC, PRIVATE | Room.visibility |
| `RoomStatus` | LOBBY, IN_PROGRESS, REVEAL, CLOSED | Room.status |
| `ParticipantRole` | HOST, PLAYER, SPECTATOR | RoomParticipant.role |
| `ConnectionStatus` | ONLINE, RECONNECTING, OFFLINE | RoomParticipant.connectionStatus |
| `GameStatus` | IN_PROGRESS, PAUSED, REVEAL, COMPLETED | Game.status |
| `TurnPhase` | DESCRIBE, DRAW | Game.turnPhase, GameTurn.phase |
| `ReportTargetType` | DRAWING, DESCRIPTION, USER | Report.targetType |
| `ReportReason` | NSFW, HARASSMENT, SPAM, OTHER | Report.reason |
| `ReportStatus` | PENDING, REVIEWED, DISMISSED | Report.status |
| `PromptCategory` | FUNNY, OBJECT, ACTION, POP_CULTURE | PromptPool.category |
| `RoomCloseReason` | HOST, IDLE_TIMEOUT, EMPTY, ADMIN | Room.closeReason |

---

## Relationship Map

```
User ──1:N── Account
User ──1:N── Session
User ──1:1── UserStats
User ──1:N── GameHistory
User ──1:N── UserAchievement ──N:1── Achievement
User ──1:N── RoomParticipant

GuestSession ──N:1── Room
RoomParticipant ──N:1── Room
RoomParticipant ──N:1── User (optional)
RoomParticipant ──N:1── GuestSession (optional)

Room ──1:N── Game (RoomGames)
Room ──0:1── Game (RoomCurrentGame via currentGameId)

Game ──1:N── Report
Game ──1:N── GameHistory
```

---

## Common Queries (Repository Patterns)

### Find room by code

```typescript
prisma.room.findUnique({
  where: { code: 'ABC123' },
  include: { participants: { where: { leftAt: null } } },
});
```

### Find active game for room

```typescript
prisma.game.findFirst({
  where: {
    roomId,
    status: { in: ['IN_PROGRESS', 'PAUSED', 'REVEAL'] },
  },
});
```

### Optimistic lock update

```typescript
prisma.game.updateMany({
  where: { id: gameId, version: expectedVersion },
  data: {
    version: { increment: 1 },
    // ... turn update
  },
});
// if count === 0 → VERSION_CONFLICT
```

### Public lobby rooms

```typescript
prisma.room.findMany({
  where: {
    status: 'LOBBY',
    visibility: 'PUBLIC',
    deletedAt: null,
  },
  orderBy: { lastActivityAt: 'desc' },
  take: 20,
});
```

### Profile history

```typescript
prisma.gameHistory.findMany({
  where: { userId },
  orderBy: { playedAt: 'desc' },
  take: 10,
});
```

### Random active prompt

```typescript
const count = await prisma.promptPool.count({
  where: { isActive: true, category: 'FUNNY' },
});
const skip = Math.floor(Math.random() * count);
const prompt = await prisma.promptPool.findFirst({
  where: { isActive: true, category: 'FUNNY' },
  skip,
});
```

---

## Mapper Responsibilities

Repositories use mappers (`infrastructure/db/mappers/`) to convert:

| Direction | Transform |
|-----------|-----------|
| Prisma → Domain | Strip ObjectIds to strings; map enums |
| Domain → Prisma | Build composite types for chains/turns |
| Prisma → DTO | Filter hidden content per player (visibility-filter.ts) |

**Never expose raw Prisma types to client** — always map to DTOs in Server Actions.

---

## Seed Data

`prisma/seed.ts` populates:

| Data | Count | Notes |
|------|-------|-------|
| PromptPool | ~50 prompts | Mixed categories |
| Achievement | ~5 badges | MVP set, `isActive: true` |

Run: `pnpm prisma db seed` (after M2 project setup).

---

## Migration Workflow

```bash
# Development — push schema to Atlas dev cluster
pnpm prisma db push

# Production — use migrate (when stable)
pnpm prisma migrate dev --name init
pnpm prisma migrate deploy

# Generate client after schema change
pnpm prisma generate

# Seed
pnpm prisma db seed
```

**Note:** MongoDB migrations in Prisma are evolving. For MVP, `db push` on dev and `migrate deploy` on prod once schema stabilizes.

---

## Type Generation

Prisma Client exports:

```typescript
import type {
  User,
  Room,
  Game,
  GameChain,
  GameTurn,
  RoomSettings,
  RoomStatus,
  GameStatus,
  TurnPhase,
} from '@prisma/client';
```

Domain layer defines **its own types** — mappers bridge Prisma ↔ Domain. Do not import `@prisma/client` in `domain/`.

---

## Related Documents

- Review & improvements: [01-schema-review-and-improvements.md](./01-schema-review-and-improvements.md)
- Schema file: [`../../prisma/schema.prisma`](../../prisma/schema.prisma)
- Seed file: [`../../prisma/seed.ts`](../../prisma/seed.ts)
