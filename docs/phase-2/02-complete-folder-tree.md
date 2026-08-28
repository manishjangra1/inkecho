# Phase 2 — Document 2: Complete Folder Tree

## Overview

Every folder and significant file in the InkEcho repository is listed below. Files marked `(M2)` … `(M6)` indicate the milestone when they are first implemented.

---

## Complete Tree

```
InkEcho/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                          (M2) Lint, typecheck, unit tests
│   │   └── e2e.yml                         (M6) Playwright on preview deploy
│   └── PULL_REQUEST_TEMPLATE.md            (M2)
│
├── .husky/
│   ├── pre-commit                          (M2) lint-staged
│   └── commit-msg                          (M2) optional conventional commit check
│
├── docs/
│   ├── README.md
│   ├── phase-0/                            Design docs (complete)
│   ├── phase-1/                            UI design (complete)
│   ├── phase-2/                            Folder architecture (this phase)
│   ├── phase-3/                            Prisma schema (next)
│   └── phase-4–7/                          Auth, realtime, backend design (planned)
│
├── prisma/
│   ├── schema.prisma                       (M2/M3) MongoDB models
│   ├── seed.ts                             (M3) PromptPool, achievements
│   └── migrations/                         (M2+) Generated migration history
│
├── public/
│   ├── favicon.ico                         (M2)
│   ├── og-image.png                        (M6) Open Graph
│   ├── icons/                              (M2) PWA icons (optional)
│   └── illustrations/                      (M6) Landing SVG/WebP assets
│
├── scripts/
│   ├── seed-prompts.ts                     (M3) Bulk prompt import
│   └── cleanup-rooms.ts                    (M4) Manual inactive room cleanup
│
├── tests/
│   ├── e2e/
│   │   ├── fixtures/                       (M6) Test users, helpers
│   │   ├── auth.spec.ts                    (M3)
│   │   ├── lobby.spec.ts                   (M3)
│   │   ├── game-flow.spec.ts               (M4)
│   │   └── reveal.spec.ts                  (M6)
│   ├── load/
│   │   ├── room-create.js                  (M6) k6 scripts
│   │   └── turn-submit.js                  (M6)
│   ├── factories/
│   │   ├── room.factory.ts                 (M3)
│   │   ├── game.factory.ts                 (M4)
│   │   └── user.factory.ts                 (M3)
│   └── setup/
│       ├── db.ts                           (M3) Test DB reset
│       └── vitest.setup.ts                 (M2)
│
├── src/
│   │
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx                  (M2) MarketingHeader + Footer
│   │   │   ├── page.tsx                    (M2) Landing /
│   │   │   ├── browse/
│   │   │   │   └── page.tsx                (M3) Public room list
│   │   │   ├── create/
│   │   │   │   └── page.tsx                (M3) Create room form
│   │   │   ├── join/
│   │   │   │   ├── page.tsx                (M3) Join by code
│   │   │   │   └── [code]/
│   │   │   │       └── page.tsx            (M3) Pre-filled invite link
│   │   │   └── legal/
│   │   │       ├── privacy/
│   │   │       │   └── page.tsx            (M6)
│   │   │       └── terms/
│   │   │           └── page.tsx            (M6)
│   │   │
│   │   ├── (auth)/
│   │   │   ├── layout.tsx                  (M3) Centered AuthCard layout
│   │   │   └── auth/
│   │   │       ├── login/
│   │   │       │   └── page.tsx            (M3)
│   │   │       ├── register/
│   │   │       │   └── page.tsx            (M3)
│   │   │       └── forgot-password/
│   │   │           └── page.tsx            (M3)
│   │   │
│   │   ├── (game)/
│   │   │   ├── layout.tsx                  (M3) RoomShell wrapper
│   │   │   └── room/
│   │   │       └── [code]/
│   │   │           ├── layout.tsx          (M3) Room state redirect logic
│   │   │           ├── page.tsx            (M3) Redirect → lobby/game/reveal
│   │   │           ├── lobby/
│   │   │           │   └── page.tsx        (M3)
│   │   │           ├── game/
│   │   │           │   └── page.tsx        (M4)
│   │   │           ├── reveal/
│   │   │           │   └── page.tsx        (M6)
│   │   │           └── spectate/
│   │   │               └── page.tsx        (M4) Spectator alias route
│   │   │
│   │   ├── (account)/
│   │   │   ├── layout.tsx                  (M6) Profile layout with nav
│   │   │   └── profile/
│   │   │       ├── page.tsx                (M6) Overview + stats
│   │   │       ├── history/
│   │   │       │   └── page.tsx            (M6)
│   │   │       ├── stats/
│   │   │       │   └── page.tsx            (M6)
│   │   │       └── achievements/
│   │   │           └── page.tsx            (M6/P2)
│   │   │
│   │   ├── (admin)/
│   │   │   ├── layout.tsx                  (M6) AdminShell + role guard
│   │   │   └── admin/
│   │   │       ├── page.tsx                (M6) Dashboard redirect
│   │   │       ├── reports/
│   │   │       │   └── page.tsx            (M6)
│   │   │       ├── users/
│   │   │       │   └── page.tsx            (M6)
│   │   │       └── analytics/
│   │   │           └── page.tsx            (M6/P2)
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...all]/
│   │   │   │       └── route.ts            (M3) Better Auth handler
│   │   │   ├── guest/
│   │   │   │   └── session/
│   │   │   │       └── route.ts            (M3) POST guest session
│   │   │   ├── rooms/
│   │   │   │   ├── route.ts                (M3) GET list, POST create
│   │   │   │   └── [code]/
│   │   │   │       ├── route.ts            (M3) GET, PATCH, DELETE room
│   │   │   │       ├── join/
│   │   │   │       │   └── route.ts        (M3)
│   │   │   │       ├── leave/
│   │   │   │       │   └── route.ts        (M3)
│   │   │   │       ├── ready/
│   │   │   │       │   └── route.ts        (M3)
│   │   │   │       ├── kick/
│   │   │   │       │   └── route.ts        (M3)
│   │   │   │       ├── transfer-host/
│   │   │   │       │   └── route.ts        (M3)
│   │   │   │       └── game/
│   │   │   │           ├── route.ts        (M4) GET game snapshot
│   │   │   │           ├── start/
│   │   │   │           │   └── route.ts    (M4)
│   │   │   │           ├── pause/
│   │   │   │           │   └── route.ts    (M4)
│   │   │   │           ├── resume/
│   │   │   │           │   └── route.ts    (M4)
│   │   │   │           ├── submit/
│   │   │   │           │   ├── description/
│   │   │   │           │   │   └── route.ts (M4)
│   │   │   │           │   └── drawing/
│   │   │   │           │       └── route.ts (M5)
│   │   │   │           ├── vote/
│   │   │   │           │   └── route.ts    (M6)
│   │   │   │           └── rematch/
│   │   │   │               └── route.ts    (M6)
│   │   │   ├── realtime/
│   │   │   │   └── token/
│   │   │   │       └── route.ts            (M4) Ably token auth
│   │   │   ├── profile/
│   │   │   │   ├── route.ts                (M6) GET, PATCH profile
│   │   │   │   └── history/
│   │   │   │       └── route.ts            (M6)
│   │   │   ├── reports/
│   │   │   │   └── route.ts                (M6) POST player report
│   │   │   ├── admin/
│   │   │   │   ├── reports/
│   │   │   │   │   ├── route.ts            (M6)
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── route.ts        (M6)
│   │   │   │   └── users/
│   │   │   │       └── [id]/
│   │   │   │           └── ban/
│   │   │   │               └── route.ts    (M6)
│   │   │   ├── cron/
│   │   │   │   └── cleanup-rooms/
│   │   │   │       └── route.ts            (M4) Vercel cron
│   │   │   └── health/
│   │   │       └── route.ts                (M2)
│   │   │
│   │   ├── globals.css                     (M2) CSS variables / tokens
│   │   ├── layout.tsx                      (M2) Root providers
│   │   ├── not-found.tsx                   (M2)
│   │   └── error.tsx                       (M2) Root error boundary
│   │
│   ├── domain/
│   │   ├── shared/
│   │   │   ├── result.ts                   (M2) Result<T, E> type
│   │   │   ├── errors.ts                   (M2) Domain error types
│   │   │   └── value-objects/
│   │   │       ├── room-code.ts            (M3) Code validation/generation rules
│   │   │       └── display-name.ts         (M3) Name validation rules
│   │   ├── room/
│   │   │   ├── room-state-machine.ts       (M3) LOBBY → IN_PROGRESS → …
│   │   │   ├── room-transitions.ts         (M3)
│   │   │   └── room-rules.ts               (M3) Host rules, kick, capacity
│   │   ├── game/
│   │   │   ├── game-state-machine.ts       (M4) Turn/phase transitions
│   │   │   ├── game-transitions.ts         (M4)
│   │   │   ├── turn-order.ts               (M4) Shuffle, assignment
│   │   │   ├── chain-builder.ts            (M4) Chain/turn indexing
│   │   │   └── visibility-filter.ts        (M4) Hide content per player
│   │   ├── timer/
│   │   │   ├── timer-calculator.ts         (M4) Remaining time from epoch
│   │   │   └── timer-rules.ts              (M4) Pause, expiry, grace
│   │   └── player/
│   │       └── player-role.ts              (M3) HOST, PLAYER, SPECTATOR rules
│   │
│   ├── features/
│   │   │
│   │   ├── marketing/
│   │   │   ├── components/
│   │   │   │   ├── HeroSection.tsx         (M2)
│   │   │   │   ├── HowItWorksSection.tsx   (M2)
│   │   │   │   ├── FeaturesGrid.tsx        (M2)
│   │   │   │   ├── QuickJoinCard.tsx       (M2)
│   │   │   │   ├── MarketingHeader.tsx     (M2)
│   │   │   │   └── Footer.tsx              (M2)
│   │   │   └── index.ts                    (M2)
│   │   │
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── AuthCard.tsx            (M3)
│   │   │   │   ├── LoginForm.tsx           (M3)
│   │   │   │   ├── RegisterForm.tsx        (M3)
│   │   │   │   ├── OAuthButtons.tsx        (M3)
│   │   │   │   ├── GuestNameForm.tsx       (M3)
│   │   │   │   └── ForgotPasswordForm.tsx  (M3)
│   │   │   ├── actions/
│   │   │   │   ├── create-guest-session.action.ts  (M3)
│   │   │   │   └── update-profile.action.ts        (M6)
│   │   │   ├── hooks/
│   │   │   │   ├── use-session.ts          (M3)
│   │   │   │   └── use-guest-session.ts    (M3)
│   │   │   ├── schemas/
│   │   │   │   ├── login.schema.ts         (M3)
│   │   │   │   ├── register.schema.ts      (M3)
│   │   │   │   └── guest-session.schema.ts (M3)
│   │   │   ├── services/
│   │   │   │   └── guest-session.service.ts (M3)
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts           (M3)
│   │   │   └── index.ts                    (M3)
│   │   │
│   │   ├── rooms/
│   │   │   ├── components/
│   │   │   │   ├── CreateRoomForm.tsx      (M3)
│   │   │   │   ├── JoinRoomForm.tsx        (M3)
│   │   │   │   ├── RoomCodeInput.tsx       (M3)
│   │   │   │   ├── RoomHeader.tsx          (M3)
│   │   │   │   ├── InviteLinkBar.tsx       (M3)
│   │   │   │   ├── RoomSettingsDrawer.tsx  (M3)
│   │   │   │   ├── PublicRoomList.tsx      (M3)
│   │   │   │   ├── PublicRoomCard.tsx      (M3)
│   │   │   │   └── CopyLinkButton.tsx      (M3)
│   │   │   ├── actions/
│   │   │   │   ├── create-room.action.ts   (M3)
│   │   │   │   ├── join-room.action.ts     (M3)
│   │   │   │   ├── leave-room.action.ts    (M3)
│   │   │   │   └── update-room-settings.action.ts (M3)
│   │   │   ├── hooks/
│   │   │   │   ├── use-room.ts             (M3) TanStack Query
│   │   │   │   └── use-public-rooms.ts     (M3)
│   │   │   ├── services/
│   │   │   │   └── room.service.ts         (M3)
│   │   │   ├── schemas/
│   │   │   │   ├── create-room.schema.ts   (M3)
│   │   │   │   ├── join-room.schema.ts     (M3)
│   │   │   │   └── room-settings.schema.ts (M3)
│   │   │   ├── types/
│   │   │   │   └── room.types.ts           (M3)
│   │   │   └── index.ts                    (M3)
│   │   │
│   │   ├── lobby/
│   │   │   ├── components/
│   │   │   │   ├── LobbyView.tsx           (M3)
│   │   │   │   ├── PlayerGrid.tsx          (M3)
│   │   │   │   ├── PlayerCard.tsx          (M3)
│   │   │   │   ├── PlayerCardMenu.tsx      (M3)
│   │   │   │   ├── ReadyButton.tsx         (M3)
│   │   │   │   ├── StartGameButton.tsx     (M3)
│   │   │   │   └── ConnectionBadge.tsx     (M3)
│   │   │   ├── actions/
│   │   │   │   ├── toggle-ready.action.ts  (M3)
│   │   │   │   ├── kick-player.action.ts    (M3)
│   │   │   │   ├── transfer-host.action.ts (M3)
│   │   │   │   └── start-game.action.ts    (M4) delegates to game service
│   │   │   ├── hooks/
│   │   │   │   └── use-lobby.ts            (M3)
│   │   │   ├── services/
│   │   │   │   └── lobby.service.ts        (M3)
│   │   │   └── index.ts                    (M3)
│   │   │
│   │   ├── game/
│   │   │   ├── components/
│   │   │   │   ├── GameShell.tsx           (M4)
│   │   │   │   ├── GameHeader.tsx          (M4)
│   │   │   │   ├── GameTimer.tsx           (M4)
│   │   │   │   ├── TurnIndicator.tsx       (M4)
│   │   │   │   ├── TurnProgressDots.tsx    (M4)
│   │   │   │   ├── GamePhaseRouter.tsx     (M4)
│   │   │   │   ├── DescribePhase.tsx       (M4)
│   │   │   │   ├── DrawPhase.tsx           (M5)
│   │   │   │   ├── WaitingPhase.tsx        (M4)
│   │   │   │   ├── PromptCard.tsx          (M4)
│   │   │   │   ├── PriorDrawingCard.tsx    (M4)
│   │   │   │   ├── StarterPromptCard.tsx   (M4)
│   │   │   │   ├── SubmitButton.tsx        (M4)
│   │   │   │   ├── SpectatorBanner.tsx     (M4)
│   │   │   │   ├── ReconnectBanner.tsx     (M4)
│   │   │   │   └── PauseOverlay.tsx        (M4)
│   │   │   ├── actions/
│   │   │   │   ├── submit-description.action.ts (M4)
│   │   │   │   ├── submit-drawing.action.ts     (M5)
│   │   │   │   ├── pause-game.action.ts         (M4)
│   │   │   │   └── resume-game.action.ts        (M4)
│   │   │   ├── hooks/
│   │   │   │   ├── use-game-state.ts       (M4)
│   │   │   │   └── use-game-timer.ts       (M4)
│   │   │   ├── stores/
│   │   │   │   └── game-store.ts           (M4) Zustand
│   │   │   ├── services/
│   │   │   │   └── game.service.ts         (M4)
│   │   │   ├── schemas/
│   │   │   │   ├── submit-description.schema.ts (M4)
│   │   │   │   └── submit-drawing.schema.ts     (M5)
│   │   │   ├── types/
│   │   │   │   └── game.types.ts           (M4)
│   │   │   └── index.ts                    (M4)
│   │   │
│   │   ├── canvas/
│   │   │   ├── components/
│   │   │   │   ├── DrawingCanvas.tsx       (M5)
│   │   │   │   ├── CanvasToolbar.tsx       (M5)
│   │   │   │   ├── ColorPicker.tsx         (M5)
│   │   │   │   ├── BrushSizeSlider.tsx     (M5)
│   │   │   │   ├── UndoRedoButtons.tsx     (M5)
│   │   │   │   ├── ClearCanvasDialog.tsx   (M5)
│   │   │   │   ├── CanvasSkeleton.tsx      (M5)
│   │   │   │   └── DraftRestoreDialog.tsx  (M5)
│   │   │   ├── hooks/
│   │   │   │   ├── use-canvas-engine.ts    (M5)
│   │   │   │   ├── use-canvas-undo-redo.ts (M5)
│   │   │   │   ├── use-canvas-export.ts    (M5)
│   │   │   │   └── use-canvas-autosave.ts  (M5)
│   │   │   ├── lib/
│   │   │   │   ├── stroke-renderer.ts      (M5)
│   │   │   │   ├── stroke-simplifier.ts    (M5)
│   │   │   │   └── canvas-utils.ts         (M5)
│   │   │   ├── schemas/
│   │   │   │   └── canvas.schema.ts        (M5)
│   │   │   ├── types/
│   │   │   │   └── canvas.types.ts         (M5)
│   │   │   └── index.ts                    (M5)
│   │   │
│   │   ├── reveal/
│   │   │   ├── components/
│   │   │   │   ├── RevealShell.tsx         (M6)
│   │   │   │   ├── ChainViewer.tsx         (M6)
│   │   │   │   ├── RevealStep.tsx          (M6)
│   │   │   │   ├── RevealControls.tsx      (M6)
│   │   │   │   ├── ChainSelector.tsx       (M6)
│   │   │   │   ├── VoteButtons.tsx         (M6)
│   │   │   │   ├── WinnerBanner.tsx        (M6)
│   │   │   │   ├── PlayAgainButton.tsx     (M6)
│   │   │   │   └── ReportButton.tsx        (M6)
│   │   │   ├── actions/
│   │   │   │   ├── vote-chain.action.ts    (M6)
│   │   │   │   └── rematch.action.ts       (M6)
│   │   │   ├── hooks/
│   │   │   │   └── use-reveal-playback.ts  (M6)
│   │   │   ├── services/
│   │   │   │   └── reveal.service.ts       (M6)
│   │   │   └── index.ts                    (M6)
│   │   │
│   │   ├── realtime/
│   │   │   ├── hooks/
│   │   │   │   ├── use-ably-room.ts        (M4) Subscribe + presence
│   │   │   │   └── use-realtime-sync.ts    (M4) Event → store reducer
│   │   │   ├── lib/
│   │   │   │   ├── event-reducer.ts        (M4) Apply Ably events
│   │   │   │   └── channel-names.ts        (M4)
│   │   │   ├── providers/
│   │   │   │   └── RealtimeProvider.tsx    (M4)
│   │   │   ├── types/
│   │   │   │   └── realtime.types.ts       (M4)
│   │   │   └── index.ts                    (M4)
│   │   │
│   │   ├── profile/
│   │   │   ├── components/
│   │   │   │   ├── ProfileHeader.tsx       (M6)
│   │   │   │   ├── StatsGrid.tsx           (M6)
│   │   │   │   ├── StatCard.tsx            (M6)
│   │   │   │   ├── GameHistoryList.tsx     (M6)
│   │   │   │   ├── GameHistoryRow.tsx      (M6)
│   │   │   │   ├── AchievementBadge.tsx    (M6)
│   │   │   │   └── EditProfileForm.tsx     (M6)
│   │   │   ├── hooks/
│   │   │   │   ├── use-profile.ts          (M6)
│   │   │   │   └── use-game-history.ts     (M6)
│   │   │   ├── services/
│   │   │   │   └── profile.service.ts      (M6)
│   │   │   └── index.ts                    (M6)
│   │   │
│   │   └── admin/
│   │       ├── components/
│   │       │   ├── AdminShell.tsx          (M6)
│   │       │   ├── ReportsTable.tsx        (M6)
│   │       │   ├── ReportDetailPanel.tsx   (M6)
│   │       │   ├── BanUserDialog.tsx       (M6)
│   │       │   └── AnalyticsCards.tsx      (M6)
│   │       ├── actions/
│   │       │   ├── review-report.action.ts (M6)
│   │       │   └── ban-user.action.ts      (M6)
│   │       ├── services/
│   │       │   └── admin.service.ts        (M6)
│   │       └── index.ts                    (M6)
│   │
│   ├── infrastructure/
│   │   ├── db/
│   │   │   ├── prisma.client.ts            (M2) Singleton Prisma client
│   │   │   ├── repositories/
│   │   │   │   ├── user.repository.ts      (M3)
│   │   │   │   ├── guest-session.repository.ts (M3)
│   │   │   │   ├── room.repository.ts      (M3)
│   │   │   │   ├── participant.repository.ts (M3)
│   │   │   │   ├── game.repository.ts      (M4)
│   │   │   │   ├── game-history.repository.ts (M6)
│   │   │   │   ├── report.repository.ts    (M6)
│   │   │   │   └── prompt-pool.repository.ts (M4)
│   │   │   └── mappers/
│   │   │       ├── room.mapper.ts          (M3) Prisma → domain/DTO
│   │   │       └── game.mapper.ts          (M4)
│   │   ├── auth/
│   │   │   ├── better-auth.config.ts       (M3)
│   │   │   ├── guest-jwt.ts                (M3) Sign/verify guest tokens
│   │   │   └── session.ts                  (M3) getSession, requireAuth helpers
│   │   ├── realtime/
│   │   │   ├── ably.client.ts              (M4) Browser client factory
│   │   │   ├── ably.server.ts              (M4) REST publish
│   │   │   ├── ably-token.service.ts       (M4) Token request generation
│   │   │   └── event-publisher.ts          (M4) Typed publish wrapper
│   │   ├── storage/
│   │   │   └── cloudinary.service.ts       (M5) Upload, delete, URL build
│   │   ├── cache/
│   │   │   └── rate-limiter.ts             (M3) Upstash sliding window
│   │   └── monitoring/
│   │       ├── logger.ts                   (M2) Pino instance
│   │       ├── sentry.client.ts            (M2)
│   │       ├── sentry.server.ts            (M2)
│   │       └── request-context.ts          (M2) correlationId helper
│   │
│   └── shared/
│       ├── ui/
│       │   ├── button.tsx                  (M2) shadcn
│       │   ├── input.tsx                   (M2)
│       │   ├── ...                         (M2) all shadcn primitives
│       │   ├── layout/
│       │   │   ├── AppShell.tsx            (M2)
│       │   │   ├── RoomShell.tsx           (M3)
│       │   │   ├── GameShell.tsx           (M4) re-export or base
│       │   │   ├── Container.tsx           (M2)
│       │   │   └── PageHeader.tsx          (M2)
│       │   └── motion/
│       │       ├── MotionFadeIn.tsx        (M2)
│       │       ├── MotionSlideUp.tsx       (M2)
│       │       ├── MotionPage.tsx          (M2)
│       │       └── MotionReduced.tsx       (M2)
│       ├── lib/
│       │   ├── cn.ts                       (M2) clsx + tailwind-merge
│       │   ├── errors/
│       │   │   ├── app-error.ts            (M2)
│       │   │   └── handle-action-error.ts  (M2)
│       │   ├── auth/
│       │   │   └── authorize.ts            (M3) Role/permission checks
│       │   ├── api/
│       │   │   └── parse-request.ts        (M3) Zod + correlation ID
│       │   └── utils/
│       │       ├── format-time.ts          (M4)
│       │       └── format-date.ts          (M6)
│       ├── config/
│       │   ├── env.ts                      (M2)
│       │   ├── app.config.ts               (M2)
│       │   ├── game.config.ts              (M4)
│       │   ├── room.config.ts              (M3)
│       │   ├── canvas.config.ts            (M5)
│       │   ├── motion.config.ts            (M2)
│       │   ├── rate-limit.config.ts        (M3)
│       │   └── theme.config.ts             (M2)
│       ├── constants/
│       │   ├── query-keys.ts               (M3)
│       │   ├── realtime-events.ts          (M4)
│       │   ├── routes.ts                   (M2)
│       │   └── copy/
│       │       ├── common.ts               (M2)
│       │       ├── lobby.ts                (M3)
│       │       ├── game.ts                 (M4)
│       │       └── errors.ts               (M2)
│       ├── types/
│       │   ├── api.types.ts                (M2)
│       │   └── pagination.types.ts         (M3)
│       └── providers/
│           ├── AppProviders.tsx            (M2) Composes all providers
│           ├── QueryProvider.tsx           (M2)
│           └── ThemeProvider.tsx           (M2)
│
├── middleware.ts                           (M2) Auth, headers, correlation ID
├── next.config.ts                          (M2)
├── tailwind.config.ts                      (M2)
├── tsconfig.json                           (M2)
├── vitest.config.ts                        (M2)
├── playwright.config.ts                    (M6)
├── components.json                         (M2) shadcn
├── .env.example                            (M2)
└── package.json                            (M2)
```

