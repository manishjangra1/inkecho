# Phase 1 — Document 4: Component Inventory

## Overview

Components are organized into **shared UI** (shadcn/ui extensions), **layout**, **feature-specific**, and **game primitives**. All shared components live in `shared/ui/`; feature components stay in their feature folder.

**Legend:** 🔲 shadcn base · ✨ custom · 🎮 game-specific

---

## Shared UI (`shared/ui/`)

Built on shadcn/ui + Tailwind design tokens. All support dark/light themes.

| Component | Type | Variants | Used In |
|-----------|------|----------|---------|
| `Button` 🔲 | Interactive | default, destructive, outline, ghost, link, gradient | Everywhere |
| `IconButton` ✨ | Interactive | sm, md, lg | Toolbar, header |
| `Input` 🔲 | Form | default, error | Join, auth, describe |
| `Label` 🔲 | Form | — | All forms |
| `Textarea` 🔲 | Form | describe turn | Game |
| `Select` 🔲 | Form | — | Room settings |
| `Slider` 🔲 | Form | timer settings, brush size | Create, canvas |
| `Checkbox` 🔲 | Form | settings toggles | Create room |
| `Switch` 🔲 | Form | profanity, spectators | Settings drawer |
| `Card` 🔲 | Container | default, glass, elevated | Landing, lobby, reveal |
| `Dialog` 🔲 | Overlay | — | Kick confirm, report |
| `AlertDialog` 🔲 | Overlay | destructive actions | Kick, clear canvas |
| `Drawer` 🔲 | Overlay | right (desktop), bottom (mobile) | Settings, toolbar |
| `Sheet` 🔲 | Overlay | bottom | Mobile nav, color picker |
| `DropdownMenu` 🔲 | Menu | — | Avatar menu, player actions |
| `Popover` 🔲 | Overlay | — | Color picker, tooltips |
| `Tooltip` 🔲 | Overlay | — | Toolbar, disabled start |
| `Toast` 🔲 | Feedback | default, success, error, warning | Global |
| `Sonner` 🔲 | Feedback | toast provider | App root |
| `Avatar` 🔲 | Display | sm, md, lg, xl + fallback initials | Lobby, waiting |
| `Badge` 🔲 | Display | default, success, warning, outline | Room code, role, spectator |
| `Skeleton` 🔲 | Loading | text, card, avatar, canvas | All async views |
| `Spinner` ✨ | Loading | sm, md, lg | Submit buttons |
| `Progress` 🔲 | Display | timer bar | Game header |
| `Separator` 🔲 | Layout | horizontal, vertical | Sections |
| `Tabs` 🔲 | Navigation | — | Profile, admin |
| `Table` 🔲 | Display | — | History, admin reports |
| `ScrollArea` 🔲 | Layout | — | Long lists |

---

## Layout Components (`shared/ui/layout/`)

| Component | Type | Description |
|-----------|------|-------------|
| `AppShell` ✨ | Layout | Header + main + optional footer |
| `RoomShell` ✨ | Layout | In-room header + phase outlet |
| `GameShell` ✨ | Layout | Minimal game header + full-bleed content |
| `Container` ✨ | Layout | Max-width 1280px centered |
| `PageHeader` ✨ | Layout | Title + description + actions |
| `Section` ✨ | Layout | Vertical spacing wrapper |
| `Grid` ✨ | Layout | Responsive CSS grid helper |

---

## Theme & Motion (`shared/ui/`)

| Component | Type | Description |
|-----------|------|-------------|
| `ThemeProvider` ✨ | Provider | next-themes wrapper |
| `ThemeToggle` ✨ | Interactive | Sun/moon animated toggle |
| `MotionFadeIn` ✨ | Motion | Framer Motion fade wrapper |
| `MotionSlideUp` ✨ | Motion | Stagger children entrance |
| `MotionPresence` ✨ | Motion | AnimatePresence helper |
| `ReducedMotionProvider` ✨ | A11y | Respects prefers-reduced-motion |

---

## Marketing (`features/marketing/components/`)

