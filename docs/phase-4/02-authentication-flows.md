# Phase 4 — Document 2: Authentication Flows

## Overview

Complete flow specifications for every authentication path. Each flow lists **trigger**, **steps**, **cookies set**, **DB writes**, and **error exits**.

---

## Flow A: Anonymous Browsing

**Trigger:** Visitor opens `/`, `/browse`, `/legal/*`

```mermaid
sequenceDiagram
    participant V as Visitor
    participant M as Middleware
    participant P as Page

    V->>M: GET /
    M->>M: No session cookies
    M->>P: Render marketing page
    P-->>V: Landing (CTAs: Create, Join, Login)
```

| Capability | Allowed |
|------------|---------|
| View landing, legal | ✓ |
| Browse public rooms list | ✓ (read-only) |
| Create/join room | ✗ — prompts name or login |
| Profile, admin | ✗ |

---

## Flow B: Guest — Create Room & Enter Lobby

**Trigger:** Anonymous user clicks Create Room, enters display name

```mermaid
sequenceDiagram
    participant C as Client
    participant A as createRoomAction
    participant GS as GuestSessionService
    participant RS as RoomService
    participant DB as MongoDB

    C->>A: createRoom({ displayName, settings, visibility })
    A->>A: Zod validate displayName
    A->>RS: createRoom()
    RS->>DB: Insert Room + host RoomParticipant
    RS->>GS: createGuestSession(roomId, displayName)
    GS->>DB: Insert GuestSession
    GS->>GS: Sign JWT
    A-->>C: Set-Cookie ink_player_session + { roomCode, playerId }
    C->>C: Redirect /room/[code]/lobby
```

**DB writes (atomic transaction):**

1. `Room` — status `LOBBY`, host = new `playerId`
2. `RoomParticipant` — role `HOST`, `isReady: false`
3. `GuestSession` — `expiresAt = now + 24h`

**Cookie:** `ink_player_session` — HttpOnly, 24h max-age

**Errors:**

| Error | Cause |
|-------|-------|
| `VALIDATION_ERROR` | Invalid display name |
| `RATE_LIMITED` | Too many rooms from IP |
| `BANNED` | IP/user blocked |

---

## Flow C: Guest — Join Room by Code

**Trigger:** User submits code + display name on `/join`

```mermaid
sequenceDiagram
    participant C as Client
    participant A as joinRoomAction
    participant RS as RoomService
    participant GS as GuestSessionService

    C->>A: joinRoom({ roomCode, displayName })
    A->>RS: findByCode(roomCode)
    RS->>RS: Check not full, not kicked, not banned
    alt Room LOBBY
        RS->>GS: createGuestSession
        RS->>RS: addParticipant(PLAYER)
    else Room IN_PROGRESS
        RS->>GS: createGuestSession
        RS->>RS: addParticipant(SPECTATOR)
    end
    A-->>C: Set-Cookie + redirect by room.status
```

**Kick blocklist check:**

```typescript
if (room.kickedPlayerIds.includes(existingPlayerId)) {
  throw new ForbiddenError('KICKED');
}
// New guest always gets new playerId — blocklist is by playerId from prior session
// Store kicked playerId at kick time
```

---

## Flow D: Registered — Email Sign Up

**Trigger:** User submits register form

```mermaid
sequenceDiagram
    participant C as Client
    participant BA as Better Auth
    participant DB as MongoDB

    C->>BA: POST /api/auth/sign-up/email
    BA->>BA: Validate password policy
    BA->>DB: Create User + Account (credential)
    BA->>DB: Create Session
    BA->>DB: Create UserStats (empty)
    BA-->>C: Set session cookie + redirect
```

**Password policy:**

- Min 8 characters
- At least 1 uppercase, 1 number
- Validated in Zod + Better Auth

**Post-signup:**

- `UserStats` initialized to zeros
- Optional email verification (P1 — send verification, restrict profile until verified)

---

## Flow E: Registered — Email Login

**Trigger:** User submits login form

```mermaid
sequenceDiagram
    participant C as Client
    participant BA as Better Auth
    participant DB as MongoDB

    C->>BA: POST /api/auth/sign-in/email
    BA->>DB: Verify credential
    BA->>BA: assertNotBanned(userId)
    BA->>DB: Create Session
    BA-->>C: Set cookie + redirect returnUrl
```

**returnUrl handling:**

- Validate `returnUrl` is same-origin path (prevent open redirect)
- Default `/` if missing or invalid

---

## Flow F: Registered — OAuth (Google / GitHub)

**Trigger:** User clicks OAuth button

```mermaid
sequenceDiagram
    participant C as Client
    participant BA as Better Auth
    participant O as OAuth Provider
    participant DB as MongoDB

    C->>BA: signIn.social({ provider, callbackURL })
    BA->>O: Authorization redirect
    O-->>C: User approves
    O->>BA: Callback with code
    BA->>O: Exchange tokens
    BA->>DB: Upsert User + Account
    BA->>DB: Create Session
    BA-->>C: Set cookie + redirect callbackURL
```

**Account linking:** If email already exists with different provider → Better Auth linking rules apply (link or error with message).

---

