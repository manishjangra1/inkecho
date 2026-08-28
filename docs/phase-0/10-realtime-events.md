# Document 10 — Realtime Events

## Overview

All realtime communication uses **Ably**. The server publishes events **after** database persistence. Clients subscribe to room channels and apply events to local state (Zustand reducer).

**Channel naming:** `room:{roomId}`  
**Presence channel:** `room:{roomId}:$presence` (Ably Presence on same channel)

---

## Event Envelope

All events share this structure:

```typescript
{
  name: string;           // Event name (snake_case)
  payload: object;        // Event-specific data
  version: number;        // Game or room version after mutation
  timestamp: string;      // ISO 8601 server time
  correlationId: string;  // Trace ID
}
```

---

## Connection Lifecycle Events

### `connection_established`

Sent to connecting client only (via token auth callback metadata or initial snapshot fetch).

**Payload:**
```json
{
  "roomId": "objectId",
  "playerId": "uuid",
  "serverTime": "2026-08-28T08:00:00.000Z"
}
```

---

## Presence Events (Ably Presence)

| Ably Action | InkEcho Meaning |
|-------------|-----------------|
| `enter` | Player connected |
| `leave` | Player disconnected (clean) |
| `update` | Connection status change |
| `present` | Initial sync |

**Presence data:**
```json
{
  "playerId": "uuid",
  "displayName": "PixelPanda",
  "role": "PLAYER",
  "connectionStatus": "ONLINE"
}
```

---

## Lobby Events

### `player_joined`

**When:** Player or spectator joins room  
**Publisher:** Server  
**Payload:**
```json
{
  "player": {
    "playerId": "uuid",
    "displayName": "NewPlayer",
    "role": "PLAYER",
    "avatarUrl": null,
    "isReady": false,
    "connectionStatus": "ONLINE"
  },
  "participantCount": 5
}
```

---

### `player_left`

**When:** Player voluntarily leaves  
**Payload:**
```json
{
  "playerId": "uuid",
  "participantCount": 4,
  "newHostPlayerId": "uuid2"
}
```
*`newHostPlayerId` present if leaving player was host*

---

### `player_kicked`

**When:** Host kicks player  
**Target:** Kicked client also receives personal redirect instruction  
**Payload:**
```json
{
  "playerId": "uuid",
  "kickedBy": "hostPlayerId",
  "reason": "KICKED_BY_HOST"
}
```

---

### `player_ready_changed`

**When:** Player toggles ready  
**Payload:**
```json
{
  "playerId": "uuid",
  "isReady": true,
  "readyCount": 4,
  "totalPlayers": 5
}
```

---

### `room_settings_updated`

**When:** Host changes settings  
**Payload:**
```json
{
  "settings": {
    "maxPlayers": 6,
    "describeTimerSec": 45,
    "drawTimerSec": 90,
    "roundCount": 1,
    "profanityFilter": true
  },
  "updatedBy": "hostPlayerId"
}
```

---

### `host_changed`

**When:** Host transfer or auto-promote on host leave  
**Payload:**
```json
{
  "previousHostPlayerId": "uuid1",
  "newHostPlayerId": "uuid2"
}
```

---

## Game Lifecycle Events

### `game_started`

**When:** Host starts game  
**Payload:**
```json
{
  "gameId": "objectId",
  "playerOrder": ["uuid1", "uuid2", "uuid3"],
  "chainCount": 3,
  "firstTurn": {
    "phase": "DESCRIBE",
    "activePlayerId": "uuid1",
    "chainIndex": 0,
    "turnIndex": 0,
    "turnEndsAt": "2026-08-28T08:01:30.000Z",
    "starterPrompt": "A penguin on a skateboard"
  }
}
```

---

### `game_paused`

**Payload:**
```json
{
  "pausedBy": "hostPlayerId",
  "pausedAt": "...",
  "remainingSeconds": 45
}
```

---

### `game_resumed`

**Payload:**
```json
{
  "turnEndsAt": "...",
  "remainingSeconds": 45
}
```

---

### `game_completed`

**When:** All chains finished, before reveal  
**Payload:**
```json
{
  "gameId": "objectId",
  "totalChains": 3
}
```

---

### `reveal_started`

**When:** Enter reveal phase  
**Payload:**
```json
{
  "chainCount": 3,
  "revealStepDurationMs": 3000
}
```

---

### `reveal_chain_step`

**When:** Each step in reveal animation  
**Payload:**
```json
{
  "chainIndex": 0,
  "stepIndex": 2,
  "stepType": "DRAWING",
  "content": {
    "drawingUrl": "https://..."
  },
  "playerName": "ArtistOne"
}
```
*`stepType`: `STARTER_PROMPT` | `DESCRIPTION` | `DRAWING`*

---

### `reveal_completed`

**Payload:**
```json
{
  "gameId": "objectId",
  "votes": { "0": 3, "1": 1, "2": 0 }
}
```

---

### `returned_to_lobby`

**When:** Host triggers rematch  
**Payload:**
```json
{
  "roomStatus": "LOBBY"
}
```

---

## Turn Events

### `turn_started`

