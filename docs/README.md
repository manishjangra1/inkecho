# InkEcho Documentation

Production design documentation for InkEcho — a multiplayer realtime party game where players alternately draw and describe prompts.

## Milestones

| Milestone | Scope | Status |
|-----------|-------|--------|
| **M1** | Documentation & architecture (Phase 0–7) | **Complete** |
| **M2** | Project setup, tooling, shared infrastructure | **Complete** |
| **M3** | Authentication & room/lobby system | **Complete** |
| **M4** | Game engine & Ably realtime synchronization | **Complete** |
| **M5** | Canvas & drawing features | Pending |
| **M6** | Polish, animations, testing, optimization, deployment | Pending |

## Phase 0 — Design Documents

| # | Document | File |
|---|----------|------|
| 1 | Project Vision | [01-project-vision.md](./phase-0/01-project-vision.md) |
| 2 | Functional Requirements | [02-functional-requirements.md](./phase-0/02-functional-requirements.md) |
| 3 | Non-Functional Requirements | [03-non-functional-requirements.md](./phase-0/03-non-functional-requirements.md) |
| 4 | User Stories | [04-user-stories.md](./phase-0/04-user-stories.md) |
| 5 | Acceptance Criteria | [05-acceptance-criteria.md](./phase-0/05-acceptance-criteria.md) |
| 6 | System Architecture | [06-system-architecture.md](./phase-0/06-system-architecture.md) |
| 7 | Database Design | [07-database-design.md](./phase-0/07-database-design.md) |
| 8 | ER Diagram | [08-er-diagram.md](./phase-0/08-er-diagram.md) |
| 9 | API Design | [09-api-design.md](./phase-0/09-api-design.md) |
| 10 | Realtime Events | [10-realtime-events.md](./phase-0/10-realtime-events.md) |
| 11 | Game State Machine | [11-game-state-machine.md](./phase-0/11-game-state-machine.md) |
| 12 | Drawing Canvas Design | [12-drawing-canvas-design.md](./phase-0/12-drawing-canvas-design.md) |
| 13 | Security Design | [13-security-design.md](./phase-0/13-security-design.md) |
| 14 | Performance Design | [14-performance-design.md](./phase-0/14-performance-design.md) |
| 15 | Deployment Architecture | [15-deployment-architecture.md](./phase-0/15-deployment-architecture.md) |
| 16 | Environment Variables | [16-environment-variables.md](./phase-0/16-environment-variables.md) |
| 17 | Error Handling Strategy | [17-error-handling-strategy.md](./phase-0/17-error-handling-strategy.md) |
| 18 | Logging Strategy | [18-logging-strategy.md](./phase-0/18-logging-strategy.md) |
| 19 | Testing Strategy | [19-testing-strategy.md](./phase-0/19-testing-strategy.md) |
| 20 | Coding Standards | [20-coding-standards.md](./phase-0/20-coding-standards.md) |

## Phase 1 — UI Design (No Code)

| # | Document | File |
|---|----------|------|
| 1 | Sitemap & Navigation | [01-sitemap-and-navigation.md](./phase-1/01-sitemap-and-navigation.md) |
| 2 | User Flows | [02-user-flows.md](./phase-1/02-user-flows.md) |
| 3 | Wireframes | [03-wireframes.md](./phase-1/03-wireframes.md) |
| 4 | Component Inventory | [04-component-inventory.md](./phase-1/04-component-inventory.md) |
| 5 | Design Tokens | [05-design-tokens.md](./phase-1/05-design-tokens.md) |
| 6 | Animation System | [06-animation-system.md](./phase-1/06-animation-system.md) |
| 7 | Responsive Rules | [07-responsive-rules.md](./phase-1/07-responsive-rules.md) |

## Phase 2 — Folder Architecture (No Code)

| # | Document | File |
|---|----------|------|
| 1 | Architecture Overview | [01-folder-architecture-overview.md](./phase-2/01-folder-architecture-overview.md) |
| 2 | Complete Folder Tree | [02-complete-folder-tree.md](./phase-2/02-complete-folder-tree.md) |

## Phase 3 — Database Schema

| # | Document | File |
|---|----------|------|
| 1 | Schema Review & Improvements | [01-schema-review-and-improvements.md](./phase-3/01-schema-review-and-improvements.md) |
| 2 | Prisma Schema Reference | [02-prisma-schema-reference.md](./phase-3/02-prisma-schema-reference.md) |
| — | Prisma schema | [`../prisma/schema.prisma`](../prisma/schema.prisma) |
| — | Seed script | [`../prisma/seed.ts`](../prisma/seed.ts) |

## Phase 4 — Authentication Design

| # | Document | File |
|---|----------|------|
| 1 | Authentication Architecture | [01-authentication-architecture.md](./phase-4/01-authentication-architecture.md) |
| 2 | Authentication Flows | [02-authentication-flows.md](./phase-4/02-authentication-flows.md) |
| 3 | Session Recovery & Reconnect | [03-session-recovery.md](./phase-4/03-session-recovery.md) |

## Phase 5 — Realtime Architecture

| # | Document | File |
|---|----------|------|
| 1 | Realtime Architecture Overview | [01-realtime-architecture-overview.md](./phase-5/01-realtime-architecture-overview.md) |
| 2 | Synchronization & Conflict Resolution | [02-synchronization-and-conflict-resolution.md](./phase-5/02-synchronization-and-conflict-resolution.md) |
| 3 | Disconnect, Reconnect & Offline | [03-disconnect-reconnect-offline.md](./phase-5/03-disconnect-reconnect-offline.md) |

## Phase 6 — Backend Architecture

| # | Document | File |
|---|----------|------|
| 1 | Backend Architecture Overview | [01-backend-architecture-overview.md](./phase-6/01-backend-architecture-overview.md) |
| 2 | Repositories & Mappers | [02-repositories-and-mappers.md](./phase-6/02-repositories-and-mappers.md) |
| 3 | Application Services | [03-application-services.md](./phase-6/03-application-services.md) |
| 4 | Controllers, DTOs & Validation | [04-controllers-dtos-validation.md](./phase-6/04-controllers-dtos-validation.md) |
| 5 | Middleware & Error Handling | [05-middleware-and-errors.md](./phase-6/05-middleware-and-errors.md) |

## Phase 7 — API Contracts

| # | Document | File |
|---|----------|------|
| 1 | API Contract Overview | [01-api-contract-overview.md](./phase-7/01-api-contract-overview.md) |
| 2 | REST API Contracts | [02-rest-api-contracts.md](./phase-7/02-rest-api-contracts.md) |
| 3 | Server Actions Contracts | [03-server-actions-contracts.md](./phase-7/03-server-actions-contracts.md) |
| — | OpenAPI 3.1 spec | [openapi.yaml](./phase-7/openapi.yaml) |

## Review Workflow

1. Phase 0–6: ✓ Approved
2. Phase 7: API contracts. ✓ Complete
3. **Milestone 1 complete** — ready for **Milestone 2** (project setup & code)

## Implementation

Use **[IMPLEMENTATION-MASTER-PROMPT.md](./IMPLEMENTATION-MASTER-PROMPT.md)** for every coding session. Paste the base prompt + milestone addendum + your feature command.

## Tech Stack Summary

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui, Framer Motion, TanStack Query, Zustand
- **Backend:** Next.js Route Handlers, Server Actions, Prisma, MongoDB
- **Realtime:** Ably
- **Auth:** Better Auth
- **Storage:** Cloudinary
- **Deploy:** Vercel + MongoDB Atlas