---

## Folder Explanations by Section

### `.github/workflows/`

CI automation. `ci.yml` runs on every push/PR. `e2e.yml` runs Playwright against Vercel preview URLs after deploy. Keeps deployment concerns out of `src/`.

### `prisma/`

Database schema and migrations separated from application code per Prisma convention. `seed.ts` populates `PromptPool` and default `Achievement` records. Repositories in `infrastructure/db/` consume the generated client — components never import Prisma directly.

### `public/`

Static assets served at root URL. Illustrations and OG images are large binaries that should not pass through the JS bundle. Canvas drawings are **not** here — they go to Cloudinary.

### `scripts/`

CLI maintenance scripts invoked via `pnpm script:name`. Not imported by the Next.js app. Used for bulk seeding and manual cleanup outside Vercel cron.

### `tests/`

End-to-end and load tests require full browser or k6 runtime — kept separate from Vitest unit tests colocated in `src/`. Factories shared across integration and E2E tests live here to avoid polluting production bundles.

---

### `src/app/(marketing)/`

Route group with shared marketing layout (header + footer). Parentheses mean the group name does not appear in the URL. Contains public-facing pages that do not require room context.

| Route file | Delegates to |
|------------|--------------|
| `page.tsx` | `features/marketing` hero + sections |
| `browse/page.tsx` | `features/rooms/PublicRoomList` |
| `create/page.tsx` | `features/rooms/CreateRoomForm` |
| `join/page.tsx` | `features/rooms/JoinRoomForm` |

