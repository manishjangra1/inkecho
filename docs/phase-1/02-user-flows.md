# Phase 1 — Document 2: User Flows

## Overview

User flows map every primary journey from entry to outcome. Each flow notes **entry point**, **decisions**, **success state**, and **error exits**.

---

## Flow 1: First-Time Visitor → Play (Guest, Happy Path)

**Goal:** Land → create room → friends join → play within 60 seconds.

```mermaid
flowchart TD
    A[Landing /] --> B[Click Create Room]
    B --> C[Enter display name modal]
    C --> D[Create room API]
    D --> E[Lobby /room/code/lobby]
    E --> F[Copy invite link]
    F --> G[Friends join via link]
    G --> H[All players Ready]
    H --> I[Host clicks Start]
    I --> J[Game /room/code/game]
```

| Step | UI | System |
|------|-----|--------|
| 1 | Hero CTA "Create Room" | — |
| 2 | Name modal (3–20 chars) | Create guest session if needed |
| 3 | Redirect to lobby | Room created, user = host |
| 4 | Share sheet / copy link | Clipboard API |
| 5 | Friends: join flow | Realtime `player_joined` |
| 6 | Ready toggles | `player_ready_changed` |
| 7 | Start button enabled ≥3 ready | `game_started` |
| 8 | Game view loads | Timer begins |

**Error exits:** Name invalid → inline error. Create fails → toast + retry.

---

## Flow 2: Join via Invite Link (Guest)

```mermaid
flowchart TD
    A[Open /join/ABC123] --> B[Enter display name]
    B --> C{Room status?}
    C -->|LOBBY| D[Lobby]
    C -->|IN_PROGRESS| E[Spectator mode]
    C -->|REVEAL| F[Reveal view]
    C -->|CLOSED / NOT FOUND| G[Error page]
```

| Step | UI |
|------|-----|
| 1 | Join page with code pre-filled |
| 2 | Name input + Join button |
| 3 | Auto-route by room status |

---

## Flow 3: Join via Code (Manual)

```mermaid
flowchart TD
    A[Landing or /join] --> B[Enter 6-char code]
    B --> C[Validate format client-side]
    C --> D[Enter display name]
    D --> E[Submit join]
    E --> F{Valid room?}
    F -->|Yes| G[Route by status]
    F -->|No| H[Inline error: Room not found]
    F -->|Full| I[Toast: Room is full]
```

---

## Flow 4: Registered User Login → Play

```mermaid
flowchart TD
    A[Click Login] --> B[/auth/login]
    B --> C{Method?}
    C -->|Email| D[Email + password form]
    C -->|OAuth| E[Google / GitHub]
    D --> F[Session created]
    E --> F
    F --> G{returnUrl?}
    G -->|Yes| H[Redirect to returnUrl]
    G -->|No| I[Landing logged-in state]
    H --> J[Create or Join room]
```

Logged-in users skip name entry — display name from profile (editable in lobby).

---

## Flow 5: Lobby → Game Start

```mermaid
flowchart TD
    A[In lobby] --> B[See player grid]
    B --> C[Toggle Ready]
    C --> D{Is host?}
    D -->|No| E[Wait for host Start]
    D -->|Yes| F{≥3 ready?}
    F -->|No| G[Start disabled + tooltip]
    F -->|Yes| H[Click Start Game]
    H --> I[Loading transition]
    I --> J[Game view]
```

**Host-only actions in lobby:**
- Edit settings (drawer)
- Kick player (confirm dialog)
- Start game
- Transfer host (player card menu)

---

## Flow 6: Describe Turn (Active Player)

```mermaid
flowchart TD
    A[turn_started DESCRIBE] --> B[Show prior drawing OR starter prompt]
    B --> C[Text input focused]
    C --> D{Action?}
    D -->|Type + Submit| E[Submit description]
    D -->|Timer expires| F[Auto-submit]
    E --> G[Loading state on button]
    G --> H[turn_changed → waiting view]
    F --> H
```

**UI states:**
1. **Active** — input enabled, timer pulsing at 10%
2. **Submitting** — button spinner, input disabled
3. **Success** — brief checkmark → waiting view

---

## Flow 7: Draw Turn (Active Player)

```mermaid
flowchart TD
    A[turn_started DRAW] --> B[Show description text card]
    B --> C[Canvas + toolbar visible]
    C --> D{Action?}
    D -->|Draw + Submit| E[Export + upload]
    D -->|Timer expires| F[Auto-submit canvas]
    D -->|Refresh| G[Draft restore prompt]
    E --> H{Upload OK?}
    H -->|Yes| I[turn_changed]
    H -->|No| J[Toast retry]
    F --> I
```

