# Document 5 — Acceptance Criteria

## Format

Each criterion uses **Given / When / Then** and maps to user stories (Document 4) and functional requirements (Document 2).

---

## AC-1: Landing Page

### AC-1.1 — Hero & CTA
**Given** an unauthenticated visitor on `/`  
**When** the page loads  
**Then** hero explains the game in ≤ 2 sentences  
**And** "Create Room" and "Join Room" CTAs are visible above the fold on mobile

### AC-1.2 — Join by Code
**Given** a visitor enters a valid 6-character room code  
**When** they click Join  
**Then** they are redirected to `/room/[code]/lobby` within 2 seconds

### AC-1.3 — Invalid Code
**Given** a visitor enters an invalid or expired code  
**When** they click Join  
**Then** an inline error displays "Room not found"  
**And** no navigation occurs

---

## AC-2: Guest Authentication

### AC-2.1 — Guest Join
**Given** a guest enters display name (3–20 chars, alphanumeric + spaces)  
**When** they confirm join  
**Then** a guest session is created with 24h TTL  
**And** a `playerSessionId` cookie/token is set

### AC-2.2 — Guest Reconnect
**Given** a guest with valid session token disconnects for < 30s  
**When** they reload the page  
**Then** they rejoin the same room slot without re-entering name  
**And** lobby/game state is restored

### AC-2.3 — Invalid Guest Name
**Given** a guest enters a name with profanity or < 3 chars  
**When** they submit  
**Then** validation error is shown  
**And** session is not created

---

## AC-3: Registered Authentication

### AC-3.1 — Sign Up
**Given** valid email and password (min 8 chars, 1 upper, 1 number)  
**When** user completes signup  
**Then** account is created  
**And** user is logged in  
**And** redirected to home or pending room

### AC-3.2 — OAuth
**Given** user clicks "Continue with Google"  
**When** OAuth succeeds  
**Then** user record is created or linked  
**And** session cookie is set

### AC-3.3 — Protected Routes
**Given** unauthenticated user navigates to `/profile`  
**When** page loads  
**Then** user is redirected to login with return URL

---

## AC-4: Room Creation

### AC-4.1 — Create Private Room
**Given** authenticated or guest user clicks Create Room  
**When** room is created  
**Then** unique 6-char code is generated  
**And** user is host  
**And** room status is `LOBBY`  
**And** default settings applied from config

### AC-4.2 — Room Settings
**Given** host updates max players (3–12), describe timer (30–120s), draw timer (60–180s)  
**When** settings are saved  
**Then** all lobby clients receive `room_settings_updated` event within 500ms  
**And** settings persist in database

### AC-4.3 — Invite Link
**Given** host clicks Copy Link  
**When** clipboard API succeeds  
**Then** URL format is `https://[domain]/join/[code]`  
**And** toast confirms "Link copied"

---

## AC-5: Lobby

### AC-5.1 — Player List
**Given** 4 players in lobby  
**When** any player joins or leaves  
**Then** player list updates for all clients within 500ms  
**And** shows avatar, name, ready badge, host crown

### AC-5.2 — Ready Toggle
**Given** player clicks Ready  
**When** toggle succeeds  
**Then** ready state persists  
**And** host sees ready count vs total

### AC-5.3 — Start Game
**Given** ≥ 3 players ready and host clicks Start  
**When** server validates  
**Then** game status → `IN_PROGRESS`  
**And** all clients receive `game_started`  
**And** first turn begins within 1s

### AC-5.4 — Start Blocked
**Given** only 2 players ready  
**When** host clicks Start  
**Then** error toast "Need at least 3 ready players"  
**And** game does not start

### AC-5.5 — Kick Player
**Given** host kicks player B  
**When** action succeeds  
**Then** player B receives `player_kicked`  
**And** is redirected to home  
**And** player B removed from lobby list

---

## AC-6: Describe Turn

### AC-6.1 — View Prior Drawing
**Given** player is on describe turn (not chain start)  
**When** turn loads  
**Then** prior drawing image renders within 1s  
**And** text input is focused (desktop)

### AC-6.2 — Submit Description
**Given** player enters 1–200 chars  
**When** they click Submit  
**Then** description is persisted  
**And** turn advances  
**And** submit button disabled during processing

### AC-6.3 — Timer Expiry
**Given** timer reaches 0  
**When** server processes expiry  
**Then** current text (or placeholder if empty) is submitted  
**And** turn advances

### AC-6.4 — Hidden Content
**Given** player is NOT on active turn  
**When** game is in progress  
**Then** they do NOT see the active player's input or canvas

---

## AC-7: Draw Turn

### AC-7.1 — Canvas Tools
**Given** player on draw turn  
**When** they use brush, eraser, color, undo, redo  
**Then** each action reflects on canvas at 60fps on mid-tier mobile