### `src/app/(auth)/`

Centered card layout for authentication pages. Minimal chrome — no marketing footer. Better Auth handles `/api/auth/*`; these pages are UI only.

### `src/app/(game)/`

Room-scoped experiences. `room/[code]/layout.tsx` fetches room status and redirects to correct phase sub-route. This centralizes routing logic so individual phase pages stay dumb.

| Sub-route | Phase document |
|-----------|------------------|
| `lobby/` | Document 11 — LOBBY state |
| `game/` | IN_PROGRESS — describe/draw/wait |
| `reveal/` | REVEAL state |
| `spectate/` | Same as game with spectator role flag |

### `src/app/(account)/` and `(admin)/`

Authenticated user areas. Layouts enforce session/role guards server-side before rendering children. Admin layout additionally checks `role === ADMIN`.

### `src/app/api/`

Route Handlers for endpoints that must be REST-accessible: Ably token, Better Auth, cron jobs, health check, and future webhooks. Mutations used by the Next.js UI prefer Server Actions in `features/*/actions/` instead.

---

### `src/domain/`

**Pure business logic.** Each subfolder maps to a bounded context:

| Folder | Owns |
|--------|------|
| `shared/` | `Result` type, domain errors, value objects |
| `room/` | Room state machine, capacity, host rules |
| `game/` | Game state machine, turn order, chain math, content visibility |
| `timer/` | Time remaining calculations, pause offset math |
| `player/` | Role capabilities (can kick? can submit?) |

