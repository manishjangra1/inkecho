# Phase 6 — Document 2: Repositories & Mappers

## Overview

Repositories encapsulate **all Prisma access**. No `prisma.*` calls outside `infrastructure/db/`. Mappers translate between Prisma documents, domain entities, and client DTOs.

---

## Repository Principles

| Rule | Detail |
|------|--------|
| One repo per aggregate root | Room, Game, User, etc. |
| Return `Result<T, AppError>` | Never throw for expected failures |
| Soft delete aware | Default queries exclude `deletedAt != null` |
| Optimistic locking | Game updates use `updateWithVersion` |
| No business rules | "Can submit?" belongs in domain/service |
| Logging | Log slow queries > 500ms at warn |

---

## Repository Catalog

### UserRepository

File: `infrastructure/db/repositories/user.repository.ts`

| Method | Returns | Description |
|--------|---------|-------------|
| `findById(id)` | `Result<UserDto>` | By ObjectId |
| `findByEmail(email)` | `Result<UserDto \| null>` | Login lookup |
| `updateProfile(id, data)` | `Result<UserDto>` | Name, image |
| `banUser(id, options)` | `Result<void>` | Admin ban |
| `isBanned(id)` | `boolean` | Check ban status |
| `softDelete(id)` | `Result<void>` | Set deletedAt |

---

### GuestSessionRepository

| Method | Returns | Description |
|--------|---------|-------------|
| `create(data)` | `Result<GuestSessionEntity>` | New session |
| `findByToken(token)` | `Result<GuestSessionEntity \| null>` | JWT validation |
| `findById(id)` | `Result<GuestSessionEntity \| null>` | By id |
| `updateLastSeen(id)` | `Result<void>` | Heartbeat |
| `delete(id)` | `Result<void>` | Revoke on kick |
| `deleteExpired()` | `number` | Cron cleanup count |

---

### RoomRepository

| Method | Returns | Description |
|--------|---------|-------------|
| `create(data)` | `Result<RoomEntity>` | New room + settings |
| `findByCode(code)` | `Result<RoomEntity \| null>` | Join lookup |
| `findById(id)` | `Result<RoomEntity>` | By id |
| `updateSettings(id, settings)` | `Result<RoomEntity>` | Host settings |
| `updateStatus(id, status)` | `Result<RoomEntity>` | State transitions |
| `setCurrentGameId(id, gameId)` | `Result<void>` | Link active game |
| `addKickedPlayer(id, playerId)` | `Result<void>` | Kick blocklist |
| `updateLastActivity(id)` | `Result<void>` | Touch timestamp |
| `listPublic(params)` | `Result<Paginated<RoomListItem>>` | Browse lobby |
| `close(id, reason)` | `Result<void>` | Set CLOSED + closedAt |
| `softDelete(id)` | `Result<void>` | Soft delete |

---

### ParticipantRepository

| Method | Returns | Description |
|--------|---------|-------------|
| `create(data)` | `Result<ParticipantEntity>` | Join room |
| `findByRoomAndPlayer(roomId, playerId)` | `Result<ParticipantEntity \| null>` | Auth check |
| `listByRoom(roomId)` | `Result<ParticipantEntity[]>` | Lobby — active only |
| `updateReady(roomId, playerId, isReady)` | `Result<ParticipantEntity>` | Ready toggle |
| `updateConnectionStatus(roomId, playerId, status)` | `Result<void>` | Presence sync |
| `updateRole(roomId, playerId, role)` | `Result<void>` | Host transfer |
| `markLeft(roomId, playerId)` | `Result<void>` | Leave/kick |
| `countByRoom(roomId)` | `number` | Capacity check |

---

### GameRepository

| Method | Returns | Description |
|--------|---------|-------------|
| `create(data)` | `Result<GameEntity>` | New game document |
| `findById(id)` | `Result<GameEntity>` | Full game |
| `findActiveByRoomId(roomId)` | `Result<GameEntity \| null>` | IN_PROGRESS/PAUSED/REVEAL |
| `updateWithVersion(id, expected, data)` | `Result<GameEntity>` | Optimistic lock |
| `incrementRevealStep(id, version, step)` | `Result<GameEntity>` | Reveal orchestration |

**Critical method:**

```typescript
async updateWithVersion(
  id: string,
  expectedVersion: number,
  updateFn: (game: GameEntity) => Partial<GameDocument>,
): Promise<Result<GameEntity, AppError>> {
  const current = await this.findById(id);
  if (!current.ok) return current;

  const patch = updateFn(current.value);
  const result = await prisma.game.updateMany({
    where: { id, version: expectedVersion },
    data: { ...patch, version: { increment: 1 } },
  });

  if (result.count === 0) {
    const latest = await this.findById(id);
    return err(new ConflictError('VERSION_CONFLICT', { snapshot: mapGameToDto(latest.value) }));
  }

  return this.findById(id);
}
```