### AC-7.2 — Submit Drawing
**Given** canvas has ≥ 1 stroke  
**When** player submits  
**Then** drawing uploads to Cloudinary  
**And** URL stored in turn record  
**And** turn advances

### AC-7.3 — Blank Submit Blocked
**Given** empty canvas and timer > 0  
**When** player clicks Submit  
**Then** validation error "Draw something first"  
**And** turn does not advance

### AC-7.4 — Touch Drawing
**Given** mobile player draws with finger  
**When** strokes are recorded  
**Then** no page scroll occurs during draw  
**And** strokes appear without > 32ms lag P95

---

## AC-8: Timer Sync

### AC-8.1 — Server Authority
**Given** game turn with 90s draw timer  
**When** client renders countdown  
**Then** display syncs to server `turnEndsAt` epoch  
**And** drift corrected every 5s

### AC-8.2 — Warning States
**Given** 25% and 10% thresholds from config  
**When** remaining time crosses threshold  
**Then** UI shows warning color  
**And** optional pulse animation (unless reduced motion)

### AC-8.3 — Reconnect Timer
**Given** player reconnects with 45s remaining  
**When** state restored  
**Then** timer shows ~45s (±1s)

---

## AC-9: Reveal

### AC-9.1 — Chain Playback
**Given** all turns complete  
**When** reveal phase starts  
**Then** each chain plays step-by-step with animation  
**And** all players/spectators see same step at same time (±500ms)

### AC-9.2 — Return to Lobby
**Given** reveal completes  
**When** host clicks Play Again  
**Then** game status → `LOBBY`  
**And** ready states reset  
**And** new round set can start

---

## AC-10: Spectator

### AC-10.1 — Mid-Game Join
**Given** room status is `IN_PROGRESS`  
**When** new user joins  
**Then** they enter spectator mode  
**And** cannot submit turns  
**And** see phase indicator and timer

---

## AC-11: Reconnect & Disconnect

### AC-11.1 — Grace Period
**Given** player disconnects during turn  
**When** disconnect lasts < 30s (config)  
**Then** turn is held for that player  
**And** presence shows "reconnecting"

### AC-11.2 — Skip After Grace
**Given** player disconnects > 30s during turn  
**When** grace expires  
**Then** turn auto-skipped or auto-submitted empty  
**And** game continues

### AC-11.3 — Full State Recovery
**Given** player reconnects during lobby  
**When** session valid  
**Then** full lobby state restored from server snapshot

---

## AC-12: Realtime

### AC-12.1 — Event Delivery
**Given** 8 players in room  
**When** `player_ready` fires  
**Then** all 8 clients receive event P95 < 500ms

### AC-12.2 — Conflict Resolution
**Given** two submit requests for same turn (duplicate)  
**When** server processes  
**Then** first wins; second returns 409 with current state  
**And** client reconciles

---

## AC-13: Profile & History

### AC-13.1 — Game History
**Given** registered user with 5 completed games  
**When** they visit `/profile/history`  
**Then** list shows 5 entries with date, room code, result

### AC-13.2 — Stats
**Given** registered user  
**When** they visit `/profile`  
**Then** stats show games played, wins, chains completed (accurate to DB)

---

## AC-14: Admin

### AC-14.1 — Report Content
**Given** player views offensive drawing in reveal  
**When** they click Report and select reason  
**Then** report record created with status `PENDING`

### AC-14.2 — Ban User
**Given** admin bans user  
**When** banned user attempts join  
**Then** 403 with message "Account suspended"

---

## AC-15: Accessibility

### AC-15.1 — Keyboard Navigation
**Given** desktop user  
**When** tabbing through lobby  
**Then** all interactive elements reachable  
**And** focus visible

### AC-15.2 — Reduced Motion
**Given** `prefers-reduced-motion: reduce`  
**When** reveal plays  
**Then** animations use crossfade only (no parallax/zoom)

---

## AC-16: Error Handling

### AC-16.1 — API Errors
**Given** server returns 500  
**When** client receives error  
**Then** user sees "Something went wrong. Try again."  
**And** Sentry captures with correlation ID

### AC-16.2 — Ably Disconnect
**Given** Ably connection drops  
**When** > 3s without connection  
**Then** banner shows "Reconnecting…"  
**And** auto-retry with exponential backoff

---

## Definition of Done (MVP)

- [ ] All P0 acceptance criteria pass in Playwright E2E suite
- [ ] All P0 functional requirements implemented
- [ ] No P0 bugs open
- [ ] Lighthouse performance ≥ 85, accessibility ≥ 90
- [ ] Security checklist (Document 13) signed off
- [ ] Deployed to production Vercel with MongoDB Atlas + Ably
