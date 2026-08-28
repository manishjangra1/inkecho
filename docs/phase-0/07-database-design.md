# Document 7 — Database Design

## Overview

InkEcho uses **MongoDB** via **Prisma ORM**. Documents are modeled for **room-scoped game state**, **user identity**, and **audit/moderation**. All collections support **soft deletes** where noted.

---

## Collections

### User

Registered account holder.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✓ | Primary key |
| `email` | String | ✓ | Unique, lowercase |
| `emailVerified` | DateTime | | Verification timestamp |
| `name` | String | ✓ | Display name |
| `image` | String | | Avatar URL |
| `role` | Enum | ✓ | `USER` \| `ADMIN` |
| `bannedUntil` | DateTime | | Temp ban expiry |
| `bannedPermanently` | Boolean | ✓ | Default false |
| `createdAt` | DateTime | ✓ | |
| `updatedAt` | DateTime | ✓ | |
| `deletedAt` | DateTime | | Soft delete |

---

### Account / Session (Better Auth)

Managed by Better Auth adapter — standard OAuth + credential accounts.

| Collection | Purpose |
|------------|---------|
| `Account` | OAuth provider links |
| `Session` | Active user sessions |
| `Verification` | Email verification tokens |

---

### GuestSession

Ephemeral player identity for non-registered users.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✓ | |
| `token` | String | ✓ | Unique signed token ID |
| `displayName` | String | ✓ | 3–20 chars |
| `playerId` | String | ✓ | UUID v4, stable for room |
| `roomId` | ObjectId | ✓ | FK → Room |
| `expiresAt` | DateTime | ✓ | TTL index |
| `createdAt` | DateTime | ✓ | |
| `lastSeenAt` | DateTime | ✓ | Updated on heartbeat |

---

### Room

Game room container.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✓ | |
| `code` | String | ✓ | Unique 6-char uppercase |
| `hostPlayerId` | String | ✓ | Current host playerId |
| `visibility` | Enum | ✓ | `PUBLIC` \| `PRIVATE` |
| `status` | Enum | ✓ | `LOBBY` \| `IN_PROGRESS` \| `REVEAL` \| `CLOSED` |
| `settings` | Object | ✓ | See Settings embed |
| `participantIds` | String[] | ✓ | Active player IDs |
| `spectatorIds` | String[] | ✓ | Spectator IDs |
| `currentGameId` | ObjectId | | Active game reference |
| `lastActivityAt` | DateTime | ✓ | Idle TTL tracking |
| `createdAt` | DateTime | ✓ | |
| `updatedAt` | DateTime | ✓ | |
| `deletedAt` | DateTime | | Soft delete |

**Settings embed:**

```typescript
{
  maxPlayers: number;        // 3–12, default 8
  minPlayers: number;        // default 3
  roundCount: number;        // chains per game, default 1
  describeTimerSec: number;  // 30–120, default 60
  drawTimerSec: number;      // 60–180, default 90
  profanityFilter: boolean;  // default false
  allowSpectators: boolean;  // default true
}
```

---

### RoomParticipant

Join metadata per player in a room (denormalized for queries).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✓ | |
| `roomId` | ObjectId | ✓ | |
| `playerId` | String | ✓ | UUID |
| `userId` | ObjectId | | Null for guests |
| `guestSessionId` | ObjectId | | Null for registered |
| `displayName` | String | ✓ | |
| `avatarUrl` | String | | |
| `role` | Enum | ✓ | `HOST` \| `PLAYER` \| `SPECTATOR` |
| `isReady` | Boolean | ✓ | Lobby only |
| `connectionStatus` | Enum | ✓ | `ONLINE` \| `RECONNECTING` \| `OFFLINE` |
| `joinedAt` | DateTime | ✓ | |
| `leftAt` | DateTime | | Set on leave/kick |

**Unique index:** `{ roomId, playerId }`

---

### Game

Single game instance within a room.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✓ | |
| `roomId` | ObjectId | ✓ | |
| `status` | Enum | ✓ | `IN_PROGRESS` \| `PAUSED` \| `REVEAL` \| `COMPLETED` |
| `version` | Int | ✓ | Optimistic lock counter |
| `currentRoundIndex` | Int | ✓ | 0-based |
| `currentChainIndex` | Int | ✓ | Active chain |
| `currentTurnIndex` | Int | ✓ | Active turn in chain |
| `turnPhase` | Enum | ✓ | `DESCRIBE` \| `DRAW` |
| `turnStartedAt` | DateTime | ✓ | |
| `turnEndsAt` | DateTime | ✓ | Server-authoritative |
| `activePlayerId` | String | ✓ | Current turn player |
| `chains` | Chain[] | ✓ | Embedded array |
| `playerOrder` | String[] | ✓ | Shuffled turn order |
| `pausedAt` | DateTime | | |
| `completedAt` | DateTime | | |
| `createdAt` | DateTime | ✓ | |

**Chain embed:**

```typescript
{
  chainIndex: number;
  starterPrompt: string;       // First describe prompt
  turns: Turn[];
}
```

**Turn embed:**

```typescript
{
  turnIndex: number;
  playerId: string;
  phase: 'DESCRIBE' | 'DRAW';
  textContent?: string;        // Describe phase result
  drawingUrl?: string;         // Cloudinary URL
  drawingPublicId?: string;    // Cloudinary ID for deletion
  submittedAt?: DateTime;
  skipped: boolean;            // Disconnect skip
  autoSubmitted: boolean;      // Timer expiry
}
```

---

### GameHistory