Unit tests here achieve near-100% coverage because there are no mocks needed.

---

### `src/features/marketing/`

Landing page components only. No server actions — CTAs link to `/create` and `/join`. Kept separate from `rooms` so marketing can evolve independently.

### `src/features/auth/`

Guest session creation, login/register UI, session hooks. `guest-session.service.ts` orchestrates guest JWT + DB record. Registered auth delegated to Better Auth in `infrastructure/auth/`.

### `src/features/rooms/`

Room lifecycle before game starts: create, join, browse, settings. Does **not** contain lobby ready-state UI (that's `lobby/`) or game logic (that's `game/`).

### `src/features/lobby/`

Waiting room experience: player grid, ready toggle, kick, start button. `start-game.action.ts` calls `game.service.ts` to transition room state — lobby does not contain game engine logic.

### `src/features/game/`

Active gameplay UI and orchestration. `game-store.ts` (Zustand) holds realtime game snapshot. `GamePhaseRouter` renders describe/draw/wait components. Domain state machine validates all mutations in `game.service.ts`.

### `src/features/canvas/`

Isolated drawing subsystem. No game logic — receives `onExport(blob)` callback from `DrawPhase`. All pointer handling and stroke math lives here. Enables independent testing and future reuse.

### `src/features/reveal/`