---

## Flow 8: Waiting (Non-Active Player)

```mermaid
flowchart TD
    A[Not your turn] --> B[Waiting view]
    B --> C[Show: Player X is drawing/describing]
    C --> D[Animated timer ring]
    D --> E[Player avatars with active highlight]
    E --> F[turn_changed → your turn OR still waiting]
```

Spectators see identical waiting UI minus "Your turn" alerts.

---

## Flow 9: Disconnect → Reconnect

```mermaid
flowchart TD
    A[Connection lost] --> B[Banner: Reconnecting…]
    B --> C{Recovered <30s?}
    C -->|Yes| D[Restore state snapshot]
    D --> E{Was your turn?}
    E -->|Yes| F[Resume turn + corrected timer]
    E -->|No| G[Waiting/active view restored]
    C -->|No| H{Still in grace?}
    H -->|Expired| I[Turn skipped toast]
    H -->|Kicked| J[Redirect home + message]
```

---

## Flow 10: Game Complete → Reveal

```mermaid
flowchart TD
    A[Last turn submitted] --> B[game_completed event]
    B --> C[Transition animation]
    C --> D[Reveal /room/code/reveal]
    D --> E[Chain 1 step-by-step playback]
    E --> F[Next chain…]
    F --> G[All chains shown]
    G --> H{Optional vote}
    H --> I[Winner announcement]
    I --> J{Host: Play Again?}
    J -->|Yes| K[Return to lobby]
    J -->|No| L[Stay on reveal / leave]
```

---

## Flow 11: Spectator Mid-Game Join

```mermaid
flowchart TD
    A[Join IN_PROGRESS room] --> B[Name entry]
    B --> C[Spectator badge assigned]
    C --> D[Game view read-only]
    D --> E[See phase + timer]
    E --> F[Reveal with everyone]
```

---

## Flow 12: Host Kick Player

```mermaid
flowchart TD
    A[Host opens player menu] --> B[Click Kick]
    B --> C[Confirm dialog]
    C --> D[API kick]
    D --> E[Kicked player: toast + redirect /]
    D --> F[Lobby: player_removed animation]
```

---

## Flow 13: Profile & History (Registered)

```mermaid
flowchart TD
    A[Avatar → Profile] --> B[/profile]
    B --> C[Stats cards + recent games]
    C --> D[Click View All History]
    D --> E[/profile/history paginated list]
    E --> F[Click game row]
    F --> G[Game detail / reveal replay P2]
```

---

## Flow 14: Report Content

```mermaid
flowchart TD
    A[Reveal step shows offensive content] --> B[Click Report flag icon]
    B --> C[Report dialog: reason + notes]
    C --> D[Submit report]
    D --> E[Toast: Report submitted]
    E --> F[Admin queue P1]
```

---

## Flow 15: Admin Moderation

```mermaid
flowchart TD
    A[Admin /admin/reports] --> B[Pending queue table]
    B --> C[Click report row]
    C --> D[Preview content + context]
    D --> E{Action?}
    E -->|Dismiss| F[Mark dismissed]
    E -->|Ban 24h| G[Temp ban user]
    E -->|Ban permanent| H[Permanent ban]
```

---

## Emotional Journey Map

| Phase | User feeling | UI supports with |
|-------|--------------|------------------|
| Landing | Curious | Bold hero, playful illustration, clear CTAs |
| Join | Anticipation | Fast form, minimal fields |
| Lobby | Social energy | Avatar grid, ready states, live presence |
| Your turn | Focus + pressure | Timer, clean canvas, no distractions |
| Waiting | Suspense | Active player highlight, countdown |
| Reveal | Delight + laughter | Sequential animations, big visuals |
| Rematch | Momentum | One-click Play Again |

---

## Flow Priority (MVP)

| Priority | Flows |
|----------|-------|
| **P0** | 1, 2, 3, 5, 6, 7, 8, 9, 10 |
| **P1** | 4, 11, 12, 13, 14 |
| **P2** | 15, profile replay |

---

## Related Documents

- Sitemap: [01-sitemap-and-navigation.md](./01-sitemap-and-navigation.md)
- Wireframes: [03-wireframes.md](./03-wireframes.md)
- Animation: [06-animation-system.md](./06-animation-system.md)