## Flow G: Registered — Join Room (Logged In)

**Trigger:** Logged-in user joins room without re-entering name

```mermaid
sequenceDiagram
    participant C as Client
    participant A as joinRoomAction
    participant S as SessionService

    C->>A: joinRoom({ roomCode })
    A->>S: getRegisteredSession()
    S->>S: assertNotBanned
    A->>A: displayName = user.name, userId linked
    A->>A: Generate new playerId (UUID)
    A->>A: Create RoomParticipant with userId
    Note over A: Optional: also set ink_player_session for room scope
    A-->>C: Set guest cookie OR session-bound player token
```

**Design decision:** Registered users in rooms **also receive `ink_player_session`** scoped to the room. This unifies `getAuthContext()` for game actions — one cookie for all in-room operations.

**JWT claims for registered in-room:**

```typescript
{
  sub: guestSessionId;     // Still create GuestSession OR use PlayerSession model
  userId: string;          // Additional claim
  playerId: string;
  roomId: string;
  type: 'registered';
}
```

*Alternative (chosen):* Create `GuestSession` record for all in-room players (registered or not) — links `userId` on RoomParticipant. Simplifies one code path.

---

## Flow H: Logout

**Trigger:** User clicks Log out

```mermaid
sequenceDiagram
    participant C as Client
    participant BA as Better Auth

    C->>BA: POST /api/auth/sign-out
    BA->>BA: Invalidate Session in DB
    BA-->>C: Clear better-auth cookie
    C->>C: Clear ink_player_session (client action or API)
    C->>C: Redirect /
```

**In-room logout:** Warn dialog — "Leaving will forfeit your seat."

Clear both cookies always on logout.

---

## Flow I: Guest → Registered Conversion (Post-MVP P2)

**Trigger:** Guest clicks "Save progress" or signs up after playing

```
1. Guest has active ink_player_session
2. User completes registration
3. Server links RoomParticipant.userId to new User.id
4. Backfill GameHistory for completed games in session (if any)
5. Clear guest-only limitations
```

MVP: Registration does not retroactively link current guest session unless explicitly designed — user gets new account, guest session continues independently.

---

## Flow J: Host Transfer on Leave

**Trigger:** Host leaves lobby or disconnects beyond grace

```
1. hostPlayerId updated to next participant (joinedAt order)
2. RoomParticipant.role updated: old HOST → PLAYER, new → HOST
3. Ably event host_changed
4. If host was guest, guest session of new host unchanged
```

Auth implication: host permissions follow `Room.hostPlayerId`, not cookie — re-validated server-side.

---

## Flow K: Kick Player (Auth Invalidation)

**Trigger:** Host kicks player

```mermaid
sequenceDiagram
    participant H as Host
    participant A as kickPlayerAction
    participant GS as GuestSessionService
    participant DB as MongoDB
    participant K as Kicked Client

    H->>A: kickPlayer({ playerId })
    A->>DB: Set participant.leftAt, add to kickedPlayerIds
    A->>GS: revokeGuestSession(player guestSessionId)
    A->>A: Publish player_kicked
    K->>K: Receive event → clear cookie → redirect /
```

Kicked player's JWT invalidated by deleting `GuestSession` document — verify fails on next request.

---

## Flow L: Admin Impersonation

**Not in MVP.** Admin uses moderation tools without joining as player.

---

## Anonymous vs Guest vs Registered Summary

| Action | Anonymous | Guest | Registered |
|--------|-----------|-------|------------|
| View landing | ✓ | ✓ | ✓ |
| Create room | name required | ✓ | ✓ (uses account name) |
| Join room | name required | ✓ | ✓ |
| Profile / history | ✗ | ✗ | ✓ |
| Persist stats | ✗ | ✗ | ✓ |
| OAuth | ✗ | ✗ | ✓ |
| Reconnect to room | ✗ | ✓ (24h) | ✓ (30d + room session) |
| Admin | ✗ | ✗ | ✓ (if role ADMIN) |

---

## Server Action Auth Pattern

Every action follows this template:

```typescript
'use server';

export async function exampleAction(input: ExampleDto): Promise<ActionResult<ExampleResponse>> {
  const correlationId = await getCorrelationId();
  try {
    const parsed = exampleSchema.parse(input);
    const ctx = await requirePlayerSession(parsed.roomId);
    authorize(ctx, 'game:submit');
    await assertNotBanned(ctx.type === 'registered' ? ctx.userId : undefined);

    const result = await exampleService.execute(ctx, parsed);
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error, correlationId);
  }
}
```

---

## Client UX States

| State | UI |
|-------|-----|
| Anonymous on landing | Login button + guest CTAs |
| Guest in lobby | Display name badge, no avatar upload (MVP) |
| Registered | Avatar + name from profile |
| Session loading | Skeleton header |
| Session expired | Toast + redirect to join with code pre-filled |
| Banned | Full-page message, support link |

---

## Related Documents

- Architecture: [01-authentication-architecture.md](./01-authentication-architecture.md)
- Recovery: [03-session-recovery.md](./03-session-recovery.md)
- User stories: [../phase-0/04-user-stories.md](../phase-0/04-user-stories.md) (Epic 2)