**When:** New turn begins  
**Payload (active player):**
```json
{
  "phase": "DRAW",
  "chainIndex": 0,
  "turnIndex": 1,
  "activePlayerId": "uuid2",
  "turnEndsAt": "...",
  "promptText": "A cat wearing a top hat"
}
```

**Payload (non-active player):**
```json
{
  "phase": "DRAW",
  "chainIndex": 0,
  "turnIndex": 1,
  "activePlayerId": "uuid2",
  "turnEndsAt": "...",
  "activePlayerName": "ArtistOne"
}
```
*Hidden content excluded for non-active players*

---

### `description_submitted`

**When:** Describe turn submitted (server confirmed)  
**Payload:**
```json
{
  "chainIndex": 0,
  "turnIndex": 0,
  "playerId": "uuid1",
  "autoSubmitted": false
}
```
*Text NOT broadcast until reveal — only metadata*

---

### `drawing_submitted`

**When:** Draw turn uploaded and saved  
**Payload:**
```json
{
  "chainIndex": 0,
  "turnIndex": 1,
  "playerId": "uuid2",
  "autoSubmitted": false
}
```

---

### `turn_skipped`

**When:** Player disconnected beyond grace period  
**Payload:**
```json
{
  "chainIndex": 0,
  "turnIndex": 1,
  "playerId": "uuid2",
  "reason": "DISCONNECT_TIMEOUT"
}
```

---

### `turn_changed`

**When:** Turn advances (aggregate event after submit/skip)  
**Payload:**
```json
{
  "previousTurn": { "chainIndex": 0, "turnIndex": 1 },
  "currentTurn": {
    "phase": "DESCRIBE",
    "chainIndex": 0,
    "turnIndex": 2,
    "activePlayerId": "uuid3",
    "turnEndsAt": "..."
  }
}
```

---

## Timer Events

### `timer_tick`

**When:** Server broadcasts sync every 10s (optional) or on demand after reconnect  
**Payload:**
```json
{
  "turnEndsAt": "2026-08-28T08:01:30.000Z",
  "serverTime": "2026-08-28T08:00:45.000Z",
  "remainingSeconds": 45
}
```

**Note:** Clients primarily compute countdown locally from `turnEndsAt`; `timer_tick` corrects drift.

---

### `timer_expired`

**When:** Server processes timer expiry  
**Payload:**
```json
{
  "chainIndex": 0,
  "turnIndex": 1,
  "playerId": "uuid2",
  "phase": "DRAW"
}
```

---

## Connection Events

### `player_connection_changed`

**When:** Presence update processed by server  
**Payload:**
```json
{
  "playerId": "uuid",
  "connectionStatus": "RECONNECTING",
  "graceExpiresAt": "..."
}
```

---

### `state_snapshot_request`

**Client → Server (via HTTP, not Ably):** On version mismatch  
**Server → Client:**

### `state_snapshot`

**When:** Client requests full sync or version gap detected  
**Payload:**
```json
{
  "room": { "...": "..." },
  "game": { "...filtered..." },
  "version": 42
}
```

---

## Spectator Events

### `spectator_joined`

**Payload:**
```json
{
  "playerId": "uuid",
  "displayName": "Watcher",
  "spectatorCount": 3
}
```

---

### `spectator_left`

**Payload:**
```json
{
  "playerId": "uuid",
  "spectatorCount": 2
}
```

---

## Error Events

### `room_closed`

**When:** Room idle timeout or host closes  
**Payload:**
```json
{
  "reason": "IDLE_TIMEOUT",
  "message": "Room closed due to inactivity"
}
```

---

### `error`

**When:** Recoverable realtime error  
**Payload:**
```json
{
  "code": "SYNC_FAILED",
  "message": "Please refresh to resync",
  "correlationId": "..."
}
```

---

## Client-Published Events

Clients **do NOT** publish game events directly to Ably. All mutations go through Server Actions / API → server publishes.

**Exception:** Optional cursor presence for future collaborative features — not in MVP.

---

## Event Ordering & Idempotency

| Rule | Implementation |
|------|----------------|
| Ordering | Process events where `version > localVersion` |
| Duplicates | Ignore if `version <= localVersion` |
| Gap detection | If `version > localVersion + 1`, fetch snapshot |
| Idempotency | Submit endpoints use `expectedVersion` |

---

## Channel Capabilities (Ably Token)

```json
{
  "room:{roomId}": ["subscribe", "presence"],
  "room:{roomId}:$presence": ["presence"]
}
```

Publish capability granted **only to server** (API key), never to clients.

---

## Event → UI Mapping

| Event | UI Action |
|-------|-----------|
| `player_joined` | Update lobby player list |
| `game_started` | Navigate to game view |
| `turn_started` | Show phase UI; start timer |
| `turn_changed` | Transition animation |
| `timer_tick` | Correct countdown |
| `reveal_chain_step` | Animate reveal card |
| `player_connection_changed` | Show reconnect badge |
| `room_closed` | Redirect to home + toast |

---

## Related Documents

- Architecture: Document 6
- Game state: Document 11
- Security (token auth): Document 13