Post-game playback UI. Reads completed game data (full chains visible). Voting and rematch actions live here. Animation sequencing in `use-reveal-playback.ts`.

### `src/features/realtime/`

Ably client integration layer. **Does not** contain game UI. Subscribes to room channel, runs `event-reducer.ts` to update `game-store`. Single place for all realtime wiring — avoids scattering Ably code across features.

### `src/features/profile/` and `admin/`

Registered-user and operator interfaces. Both read heavily from repositories; minimal domain logic. Admin writes go through `admin.service.ts` with audit logging.

---

### `src/infrastructure/db/repositories/`

One repository per aggregate root (Room, Game, User). Repositories:

- Execute Prisma queries
- Map DB documents → domain entities / DTOs via `mappers/`
- Handle optimistic locking (`version` field)
- Throw `AppError` on not found

No business rules — a repository never decides if a turn is valid.

### `src/infrastructure/db/mappers/`

Translates Prisma types to domain/DTO shapes. Keeps Prisma imports out of `domain/` and `features/services/`. When schema changes, update mappers only.

### `src/infrastructure/auth/`

Better Auth configuration and guest JWT utilities. `session.ts` exports `getSession()`, `requirePlayerSession()`, `requireHost()` used by actions and route handlers.

### `src/infrastructure/realtime/`

