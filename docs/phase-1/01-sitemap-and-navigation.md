# Phase 1 — Document 1: Sitemap & Navigation

## Design Direction

InkEcho UI blends **premium SaaS polish** (Linear, Raycast) with **playful gaming energy** (Discord, party games). Navigation stays minimal during gameplay — chrome recedes; the canvas and timer take center stage.

**Mode:** Dark-first. Light mode uses the same structure with inverted tokens.

---

## Sitemap

```
inkecho.app
│
├── /                           Landing (marketing + quick play)
│
├── /join                       Join room (code entry + nickname)
│   └── /join/[code]            Pre-filled join via invite link
│
├── /create                     Create room (settings + visibility)
│
├── /browse                     Public room browser (P1 feature flag)
│
├── /room/[code]                Room shell (redirects by state)
│   ├── /room/[code]/lobby      Waiting room
│   ├── /room/[code]/game       Active game (describe / draw / waiting)
│   ├── /room/[code]/reveal     Chain reveal playback
│   └── /room/[code]/spectate   Spectator view (alias of game with role)
│
├── /auth
│   ├── /auth/login             Email + OAuth login
│   ├── /auth/register          Sign up
│   └── /auth/forgot-password   Password reset
│
├── /profile                    Profile overview (registered)
│   ├── /profile/history        Game history
│   ├── /profile/stats          Detailed statistics
│   └── /profile/achievements   Badges (P2)
│
├── /admin                      Admin dashboard (role-gated)
│   ├── /admin/reports          Moderation queue
│   ├── /admin/users            User management
│   └── /admin/analytics        Aggregate metrics (P2)
│
├── /legal
│   ├── /legal/privacy          Privacy policy
│   └── /legal/terms            Terms of service
│
└── /404                        Not found
```

---

## Route Access Matrix

| Route | Guest | Registered | In-Room | Host | Spectator | Admin |
|-------|-------|------------|---------|------|-----------|-------|
| `/` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/join` | ✓ | ✓ | — | — | — | ✓ |
| `/create` | ✓ | ✓ | — | — | — | ✓ |
| `/browse` | ✓ | ✓ | — | — | — | ✓ |
| `/room/[code]/lobby` | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| `/room/[code]/game` | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| `/room/[code]/reveal` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/auth/*` | ✓ | redirect if logged in | ✓ | ✓ | ✓ | ✓ |
| `/profile/*` | redirect | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/*` | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

---

## Navigation Architecture

### Global Header (Persistent)

Present on all non-game fullscreen routes. Collapses to icon bar on mobile.

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Logo InkEcho]     Browse   Create          [Theme] [Avatar/Login] │
└──────────────────────────────────────────────────────────────────────┘
```

| Element | Behavior |
|---------|----------|
| **Logo** | → `/` |
| **Browse** | → `/browse` (hidden if feature flag off) |
| **Create** | → `/create` or inline modal from landing |
| **Theme toggle** | Sun/moon icon; persists in localStorage |
| **Avatar** | Registered: dropdown → Profile, History, Logout |
| **Login** | Guest: → `/auth/login` |

### In-Room Header (Contextual)

Replaces global header inside `/room/[code]/*`.

```
┌──────────────────────────────────────────────────────────────────────┐
│  [← Leave]   Room ABC123   ● 4/8 players   [Copy Link]   [Settings]│
└──────────────────────────────────────────────────────────────────────┘
```

| Element | Visibility |
|---------|--------------|
| Leave | All participants |
| Room code | All; monospace badge |
| Player count | All; live via presence |
| Copy Link | Host + players |
| Settings | Host only (lobby); gear opens drawer |

### Game Header (Minimal)

During active turn — ultra-compact to maximize canvas space.

```
┌──────────────────────────────────────────────────────────────────────┐
│  ABC123          Turn 3/7 · DRAW          [████████░░] 0:42   [Leave]│
└──────────────────────────────────────────────────────────────────────┘
```

### Mobile Bottom Nav

Only on marketing/profile routes — **not** during game or lobby.

```
┌────────────────────────────────────────┐
│   Home    Browse    Create    Profile  │
└────────────────────────────────────────┘
```

---

## Navigation States by Room Status

```mermaid
flowchart TD
    A[User hits /room/code] --> B{Room status?}
    B -->|LOBBY| C[/room/code/lobby]
    B -->|IN_PROGRESS| D{Has player slot?}
    D -->|Yes| E[/room/code/game]
    D -->|No| F[/room/code/spectate]
    B -->|REVEAL| G[/room/code/reveal]
    B -->|CLOSED| H[Toast + redirect /]
```

Server-side redirect in room layout — client never shows wrong phase.

---

## Dropdown Menus

### Avatar Menu (Registered)

```
┌─────────────────┐
│  PlayerOne      │
│  player@email.com│
├─────────────────┤
│  Profile        │
│  Game History   │
│  Settings       │
├─────────────────┤
│  Log out        │
└─────────────────┘
```

### Host Settings Drawer (Lobby)

Slides from right (desktop) or bottom sheet (mobile).

```
┌─────────────────────────┐
│  Room Settings      [×] │
├─────────────────────────┤
│  Max players      [8 ▼] │
│  Describe timer   [60s] │
│  Draw timer       [90s] │
│  Rounds           [1 ▼] │
│  [ ] Profanity filter   │
│  [ ] Allow spectators   │
├─────────────────────────┤
│  [Save Settings]        │
└─────────────────────────┘
```

---

## Breadcrumbs

Used only on profile and admin sections:

```
Profile  >  History  >  Game ABC123
Admin    >  Reports  >  Report #1042
```

Not used in room/game flows — context is always singular.

---

## Footer (Marketing Pages Only)

```
┌──────────────────────────────────────────────────────────────────────┐
│  InkEcho — Draw. Guess. Laugh.                                       │
│  Privacy · Terms · GitHub                                            │
│  © 2026 InkEcho                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

Hidden in room, game, reveal, and admin views.

---

## Deep Links

| URL | Purpose |
|-----|---------|
| `/join/ABC123` | Invite link; skips code entry |
| `/room/ABC123/lobby` | Direct lobby (after auth) |
| `/auth/login?returnUrl=/join/ABC123` | Login then return |

---

## SEO & Meta (Marketing Routes)

| Page | Title | Description |
|------|-------|-------------|
| `/` | InkEcho — Multiplayer Draw & Describe Party Game | Play free in your browser |
| `/join` | Join a Room — InkEcho | Enter a room code |
| `/create` | Create a Room — InkEcho | Start a game with friends |

Game routes: `noindex` (private sessions).

---

## Related Documents

- User flows: [02-user-flows.md](./02-user-flows.md)
- Wireframes: [03-wireframes.md](./03-wireframes.md)
- Component inventory: [04-component-inventory.md](./04-component-inventory.md)
