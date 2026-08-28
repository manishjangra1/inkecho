# Document 8 — ER Diagram

## Entity Relationship Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              INKECHO DATA MODEL                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│      USER        │         │     ACCOUNT      │         │     SESSION      │
├──────────────────┤         ├──────────────────┤         ├──────────────────┤
│ PK _id           │───┐     │ PK _id           │         │ PK _id           │
│    email (UQ)    │   │     │ FK userId        │◄────────│ FK userId        │
│    name          │   └────►│    provider      │         │    token (UQ)    │
│    image         │   1   * │    providerAccId │    1  * │    expiresAt     │
│    role          │         └──────────────────┘         └──────────────────┘
│    bannedUntil   │
│    deletedAt     │
└────────┬─────────┘
         │
         │ 1
         │
         │ *
┌────────▼─────────┐                              ┌──────────────────┐
│  USER_STATS      │                              │   ACHIEVEMENT    │
├──────────────────┤                              ├──────────────────┤
│ PK _id           │                              │ PK _id           │
│ FK userId (UQ)   │                              │    code (UQ)     │
│    gamesPlayed   │         ┌──────────────────┐ │    name          │
│    gamesWon      │         │ USER_ACHIEVEMENT │ │    criteria      │
│    chainsCompleted│   1   *├──────────────────┤ └────────┬─────────┘
└──────────────────┘◄────────│ FK userId        │          │
                             │ FK achievementId │◄─────────┘
                             │    unlockedAt    │     *
                             └──────────────────┘     1

┌──────────────────┐
│  GUEST_SESSION   │
├──────────────────┤
│ PK _id           │
│    token (UQ)    │
│    displayName   │
│ FK roomId        │──────────────────┐
│    playerId      │                  │
│    expiresAt TTL │                  │
└──────────────────┘                  │
                                      │ *
                                      │
                                      │ 1
                             ┌────────▼─────────┐
                             │      ROOM        │
                             ├──────────────────┤
                             │ PK _id           │
                             │    code (UQ)     │
                             │    hostPlayerId  │
                             │    visibility    │
                             │    status        │
                             │    settings {}   │
                             │ FK currentGameId │───┐
                             │    lastActivityAt│   │
                             │    deletedAt     │   │
                             └────────┬─────────┘   │
                                      │             │
                              1       │       *     │ 0..1
                                      │             │
                             ┌────────▼─────────┐   │
                             │ ROOM_PARTICIPANT │   │
                             ├──────────────────┤   │
                             │ PK _id           │   │
                             │ FK roomId        │   │
                             │    playerId      │   │
                             │ FK userId (opt)  │───┼──► USER
                             │ FK guestSessionId│───┼──► GUEST_SESSION
                             │    displayName   │   │
                             │    role          │   │
                             │    isReady       │   │
                             │    connStatus    │   │
                             └──────────────────┘   │
                                                    │
                                      ┌─────────────▼─────────┐
                                      │         GAME          │
                                      ├───────────────────────┤
                                      │ PK _id                │
                                      │ FK roomId             │
                                      │    status             │
                                      │    version            │
                                      │    turnPhase          │
                                      │    turnEndsAt         │
                                      │    activePlayerId     │
                                      │    playerOrder[]      │
                                      │ ┌───────────────────┐ │
                                      │ │ chains[] (embed)  │ │
                                      │ │  chainIndex       │ │
                                      │ │  starterPrompt    │ │
                                      │ │  turns[] (embed)  │ │
                                      │ │   turnIndex       │ │
                                      │ │   playerId        │ │
                                      │ │   phase           │ │
                                      │ │   textContent     │ │
                                      │ │   drawingUrl      │ │
                                      │ │   submittedAt     │ │
                                      │ └───────────────────┘ │
                                      └───────────┬───────────┘
                                                  │
                          ┌───────────────────────┼───────────────────────┐
                          │                       │                       │
                          │ *                     │ *                     │
                 ┌────────▼─────────┐    ┌────────▼─────────┐    ┌───────▼──────────┐
                 │  GAME_HISTORY    │    │     REPORT       │    │   PROMPT_POOL    │
                 ├──────────────────┤    ├──────────────────┤    ├──────────────────┤
                 │ PK _id           │    │ PK _id           │    │ PK _id           │
                 │ FK gameId        │    │ FK gameId        │    │    text          │
                 │ FK roomId        │    │    targetType    │    │    category      │
                 │ FK userId        │───►│    targetId      │    │    isActive      │
                 │    playerId      │USER │    reason        │    │    language      │
                 │    placement     │    │    status        │    └──────────────────┘
                 │    playedAt      │    │ FK reviewedBy    │───► USER (admin)
                 └──────────────────┘    └──────────────────┘
```

---

## Relationship Cardinality Summary

| From | To | Cardinality | Notes |
|------|-----|-------------|-------|
| User | Account | 1:N | OAuth providers |
| User | Session | 1:N | Active sessions |
| User | UserStats | 1:1 | Aggregated metrics |
| User | UserAchievement | 1:N | Badge unlocks |
| User | RoomParticipant | 1:N | Optional (guests skip User) |
| User | GameHistory | 1:N | Registered only |
| GuestSession | Room | N:1 | One room per guest session |
| Room | RoomParticipant | 1:N | Players + spectators |
| Room | Game | 1:N | Historical games |
| Room | Game (current) | 1:0..1 | Via `currentGameId` |
| Game | Chain | 1:N | Embedded array |
| Chain | Turn | 1:N | Embedded array |
| Game | Report | 1:N | Moderation |
| Game | GameHistory | 1:N | One per registered participant |
| Achievement | UserAchievement | 1:N | Badge definitions |

---

## Embedded vs Referenced

| Data | Storage | Rationale |
|------|---------|-----------|
| Chain + Turn | Embedded in Game | Atomic read/write per turn; no joins |
| Room Settings | Embedded in Room | Always loaded with room |
| User Stats | Separate collection | Updated independently; fast profile read |
| Drawings | Cloudinary URL in Turn | Binary offloaded; DB stores reference |
| Participants | Separate collection | Query lobby without loading full game |

---

## Key Constraints

```
UQ: User.email
UQ: GuestSession.token
UQ: Room.code
UQ: RoomParticipant(roomId, playerId)
UQ: UserStats.userId
UQ: Achievement.code

FK: GuestSession.roomId → Room._id
FK: RoomParticipant.roomId → Room._id
FK: RoomParticipant.userId → User._id (nullable)
FK: Game.roomId → Room._id
FK: GameHistory.userId → User._id
FK: Report.gameId → Game._id

TTL: GuestSession.expiresAt
IDX: Room(status, visibility, lastActivityAt)
IDX: Game(roomId, status)
```

---

## State-Driven Entities

Room and Game statuses drive which relationships are active:

```
Room.status = LOBBY       → RoomParticipant.isReady relevant
Room.status = IN_PROGRESS → Game (current) active
Room.status = REVEAL      → Game.status = REVEAL
Room.status = CLOSED      → All FKs preserved for history
```

See Document 11 for full state machine.
