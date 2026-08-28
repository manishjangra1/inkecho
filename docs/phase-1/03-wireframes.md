# Phase 1 — Document 3: Wireframes

## Wireframe Conventions

```
[ Button ]     Clickable element
( input    )   Text field
{ dropdown }   Select
█ / ░          Progress / timer bar
●              Online status
👑             Host badge
~ ~ ~          Animation area
```

**Viewport columns:** Desktop (1280px) shown first; mobile notes below each screen.

---

## Screen 1: Landing Page (`/`)

### Desktop

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [◆ InkEcho]              Browse    [Create Room]         [🌙]  [Login]   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│     ┌─────────────────────────────┐    ┌──────────────────────────────┐ │
│     │                             │    │                              │ │
│     │   Draw. Describe.           │    │   ~ ~ ~  PLAYFUL             │ │
│     │   Watch it echo.            │    │   ILLUSTRATION               │ │
│     │                             │    │   (chain of doodles)         │ │
│     │   The party game where      │    │                              │ │
│     │   prompts mutate into       │    │                              │ │
│     │   something hilarious.      │    │                              │ │
│     │                             │    └──────────────────────────────┘ │
│     │   [ Create Room ]  [ Join ] │                                      │
│     │                             │                                        │
│     │   ( Enter code: ______ )    │    ┌─ Quick join ─────────────────┐ │
│     │                             │    │  ABC123  [Join →]            │ │
│     └─────────────────────────────┘    └──────────────────────────────┘ │
│                                                                            │
│  ── How it works ──────────────────────────────────────────────────────  │
│  [ 1. Write ]    [ 2. Draw ]    [ 3. Describe ]    [ 4. Reveal 🎉 ]     │
│                                                                            │
│  ── Features ──────────────────────────────────────────────────────────  │
│  [ Instant play ]  [ Real-time sync ]  [ Mobile friendly ]                 │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│  Privacy · Terms                                    © 2026 InkEcho        │
└────────────────────────────────────────────────────────────────────────────┘
```

### Mobile

- Single column; illustration above fold (shortened)
- CTAs full-width stacked
- Code entry inline below Join button
- Bottom nav: Home | Browse | Create | Profile

---

## Screen 2: Join Page (`/join` or `/join/[code]`)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [← Back]                         Join a Room                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│                    ┌──────────────────────────────┐                       │
│                    │                              │                       │
│                    │   Room Code                  │                       │
│                    │   ┌──┐┌──┐┌──┐ ┌──┐┌──┐┌──┐  │  ← 6 individual boxes│
│                    │   │ A││ B││ C│ │ 1││ 2││ 3│  │    or single input    │
│                    │   └──┘└──┘└──┘ └──┘└──┘└──┘  │                       │
│                    │                              │                       │
│                    │   Your Name                  │                       │
│                    │   ( PixelPanda            )  │                       │
│                    │                              │                       │
│                    │   [      Join Room       ]   │                       │
│                    │                              │                       │
│                    │   ── or ──                   │                       │
│                    │   [ Continue with Google ]   │                       │
│                    │                              │                       │
│                    └──────────────────────────────┘                       │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 3: Create Room (`/create`)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [← Back]                      Create a Room                               │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   Your Name        ( PixelPanda          )                                   │
│                                                                            │
│   Visibility       (● Private)  (  Public )                               │
│                                                                            │
│   ┌─ Settings ──────────────────────────────────────────────────────────┐ │
│   │  Max players     { 8 ▼ }     Rounds        { 1 ▼ }                  │ │
│   │  Describe timer  ──●──── 60s   Draw timer  ──●──── 90s              │ │
│   │  [ ] Profanity filter    [✓] Allow spectators                       │ │
│   └─────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│   [            Create & Enter Lobby            ]                           │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 4: Lobby (`/room/[code]/lobby`)

### Desktop

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [← Leave]    Room ABC123  ●    4 / 8 players     [Copy Link]  [⚙ Settings]│
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   Waiting for players…                    Ready: 3 / 4 needed (min 3)     │
│                                                                            │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌ ─ ─ ─ ─ ┐  │
│   │  👑      │  │  ●       │  │  ●       │  │  ○       │  │   +     │  │
│   │ [avatar] │  │ [avatar] │  │ [avatar] │  │ [avatar] │  │  Empty  │  │
│   │  HostOne │  │ PixelPanda│ │ ArtistTwo│  │  NewGuy  │  │  slot   │  │
│   │  ✓ Ready │  │  ✓ Ready │  │  ✓ Ready │  │  Not ready│ │         │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  └ ─ ─ ─ ─ ┘  │
│                                                                            │
│   ┌─────────────────────────────────────────────────────────────────────┐ │
│   │  Share:  https://inkecho.app/join/ABC123          [Copy] [Share]  │ │
│   └─────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│              [  ✓  I'm Ready  ]          [  ▶  Start Game  ]             │
│                                         (host only, enabled)              │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Mobile

- Player grid 2 columns
- Sticky bottom bar: Ready toggle + Start (host)
- Settings → bottom sheet

---

## Screen 5: Game — Describe Turn (Active Player)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ABC123        Describe · Turn 2/7                              [Leave]   │
│  ████████████████████░░░░░░░░░░  0:38                                     │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   Describe this drawing:                                                   │
│                                                                            │
│   ┌────────────────────────────────────────────────────────────────────┐  │
│   │                                                                    │  │
│   │                    [ PRIOR DRAWING IMAGE ]                         │  │
│   │                         (4:3 card)                                 │  │
│   │                                                                    │  │
│   └────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│   ( What do you see?                                              )       │
│   142 / 200 characters                                                     │
│                                                                            │
│                              [ Submit Description ]                        │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**First turn variant:** Replace drawing with starter prompt card:

```
   ┌─────────────────────────────────────┐
   │  ✨ Starter Prompt                   │
   │  "A penguin on a skateboard"       │
   └─────────────────────────────────────┘