Server-side Ably REST client for publishing events after DB writes. `event-publisher.ts` enforces typed event envelopes (Document 10). Client-side Ably factory in `ably.client.ts` consumed by `features/realtime/`.

### `src/infrastructure/storage/`

Cloudinary upload/delete. Called by `submit-drawing.action.ts`. Returns CDN URL stored in game turn embed.

### `src/infrastructure/cache/`

Rate limiting via Upstash. Used in middleware and route handlers. Config values from `rate-limit.config.ts`.

### `src/infrastructure/monitoring/`

Pino logger with redaction, Sentry client/server init, `request-context.ts` for correlation IDs. Every service receives logger via constructor or context.

---

### `src/shared/ui/`

Design system built on shadcn/ui. All shadcn primitives live here — features import `@/shared/ui/button`, never install shadcn into feature folders. `layout/` and `motion/` subfolders organize custom shared components from Phase 1 component inventory.

### `src/shared/lib/`

Utilities used across features. `errors/` implements Document 17. `authorize.ts` centralizes permission checks. No feature-specific logic.

### `src/shared/config/`

Single source of truth for numeric constants, env validation, theme reference. **Nothing hardcoded in components** — always import from config.

### `src/shared/constants/copy/`

All user-facing strings. Organized by feature area for future i18n extraction. Error messages reference `copy/errors.ts`.

