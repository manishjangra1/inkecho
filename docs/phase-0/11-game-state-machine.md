# Document 11 — Game State Machine

## Overview

InkEcho game flow is modeled as a **hierarchical state machine**:

1. **Room State Machine** — lobby, in-progress, reveal, closed
2. **Game State Machine** — turn phases within an active game
3. **Turn State Machine** — describe/draw submission lifecycle

The server is the **sole authority** for transitions. Invalid transitions return `409 INVALID_TRANSITION`.

---

## Room State Machine

```
                    ┌─────────┐
                    │  LOBBY  │◄──────────────────────┐
                    └────┬────┘                       │
                         │ startGame (host, ≥3 ready)  │ rematch (host)
                         ▼                             │
                  ┌─────────────┐                      │
                  │ IN_PROGRESS │                      │
                  └──────┬──────┘                      │
                         │ allChainsComplete            │
                         ▼                             │
                    ┌─────────┐                        │
                    │ REVEAL  │────────────────────────┘
                    └────┬────┘
                         │ idle timeout / host close / empty
                         ▼
                    ┌─────────┐
                    │ CLOSED  │
                    └─────────┘
```

### Room States

| State | Description | Allowed Actions |
|-------|-------------|-----------------|
| `LOBBY` | Waiting for players | join, leave, ready, kick, settings, start |
| `IN_PROGRESS` | Active game | submit turn, pause, spectate, leave |
| `REVEAL` | Chain playback | vote, rematch, spectate |
| `CLOSED` | Terminal | none (read-only history) |

### Room Transitions

| From | Event | To | Guard |
|------|-------|-----|-------|
| LOBBY | `START_GAME` | IN_PROGRESS | host, ≥3 ready players |
| IN_PROGRESS | `ALL_CHAINS_DONE` | REVEAL | all turns submitted/skipped |
| REVEAL | `REMATCH` | LOBBY | host |
| REVEAL | `CLOSE` | CLOSED | host or idle TTL |
| LOBBY | `CLOSE` | CLOSED | host or idle TTL |
| IN_PROGRESS | `CLOSE` | CLOSED | host (abandon) |
| * | `IDLE_TIMEOUT` | CLOSED | lastActivity > threshold |

---

## Game State Machine

```
                         ┌─────────────┐
                    ┌───►│ IN_PROGRESS │◄───┐
                    │    └──────┬──────┘    │
                    │           │           │
              resume│    pause  │           │resume
                    │           ▼           │
                    │    ┌─────────┐        │
                    └────│ PAUSED  │────────┘
                         └─────────┘

                    IN_PROGRESS
                         │
                         │ allChainsComplete
                         ▼
                    ┌─────────┐
                    │ REVEAL  │
                    └────┬────┘
                         │ revealFinished
                         ▼
                    ┌───────────┐
                    │ COMPLETED │
                    └───────────┘
```

### Game States

| State | Description |
|-------|-------------|
| `IN_PROGRESS` | Active turn rotation |
| `PAUSED` | Host paused; timer frozen |
| `REVEAL` | Playback phase (may overlap room REVEAL) |
| `COMPLETED` | Terminal; stats recorded |

---

## Turn Phase State Machine

Within `IN_PROGRESS`, each turn cycles:

```
    ┌──────────┐     submit/skip/timeout     ┌──────────┐
    │ DESCRIBE │ ────────────────────────────► │   DRAW   │
    └──────────┘                               └────┬─────┘
         ▲                                          │
         │         submit/skip/timeout              │
         └──────────────────────────────────────────┘
                    (next player in chain)

    After final turn in chain → next chain or REVEAL
```

### Turn States (per turn)

| State | Description |
|-------|-------------|
| `WAITING` | Turn not yet started |
| `ACTIVE` | Player can submit |
| `SUBMITTED` | Content saved |
| `SKIPPED` | Disconnect timeout |
| `AUTO_SUBMITTED` | Timer expiry |

---

## Chain & Turn Indexing

For **N players**, each chain has **2N - 1 turns** (alternating describe/draw):

```
Chain starts with DESCRIBE (starter prompt assigned to Player A)
Turn 0: Player A — DESCRIBE (writes starter or receives preset)
Turn 1: Player B — DRAW
Turn 2: Player C — DESCRIBE
Turn 3: Player D — DRAW
...
Turn 2N-2: last player — DESCRIBE or DRAW depending on parity
```

**MVP with N players:** `2N - 1` turns per chain, starting with DESCRIBE.

### Multi-Chain Games

