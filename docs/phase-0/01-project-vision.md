# Document 1 — Project Vision

## Executive Summary

**InkEcho** is a multiplayer realtime party game inspired by the "telephone" mechanic: players alternately **describe** a prompt and **draw** what they read, passing work around the room until a hilarious chain emerges at the end. The product is designed as a portfolio-grade demonstration of modern full-stack architecture, realtime synchronization, state machines, and polished UX.

## Problem Statement

Party games that work instantly in a browser — without installs, accounts, or friction — are rare. Existing alternatives often feel dated, lack reconnect resilience, or break on mobile. InkEcho solves this by offering a **zero-friction join flow**, **production-quality realtime**, and a **premium SaaS-meets-gaming aesthetic**.

## Vision Statement

> Create the most polished browser-based draw-and-guess party game — where joining a room takes seconds, gameplay stays in sync under real network conditions, and the reveal moment feels like a shared event.

## Target Audience

| Segment | Needs |
|---------|-------|
| **Casual players** | Quick join, fun rounds, mobile-friendly |
| **Friend groups** | Private rooms, invite links, no account required |
| **Registered users** | Profiles, stats, history, achievements |
| **Spectators** | Watch without playing, share moments |
| **Hosts** | Room control, kick, settings, timers |
| **Admins** | Moderation, analytics, abuse handling |

## Core Value Propositions

1. **Instant play** — Guest join with a nickname; optional account for persistence.
2. **Reliable realtime** — Ably-backed sync with reconnect and conflict resolution.
3. **Beautiful experience** — Dark-first UI, motion, responsive canvas, reveal animations.
4. **Architectural clarity** — Feature-based Clean Architecture suitable for team scale.
5. **Production readiness** — Auth, security, logging, monitoring, testing, deployment.

## Game Concept

### Loop

```
Player A writes prompt → Player B draws it → Player C describes the drawing → Player D draws that description → … → Reveal chain
```

### Modes (Future-Ready)

| Mode | Description |
|------|-------------|
| **Classic Chain** | Full room participates; one chain per round set |
| **Speed Round** | Shorter timers, smaller canvas |
| **Custom Prompts** | Host supplies starting prompts |

*MVP focuses on Classic Chain.*

## Product Principles

| Principle | Implication |
|-----------|-------------|
| **Mobile-first responsive** | Touch canvas, readable timers, thumb-friendly controls |
| **Fail gracefully** | Disconnect → reconnect → resume or spectate |
| **Server authoritative** | Client optimistically updates; server validates transitions |
| **No magic strings** | Constants, enums, config for durations, colors, copy |
| **Accessibility** | WCAG 2.1 AA targets for core flows |
| **Privacy by design** | Minimal PII; guest sessions ephemeral |

## Success Metrics

| Metric | Target (MVP) |
|--------|--------------|
| Time to first game | < 60 seconds from landing |
| Room join success rate | > 99% |
| Reconnect recovery rate | > 95% within 30s disconnect |
| P95 round sync latency | < 500ms |
| Mobile usability score | Lighthouse accessibility ≥ 90 |
| Crash-free sessions | > 99.5% (Sentry) |

## Scope Boundaries

### In Scope (MVP)

- Public & private rooms
- Guest & registered players
- Lobby (ready, kick, leave)
- Full game loop with timers
- Drawing canvas (brush, undo/redo, touch)
- Realtime sync via Ably
- Reveal animations
- Spectator mode
- Basic profile & game history
- Admin moderation basics

### Out of Scope (MVP)

- Voice chat
- Native mobile apps
- Monetization / payments
- AI-generated prompts
- Custom avatars marketplace
- Tournament brackets

## Competitive Positioning

InkEcho differentiates through **engineering quality** and **UX polish**, not feature breadth. It is intentionally built to showcase:

- Realtime multiplayer architecture
- State machine-driven game engine
- Canvas performance on mobile
- Clean feature-based codebase
- Enterprise patterns (repos, services, DTOs, validation)

## Long-Term Roadmap (Post-MVP)

1. **Season 1** — Achievements, badges, shareable reveal clips
2. **Season 2** — Custom themes, room templates, scheduled events
3. **Season 3** — API for embeddable rooms, white-label for communities
4. **Season 4** — Ranked modes, seasonal leaderboards

## Stakeholder Alignment

| Stakeholder | Primary Goal |
|-------------|----------------|
| **Players** | Fun, low friction, works on phone |
| **Host** | Control, stability, easy invites |
| **Developer (portfolio)** | Demonstrates architecture & realtime skills |
| **Operator** | Observable, secure, deployable on Vercel |

## Approval Gate

Phase 1 (UI design) must not begin until this vision and all Phase 0 documents are reviewed and approved.