### `src/shared/providers/`

React provider composition. `AppProviders.tsx` wraps Query, Theme, Toast, Realtime (M4), Sentry error boundary. Used once in `app/layout.tsx`.

---

## File Count Summary

| Area | Approx. files (MVP) |
|------|---------------------|
| `app/` routes | ~35 |
| `features/` | ~120 |
| `domain/` | ~15 |
| `infrastructure/` | ~25 |
| `shared/` | ~60 |
| `tests/` | ~20 |
| **Total src/** | **~255** |

---

## Quick Reference: "Where does X go?"

| I need to add… | Location |
|----------------|----------|
| New page | `app/(group)/path/page.tsx` + feature component |
| Form validation schema | `features/[f]/schemas/` |
| DB query | `infrastructure/db/repositories/` |
| Business rule | `domain/[context]/` |
| Ably event handler | `features/realtime/lib/event-reducer.ts` |
| UI button variant | `shared/ui/button.tsx` |
| Timer duration constant | `shared/config/game.config.ts` |
| User-facing string | `shared/constants/copy/` |
| Server mutation from UI | `features/[f]/actions/` |
| Public REST endpoint | `app/api/` |
| Unit test | Adjacent `*.test.ts` |
| E2E test | `tests/e2e/` |

---

## Related Documents

- Overview & dependency rules: [01-folder-architecture-overview.md](./01-folder-architecture-overview.md)
- Component mapping: [../phase-1/04-component-inventory.md](../phase-1/04-component-inventory.md)
- API routes: [../phase-0/09-api-design.md](../phase-0/09-api-design.md)
