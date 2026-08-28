# Document 18 — Logging Strategy

## Overview

InkEcho uses **Pino** for structured JSON logging on the server. Logs support debugging, audit trails, and correlation with Sentry errors. No sensitive data is logged.

---

## Logging Principles

| Principle | Implementation |
|-----------|----------------|
| Structured | JSON logs with consistent fields |
| Correlated | `correlationId` on every log line |
| Leveled | debug / info / warn / error / fatal |
| Safe | PII and secrets redacted |
| Actionable | Include context, not stack dumps at info level |
| Minimal client logs | Client errors → Sentry; console stripped in prod |

---

## Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| `debug` | Dev troubleshooting | Query parameters, cache hits |
| `info` | Business events | Room created, game started, turn submitted |
| `warn` | Recoverable issues | Rate limit hit, version conflict, retry |
| `error` | Failures | Unhandled exceptions, external service fail |
| `fatal` | Process-level | Startup failure (missing env) |

**Production default:** `info`  
**Development default:** `debug`

---

## Standard Log Fields

```typescript
interface LogContext {
  correlationId: string;
  userId?: string;
  guestSessionId?: string;
  playerId?: string;
  roomId?: string;
  roomCode?: string;
  gameId?: string;
  action?: string;
  durationMs?: number;
  version?: number;
}
```

### Example Log Lines

```json
{
  "level": "info",
  "time": 1693238400000,
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "action": "room.created",
  "roomId": "65f...",
  "roomCode": "ABC123",
  "playerId": "uuid",
  "visibility": "PRIVATE",
  "msg": "Room created"
}

{
  "level": "warn",
  "time": 1693238401000,
  "correlationId": "...",
  "action": "game.submit_conflict",
  "gameId": "65f...",
  "expectedVersion": 42,
  "actualVersion": 43,
  "msg": "Version conflict on turn submit"
}
```

---

## What to Log

### Business Events (info)

| Event | Fields |
|-------|--------|
| `room.created` | roomId, roomCode, visibility, hostPlayerId |
| `room.joined` | roomId, playerId, role |
| `room.left` | roomId, playerId |
| `room.closed` | roomId, reason |
| `game.started` | gameId, roomId, playerCount, chainCount |
| `game.turn_submitted` | gameId, phase, chainIndex, turnIndex, autoSubmitted |
| `game.completed` | gameId, durationMs |
| `game.reveal_started` | gameId |
| `auth.sign_in` | userId, provider |
| `auth.sign_out` | userId |
| `report.created` | reportId, targetType, gameId |

### Warnings (warn)

| Event | Fields |
|-------|--------|
| `rate_limit.exceeded` | key, limit, window |
| `game.invalid_transition` | fromState, event, playerId |
| `ably.publish_retry` | channel, attempt |
| `reconnect.grace_expired` | playerId, gameId |

### Errors (error)

| Event | Fields |
|-------|--------|
| `db.query_failed` | operation, err |
| `ably.publish_failed` | channel, err |
| `cloudinary.upload_failed` | err |
| `unhandled_exception` | err, stack |

---

## What NOT to Log

| Never Log | Reason |
|-----------|--------|
| Passwords / tokens | Security |
| Full session cookies | Security |
| Email addresses (production) | PII — hash or omit |
| Full description text | Privacy — log length only |
| Drawing binary data | Size/noise — log URL only |
| `DATABASE_URL` | Secret — Pino redact |

---

## Logger Setup

```typescript
// infrastructure/monitoring/logger.ts

import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'secret',
      '*.password',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
  ...(process.env.NODE_ENV === 'development' && {
    transport: { target: 'pino-pretty' },
  }),
});

export function createRequestLogger(correlationId: string) {
  return logger.child({ correlationId });
}
```

---

## Middleware Integration

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const correlationId =
    request.headers.get('x-correlation-id') ?? crypto.randomUUID();

  const response = NextResponse.next();
  response.headers.set('x-correlation-id', correlationId);
  return response;
}
```

Server Actions read correlation ID from headers or generate child logger.

---

## Request Lifecycle Logging

```
1. [info]  request.start     method, path, correlationId
2. [debug] auth.resolved     userId | guestSessionId | anonymous
3. [info]  action.executed  action name, durationMs, success
4. [info]  request.end      statusCode, durationMs
```

Duration measured via `performance.now()` wrapper.

---

## Sentry Integration

| Log Level | Sentry Action |
|-----------|---------------|
| `error` | `Sentry.captureException` |
| `warn` (specific) | Breadcrumb only |
| `info` (business) | Breadcrumb for game events |
| `fatal` | `captureException` + flush |

```typescript
Sentry.setContext('game', { gameId, roomId, version });
Sentry.setTag('correlationId', correlationId);
```

Duplicate: don't send same error to Pino and Sentry twice — error handler decides.

---

## Client-Side Logging

| Environment | Behavior |
|-------------|----------|
| Development | `console.debug` allowed |
| Production | Strip console; Sentry for errors |
| Realtime debug | `NEXT_PUBLIC_DEBUG_REALTIME=true` flag (dev only) |

```typescript
// shared/lib/client-logger.ts
export const clientLog = {
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') console.debug(...args);
  },
  error: (error: Error, context?: Record<string, unknown>) => {
    Sentry.captureException(error, { extra: context });
  },
};
```

---

## Audit Trail

Admin actions logged at `info` with extended context:

```json
{
  "action": "admin.user_banned",
  "adminUserId": "...",
  "targetUserId": "...",
  "durationHours": 72,
  "reason": "..."
}
```

Reports and bans are audit-critical — never delete logs ( rely on Vercel log drain retention).

---

## Log Aggregation

| Environment | Destination |
|-------------|-------------|
| Development | Terminal (pino-pretty) |
| Production | Vercel Log Drain → Axiom / Datadog (optional) |
| Long-term | 30-day retention minimum |

---

## Performance Logging

Slow operations logged at `warn`:

```typescript
const SLOW_THRESHOLD_MS = 500;

if (durationMs > SLOW_THRESHOLD_MS) {
  logger.warn({ ...ctx, durationMs, action: 'slow_operation' }, 'Slow DB query');
}
```

---

## Related Documents

- Error handling: Document 17
- Environment: Document 16
- Monitoring: Document 14, 15