```
roundCount = number of chains (default 1)

For chainIndex 0..roundCount-1:
  Assign starter prompts (unique random from PromptPool)
  Execute all turns in chain
  Advance to next chain

After all chains → REVEAL
```

---

## Player Order & Assignment

```
1. On START_GAME: shuffle playerOrder (Fisher-Yates)
2. Chain c, Turn t: assignedPlayer = playerOrder[t % N]
   (Each player appears once per "lap"; turns exceed N)
3. Phase alternates: even turnIndex = DESCRIBE, odd = DRAW
   (turn 0 always DESCRIBE)
```

---

## Transition Guards (Domain Rules)

| Transition | Guard |
|------------|-------|
| `SUBMIT_DESCRIPTION` | activePlayer, phase=DESCRIBE, status=ACTIVE, text valid |
| `SUBMIT_DRAWING` | activePlayer, phase=DRAW, canvas non-empty OR timer expired |
| `AUTO_SUBMIT` | timer expired, status=ACTIVE |
| `SKIP_TURN` | disconnect > grace period |
| `PAUSE_GAME` | requester is host, game=IN_PROGRESS |
| `ADVANCE_TURN` | current turn SUBMITTED/SKIPPED/AUTO_SUBMITTED |

---

## State Machine Diagram (Combined)

```mermaid
stateDiagram-v2
    [*] --> LOBBY

    LOBBY --> IN_PROGRESS: START_GAME
    LOBBY --> CLOSED: CLOSE / IDLE

    state IN_PROGRESS {
        [*] --> DESCRIBE
        DESCRIBE --> DRAW: submit/auto/skip
        DRAW --> DESCRIBE: submit/auto/skip (more turns)
        DRAW --> CHAIN_DONE: last turn complete
        DESCRIBE --> CHAIN_DONE: last turn complete (odd case)
        CHAIN_DONE --> DESCRIBE: next chain
        CHAIN_DONE --> [*]: all chains done

        state PAUSED {
            [*] --> FROZEN
        }
        IN_PROGRESS --> PAUSED: PAUSE
        PAUSED --> IN_PROGRESS: RESUME
    }

    IN_PROGRESS --> REVEAL: ALL_CHAINS_DONE
    REVEAL --> LOBBY: REMATCH
    REVEAL --> CLOSED: CLOSE / IDLE
    CLOSED --> [*]
```

---

## Implementation Model

```typescript
// Domain layer — pure functions
type RoomEvent =
  | { type: 'START_GAME' }
  | { type: 'SUBMIT_DESCRIPTION'; text: string; playerId: string }
  | { type: 'SUBMIT_DRAWING'; drawingUrl: string; playerId: string }
  | { type: 'TIMER_EXPIRED' }
  | { type: 'SKIP_TURN'; playerId: string; reason: string }
  | { type: 'PAUSE'; hostId: string }
  | { type: 'RESUME'; hostId: string }
  | { type: 'REMATCH' }
  | { type: 'CLOSE' };

function transitionRoom(state: RoomState, event: RoomEvent): Result<RoomState>;
function transitionGame(state: GameState, event: RoomEvent): Result<GameState>;
```

- Returns `Result` (never throws in domain)
- Application layer persists + publishes Ably events
- Unit tests cover every valid/invalid transition

---

## Reconnect State Recovery

```
1. Client reconnects with playerSession
2. Server loads Room + Game snapshot
3. If IN_PROGRESS:
   - If activePlayerId = reconnecting player → restore turn UI + remaining time
   - Else → waiting view with phase indicator
4. If REVEAL → sync to current reveal step (server sends step index)
5. Publish timer_tick with corrected turnEndsAt
```

---

## Error States

| Condition | Handling |
|-----------|----------|
| All players disconnect | Start idle TTL → CLOSED |
| Host disconnect in LOBBY | Auto-promote next player as host |
| Host disconnect in game | Game continues; host role transferred |
| Version conflict | Return snapshot; client reconciles |

---

## Constants (Config — Not Hardcoded)

```typescript
// shared/config/game.config.ts
export const GAME_CONFIG = {
  MIN_PLAYERS: 3,
  MAX_PLAYERS: 12,
  DISCONNECT_GRACE_MS: 30_000,
  REVEAL_STEP_DURATION_MS: 3_000,
  DEFAULT_DESCRIBE_TIMER_SEC: 60,
  DEFAULT_DRAW_TIMER_SEC: 90,
  DEFAULT_ROUND_COUNT: 1,
} as const;
```

---

## Related Documents

- Functional requirements: Document 2 (FR-4)
- Realtime events: Document 10
- Database (Game embed): Document 7