```

---

## Screen 6: Game — Draw Turn (Active Player)

### Desktop

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ABC123        Draw · Turn 3/7                                  [Leave]   │
│  ██████████████████████████░░░░  1:02                                     │
├────────────────────────────────────────────────────────────────────────────┤
│  Draw this:  ┌──────────────────────────────────────┐                     │
│              │  "A cat wearing a top hat"           │  ← prompt sticky card│
│              └──────────────────────────────────────┘                     │
├────────────────────────────────────────────────────────────────────────────┤
│ [🖌][🧹][🎨][↩][↪]  Size ──●──                                    [Clear] │
├────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────────┐│
│ │                                                                        ││
│ │                         CANVAS AREA (4:3)                              ││
│ │                         dark surface #1A1A2E                           ││
│ │                                                                        ││
│ └────────────────────────────────────────────────────────────────────────┘│
├────────────────────────────────────────────────────────────────────────────┤
│                        [ Submit Drawing ]                                  │
└────────────────────────────────────────────────────────────────────────────┘
```

### Mobile

```
┌─────────────────────────┐
│ ABC123  Draw  1:02 [Leave]│
│ ████████████░░░  timer   │
├─────────────────────────┤
│ "A cat wearing..."       │
├─────────────────────────┤
│                         │
│      CANVAS             │
│      (full width)       │
│                         │
├─────────────────────────┤
│ [🖌][🧹][🎨][↩][↪][Clear]│  ← horizontal scroll toolbar
├─────────────────────────┤
│  [ Submit Drawing ]     │
└─────────────────────────┘
```

---