| Component | Type | Description |
|-----------|------|-------------|
| `HeroSection` ✨ | Section | Headline, CTAs, illustration |
| `HowItWorksSection` ✨ | Section | 4-step explainer cards |
| `FeaturesGrid` ✨ | Section | Feature highlight cards |
| `QuickJoinCard` ✨ | Interactive | Inline code entry on landing |
| `Footer` ✨ | Layout | Legal links, copyright |
| `MarketingHeader` ✨ | Layout | Global nav variant |

---

## Auth (`features/auth/components/`)

| Component | Type | Description |
|-----------|------|-------------|
| `LoginForm` ✨ | Form | Email + password + RHF + Zod |
| `RegisterForm` ✨ | Form | Sign up fields |
| `OAuthButtons` ✨ | Interactive | Google, GitHub |
| `AuthCard` ✨ | Container | Centered auth layout |
| `GuestNameForm` ✨ | Form | Display name for guest join |
| `ForgotPasswordForm` ✨ | Form | Email reset |

---

## Rooms & Lobby (`features/rooms/`, `features/lobby/`)

| Component | Type | Description |
|-----------|------|-------------|
| `CreateRoomForm` ✨ | Form | Visibility + settings |
| `JoinRoomForm` ✨ | Form | Code + name |
| `RoomCodeInput` ✨ | Input | 6-char segmented input |
| `RoomHeader` ✨ | Layout | Code, count, actions |
| `InviteLinkBar` ✨ | Interactive | URL display + copy + share |
| `PlayerGrid` ✨ | Display | Responsive avatar cards |
| `PlayerCard` ✨ | Display | Avatar, name, ready, host crown |
| `PlayerCardMenu` ✨ | Menu | Kick, transfer host (host only) |
| `ReadyButton` ✨ | Interactive | Toggle with animated state |
| `StartGameButton` ✨ | Interactive | Host CTA with disabled tooltip |
| `RoomSettingsDrawer` ✨ | Drawer | Timer sliders, toggles |
| `PublicRoomList` ✨ | List | Browse page room cards |
| `PublicRoomCard` ✨ | Card | Room preview + join CTA |
| `ConnectionBadge` ✨ | Display | Online / reconnecting / offline dot |
| `CopyLinkButton` ✨ | Interactive | Clipboard + toast |

---

## Game (`features/game/components/`)

| Component | Type | Description |
|-----------|------|-------------|
| `GameHeader` 🎮 | Layout | Phase, turn counter, timer, leave |
| `GameTimer` 🎮 | Display | Progress bar + countdown + warning states |
| `TurnIndicator` 🎮 | Display | "Your turn" / "Player X is drawing" |
| `TurnProgressDots` 🎮 | Display | Chain turn progress |
| `DescribePhase` 🎮 | Phase | Drawing/prompt display + textarea + submit |
| `DrawPhase` 🎮 | Phase | Prompt card + canvas + submit |
| `WaitingPhase` 🎮 | Phase | Active player highlight + timer |
| `PromptCard` 🎮 | Display | Styled text prompt container |
| `PriorDrawingCard` 🎮 | Display | Image with loading skeleton |
| `StarterPromptCard` 🎮 | Display | First-turn prompt variant |
| `SubmitButton` 🎮 | Interactive | Loading state, disabled rules |
| `SpectatorBanner` 🎮 | Display | Read-only mode indicator |
| `GamePhaseRouter` 🎮 | Router | Renders phase by game state |
| `ReconnectBanner` 🎮 | Feedback | Connection status overlay |
| `PauseOverlay` 🎮 | Overlay | Game paused message |

---

## Canvas (`features/canvas/components/`)

| Component | Type | Description |
|-----------|------|-------------|
| `DrawingCanvas` 🎮 | Canvas | Pointer event handler + render loop |
| `CanvasToolbar` 🎮 | Toolbar | Tool buttons horizontal/vertical |
| `BrushToolButton` 🎮 | Toggle | Active state |
| `EraserToolButton` 🎮 | Toggle | — |
| `ColorPicker` 🎮 | Popover | Preset palette + custom |
| `BrushSizeSlider` 🎮 | Slider | 1–32 range |
| `UndoRedoButtons` 🎮 | Interactive | Disabled at stack limits |
| `ClearCanvasDialog` 🎮 | AlertDialog | Confirm clear |
| `CanvasSkeleton` 🎮 | Loading | Placeholder while mounting |
| `DraftRestoreDialog` 🎮 | Dialog | Restore localStorage draft |