---

### GameHistoryRepository

| Method | Returns | Description |
|--------|---------|-------------|
| `createMany(records)` | `Result<void>` | Post-game batch |
| `listByUser(userId, pagination)` | `Result<Paginated<GameHistoryItem>>` | Profile |

---

### UserStatsRepository

| Method | Returns | Description |
|--------|---------|-------------|
| `findByUserId(userId)` | `Result<UserStatsEntity>` | Profile |
| `increment(userId, deltas)` | `Result<void>` | Atomic counters |
| `ensureExists(userId)` | `Result<void>` | Create on signup |

---

### PromptPoolRepository

| Method | Returns | Description |
|--------|---------|-------------|
| `randomActive(category?)` | `Result<string>` | Starter prompt text |
| `listActive(category?)` | `Result<PromptEntity[]>` | Admin/seed |

---

### ReportRepository

| Method | Returns | Description |
|--------|---------|-------------|
| `create(data)` | `Result<ReportEntity>` | Player report |
| `listPending(pagination)` | `Result<Paginated<ReportEntity>>` | Admin queue |
| `updateStatus(id, status, reviewerId)` | `Result<void>` | Review |

---

## Mapper Layer

Files: `infrastructure/db/mappers/*.ts`

### Responsibilities

| Mapper | Functions |
|--------|-----------|
| `room.mapper.ts` | `toDomain()`, `toDto()`, `toPrismaCreate()` |
| `game.mapper.ts` | `toDomain()`, `toSnapshotDto(ctx)`, `chainsToPrisma()` |
| `participant.mapper.ts` | `toDomain()`, `toLobbyDto()` |
| `user.mapper.ts` | `toDomain()`, `toProfileDto()` |

### Game Snapshot Filtering

```typescript
// game.mapper.ts
export function toSnapshotDto(game: GameEntity, viewerPlayerId: string): GameSnapshotDto {
  return {
    gameId: game.id,
    version: game.version,
    status: game.status,
    currentTurn: toTurnDto(game.currentTurn, viewerPlayerId, game),
    chains: filterChainsForViewer(game.chains, viewerPlayerId, game.status),
    // ...
  };
}
```

Uses `domain/game/visibility-filter.ts` for rules.

### Domain ↔ Prisma

```typescript
// Domain entity (plain interface — NOT Prisma type)
interface GameEntity {
  id: string;
  roomId: string;
  version: number;
  status: GameStatus;
  chains: ChainEntity[];
  // ...
}

function toDomain(raw: Game): GameEntity {
  return {
    id: raw.id,
    roomId: raw.roomId,
    version: raw.version,
    chains: raw.chains.map(toChainDomain),
    // ...
  };
}
```

---

## Query Patterns

### Active participant filter

```typescript
where: { roomId, leftAt: null }
```

### Public rooms

```typescript
where: {
  status: 'LOBBY',
  visibility: 'PUBLIC',
  deletedAt: null,
},
orderBy: { lastActivityAt: 'desc' },
```

### Game by room + status

```typescript
where: {
  roomId,
  status: { in: ['IN_PROGRESS', 'PAUSED', 'REVEAL'] },
},
orderBy: { createdAt: 'desc' },
take: 1,
```

---

## Index Usage Verification

| Repository method | Index used |
|-------------------|------------|
| `findByCode` | `Room.code` unique |
| `findActiveByRoomId` | `Game.[roomId, status]` |
| `listPublic` | `Room.[status, visibility, lastActivityAt]` |
| `findByToken` | `GuestSession.token` unique |
| `listByUser history` | `GameHistory.[userId, playedAt]` |

---

## Error Mapping

| Condition | Error |
|-----------|-------|
| Record not found | `NotFoundError` with code `ROOM_NOT_FOUND` etc. |
| Version mismatch | `ConflictError` `VERSION_CONFLICT` + snapshot |
| Unique constraint | `ConflictError` `DUPLICATE` |
| Prisma connection fail | `ExternalServiceError` |

---

## Related Documents

- Overview: [01-backend-architecture-overview.md](./01-backend-architecture-overview.md)
- Services: [03-application-services.md](./03-application-services.md)
- Prisma schema: [../phase-3/02-prisma-schema-reference.md](../phase-3/02-prisma-schema-reference.md)