## Screen 7: Game — Waiting View

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ABC123        Waiting…                                       [Leave]     │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│                         ┌───────────────┐                                  │
│                         │   [avatar]    │                                  │
│                         │   ArtistTwo   │  ← pulsing ring animation       │
│                         └───────────────┘                                  │
│                                                                            │
│                   ArtistTwo is drawing…                                    │
│                                                                            │
│                         ⏱  0:54 remaining                                  │
│                                                                            │
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐                                             │
│   │ ✓  │ │ ◐  │ │ ·  │ │ ·  │   turn progress dots                       │
│   └────┘ └────┘ └────┘ └────┘                                             │
│                                                                            │
│              ~ ~ ~ subtle floating doodle decorations ~ ~ ~                │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 8: Reveal (`/room/[code]/reveal`)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ABC123        The Reveal 🎉                                  [Leave]     │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   Chain 1 of 3                    Step 2 of 5                               │
│                                                                            │
│   ┌────────────────────────────────────────────────────────────────────┐  │
│   │  START                                                           │  │
│   │  "A penguin on a skateboard"                                     │  │
│   │         ↓                                                        │  │
│   │  [ DRAWING — full width card, slide-in animation ]             │  │
│   │         ↓                                                        │  │
│   │  ( next step reveals on click or auto-advance )                  │  │
│   └────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│   [ ◀ Back ]              [ Next ▶ ]          Auto-play [▶▶]              │
│                                                                            │
│   ── Vote for funniest chain ──                                           │
│   ( Chain 1 )  ( Chain 2 )  ( Chain 3 )                                   │
│                                                                            │
│   [ 🔄 Play Again ]  (host)          [ Leave Room ]                       │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 9: Spectator Banner (Overlay on Game)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  👁 Spectating · 3 watchers                                    [Leave]   │
├────────────────────────────────────────────────────────────────────────────┤
│  (same waiting/game view as players — read-only, no submit controls)      │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 10: Auth Login (`/auth/login`)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [◆ InkEcho]                                                               │
├────────────────────────────────────────────────────────────────────────────┤
│                    ┌──────────────────────────────┐                       │
│                    │   Welcome back               │                       │
│                    │                              │                       │
│                    │   ( email@example.com    )   │                       │
│                    │   ( ••••••••••             )   │                       │
│                    │                              │                       │
│                    │   [ Sign In ]                │                       │
│                    │                              │                       │
│                    │   ── or ──                   │                       │
│                    │   [ G  Continue with Google ]│                       │
│                    │   [ GH Continue with GitHub ]│                       │
│                    │                              │                       │
│                    │   No account? Register       │                       │
│                    └──────────────────────────────┘                       │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 11: Profile (`/profile`)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [◆ InkEcho]                                          [🌙]  [Avatar ▼]  │
├────────────────────────────────────────────────────────────────────────────┤
│  Profile                                                                   │
│                                                                            │
│  ┌────────┐  PlayerOne                                                    │
│  │ avatar │  Member since Aug 2026                                        │
│  └────────┘  [ Edit Profile ]                                             │
│                                                                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │ 12          │ │ 3           │ │ 48          │ │ 2           │         │
│  │ Games       │ │ Wins        │ │ Chains      │ │ Badges      │         │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘         │
│                                                                            │
│  Recent Games                              [ View All → ]                  │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ ABC123 · Aug 28 · 🏆 Won · 3 chains                              │   │
│  │ XYZ789 · Aug 27 · Played · 2 chains                              │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 12: Reconnect Banner (Global Overlay)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ⚠ Connection lost — Reconnecting…  ████░░░░  (attempt 2/5)        [×] │
└────────────────────────────────────────────────────────────────────────────┘
```

Amber/warning token; fixed top; does not block game interaction.

---

## Screen 13: Modals & Dialogs

### Kick Confirm

```
┌─────────────────────────────────┐
│  Kick PlayerOne?            [×] │
│                                 │
│  They won't be able to rejoin   │
│  this room session.             │
│                                 │
│  [ Cancel ]    [ Kick ]         │
└─────────────────────────────────┘
```

### Draft Restore

```
┌─────────────────────────────────┐
│  Restore unsaved drawing?   [×] │
│                                 │
│  Found a draft from 2 min ago.  │
│                                 │
│  [ Discard ]  [ Restore ]       │
└─────────────────────────────────┘
```

---

## Layout Grid

| Breakpoint | Columns | Gutter | Max width |
|------------|---------|--------|-----------|
| `< sm` (320–639) | 4 | 16px | 100% |
| `sm–md` (640–1023) | 8 | 24px | 100% |
| `lg+` (1024+) | 12 | 32px | 1280px centered |

Game canvas always maintains **4:3 aspect ratio** within content area.

---

## Related Documents

- Design tokens: [05-design-tokens.md](./05-design-tokens.md)
- Components: [04-component-inventory.md](./04-component-inventory.md)
- Responsive: [07-responsive-rules.md](./07-responsive-rules.md)