---

## Reveal (`features/reveal/components/`)

| Component | Type | Description |
|-----------|------|-------------|
| `RevealShell` 🎮 | Layout | Reveal page wrapper |
| `ChainViewer` 🎮 | Display | Single chain playback container |
| `RevealStep` 🎮 | Motion | Animated step (prompt/desc/draw) |
| `RevealStepArrow` 🎮 | Display | Connector between steps |
| `RevealControls` 🎮 | Interactive | Prev/next/autoplay |
| `ChainSelector` 🎮 | Tabs | Switch between chains |
| `VoteButtons` 🎮 | Interactive | Vote per chain |
| `WinnerBanner` 🎮 | Display | Vote result celebration |
| `PlayAgainButton` 🎮 | Interactive | Host rematch CTA |
| `ReportButton` 🎮 | Interactive | Flag on reveal steps |

---

## Profile (`features/profile/components/`)

| Component | Type | Description |
|-----------|------|-------------|
| `ProfileHeader` ✨ | Display | Avatar, name, edit |
| `StatsGrid` ✨ | Display | 4 stat cards |
| `StatCard` ✨ | Display | Number + label |
| `GameHistoryList` ✨ | List | Paginated table/cards |
| `GameHistoryRow` ✨ | Display | Single game summary |
| `AchievementBadge` ✨ | Display | Badge icon + tooltip (P2) |
| `EditProfileForm` ✨ | Form | Name + avatar URL |

---

## Admin (`features/admin/components/`)

| Component | Type | Description |
|-----------|------|-------------|
| `AdminShell` ✨ | Layout | Sidebar + content |
| `ReportsTable` ✨ | Table | Pending reports queue |
| `ReportDetailPanel` ✨ | Panel | Content preview + actions |
| `BanUserDialog` ✨ | Dialog | Duration + reason |
| `AnalyticsCards` ✨ | Display | KPI cards (P2) |

---

## Component Hierarchy (Game View)

```
GameShell
├── GameHeader
│   ├── Badge (room code)
│   ├── TurnIndicator
│   ├── GameTimer
│   └── Button (leave)
├── ReconnectBanner (conditional)
├── SpectatorBanner (conditional)
└── GamePhaseRouter
    ├── DescribePhase
    │   ├── PriorDrawingCard | StarterPromptCard
    │   ├── Textarea
    │   └── SubmitButton
    ├── DrawPhase
    │   ├── PromptCard
    │   ├── CanvasToolbar
    │   ├── DrawingCanvas
    │   └── SubmitButton
    └── WaitingPhase
        ├── Avatar (active player)
        ├── TurnIndicator
        ├── GameTimer
        └── TurnProgressDots
```

---

## shadcn/ui Components to Install (MVP)

```
button, input, label, textarea, select, slider, checkbox, switch,
card, dialog, alert-dialog, drawer, sheet, dropdown-menu, popover,
tooltip, toast, sonner, avatar, badge, skeleton, progress, separator,
tabs, table, scroll-area, form
```

---

## Component State Patterns

| Pattern | Usage |
|---------|-------|
| **Loading** | Skeleton → content crossfade |
| **Empty** | Illustration + CTA (empty lobby slot, no history) |
| **Error** | Inline field error OR toast |
| **Disabled** | Reduced opacity + tooltip reason |
| **Active/Selected** | Ring + gradient border (player turn, tool) |

---

## Accessibility Requirements (All Components)

- Focus visible ring using `--ring` token
- `aria-label` on icon-only buttons
- Live regions for timer warnings (`aria-live="polite"`)
- Keyboard navigable toolbars (arrow keys)
- Min touch target 44×44px on mobile

---

## Related Documents

- Design tokens: [05-design-tokens.md](./05-design-tokens.md)
- Wireframes: [03-wireframes.md](./03-wireframes.md)
- Coding standards: [../phase-0/20-coding-standards.md](../phase-0/20-coding-standards.md)