Summary for registered users (denormalized for profile).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✓ | |
| `gameId` | ObjectId | ✓ | |
| `roomId` | ObjectId | ✓ | |
| `roomCode` | String | ✓ | |
| `userId` | ObjectId | ✓ | |
| `playerId` | String | ✓ | |
| `placement` | Int | | Vote ranking |
| `chainsPlayed` | Int | ✓ | |
| `wonVote` | Boolean | | |
| `playedAt` | DateTime | ✓ | |
| `snapshotUrl` | String | | Optional reveal summary |

---

### UserStats

Aggregated statistics (updated on game complete).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✓ | |
| `userId` | ObjectId | ✓ | Unique |
| `gamesPlayed` | Int | ✓ | |
| `gamesWon` | Int | ✓ | |
| `chainsCompleted` | Int | ✓ | |
| `turnsSubmitted` | Int | ✓ | |
| `updatedAt` | DateTime | ✓ | |

---

### Achievement / UserAchievement

| Collection | Purpose |
|------------|---------|
| `Achievement` | Badge definitions (code, name, criteria) |
| `UserAchievement` | Unlocked badges per user |

---

### Report

Content moderation queue.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✓ | |
| `reporterPlayerId` | String | ✓ | |
| `reporterUserId` | ObjectId | | |
| `targetType` | Enum | ✓ | `DRAWING` \| `DESCRIPTION` \| `USER` |
| `targetId` | String | ✓ | Turn ID or userId |
| `gameId` | ObjectId | ✓ | |
| `reason` | Enum | ✓ | `NSFW` \| `HARASSMENT` \| `SPAM` \| `OTHER` |
| `notes` | String | | |
| `status` | Enum | ✓ | `PENDING` \| `REVIEWED` \| `DISMISSED` |
| `reviewedBy` | ObjectId | | Admin userId |
| `createdAt` | DateTime | ✓ | |

---

### PromptPool

Curated starter prompts.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✓ | |
| `text` | String | ✓ | |
| `category` | Enum | ✓ | `FUNNY` \| `OBJECT` \| `ACTION` \| `POP_CULTURE` |
| `isActive` | Boolean | ✓ | |
| `language` | String | ✓ | Default `en` |

---

## Relationships

```
User 1──* RoomParticipant *──1 Room
User 1──1 UserStats
User 1──* GameHistory
User 1──* UserAchievement *──1 Achievement
GuestSession *──1 Room
Room 1──* Game (historical)
Room 1──0..1 Game (current via currentGameId)
Game embeds Chain[] embeds Turn[]
Report *──1 Game
```

---

## Indexes

| Collection | Index | Type | Purpose |
|------------|-------|------|---------|
| User | `{ email: 1 }` | Unique | Login lookup |
| User | `{ deletedAt: 1 }` | Sparse | Soft delete filter |
| GuestSession | `{ token: 1 }` | Unique | Reconnect |
| GuestSession | `{ expiresAt: 1 }` | TTL | Auto cleanup (expireAfterSeconds: 0) |
| Room | `{ code: 1 }` | Unique | Join by code |
| Room | `{ status: 1, visibility: 1, lastActivityAt: -1 }` | Compound | Public lobby list |
| Room | `{ lastActivityAt: 1 }` | TTL | Inactive room cleanup (optional job) |
| RoomParticipant | `{ roomId: 1, playerId: 1 }` | Unique | Participant lookup |
| RoomParticipant | `{ roomId: 1, role: 1 }` | Compound | Lobby queries |
| Game | `{ roomId: 1, status: 1 }` | Compound | Active game lookup |
| GameHistory | `{ userId: 1, playedAt: -1 }` | Compound | Profile history |
| Report | `{ status: 1, createdAt: -1 }` | Compound | Admin queue |
| PromptPool | `{ isActive: 1, category: 1 }` | Compound | Prompt selection |

---

## Validation Rules

| Entity | Rule |
|--------|------|
| Room.code | `/^[A-Z0-9]{6}$/`, generated server-side |
| Display name | 3–20 chars, no leading/trailing spaces |
| Description text | 1–200 chars, trimmed |
| Settings.maxPlayers | 3–12 |
| Settings timers | Within configured min/max |
| Game.version | Increment on every mutation |
| Turn submit | Only `activePlayerId` may submit current turn |
| Room transition | Validated by state machine (Document 11) |

All validation enforced in **Zod schemas** (application layer) and **domain services**.

---

## Soft Deletes

| Collection | Field | Behavior |
|------------|-------|----------|
| User | `deletedAt` | Account hidden; login blocked |
| Room | `deletedAt` | Room inaccessible; code recycled after 30 days |

Queries default: `{ deletedAt: null }`

---

## TTL (Time-To-Live)

| Collection | Mechanism | Duration |
|------------|-----------|----------|
| GuestSession | MongoDB TTL index on `expiresAt` | 24 hours |
| Room (inactive) | Scheduled job or TTL on `lastActivityAt` | 2 hours (config) |
| Cloudinary assets | Cloudinary lifecycle / cron | 90 days |
| Session (Better Auth) | Auth config | 30 days rolling |

---

## Data Migration Strategy

- Prisma `migrate` for schema changes
- Backward-compatible migrations only in production
- Game document versioning for in-flight games during deploy
- Seed script for `PromptPool` and default `Achievement` records

---

## Backup & Recovery

| Concern | Approach |
|---------|----------|
| MongoDB Atlas | Continuous backup, point-in-time restore |
| Cloudinary | CDN URLs stored in DB; assets recoverable via publicId |
| Disaster recovery RPO | ≤ 1 hour (Atlas tier dependent) |
| Disaster recovery RTO | ≤ 4 hours |

---

## Related Documents

- ER Diagram: Document 8
- Prisma schema: Phase 3
- API contracts: Document 9
