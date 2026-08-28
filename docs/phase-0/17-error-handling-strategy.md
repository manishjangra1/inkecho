# Document 17 — Error Handling Strategy

## Overview

InkEcho uses a **structured error hierarchy** with consistent client/server handling, user-friendly messages, and full observability. Errors never expose internal details to users in production.

---

## Error Hierarchy

```typescript
// shared/lib/errors/app-error.ts

abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  readonly isOperational = true;
  constructor(
    message: string,
    readonly context?: Record<string, unknown>,
  ) {
    super(message);
  }
}

class ValidationError extends AppError {
  code = 'VALIDATION_ERROR';
  statusCode = 400;
}

class UnauthorizedError extends AppError {
  code = 'UNAUTHORIZED';
  statusCode = 401;
}

class ForbiddenError extends AppError {
  code = 'FORBIDDEN';
  statusCode = 403;
}

class NotFoundError extends AppError {
  code = 'NOT_FOUND';
  statusCode = 404;
}

class ConflictError extends AppError {
  code = 'CONFLICT';
  statusCode = 409;
}

class RateLimitError extends AppError {
  code = 'RATE_LIMITED';
  statusCode = 429;
}

class GameStateError extends AppError {
  code = 'INVALID_GAME_TRANSITION';
  statusCode = 409;
}

class ExternalServiceError extends AppError {
  code = 'EXTERNAL_SERVICE_ERROR';
  statusCode = 502;
  readonly isOperational = false;
}
```

---

## Error Code Catalog

| Code | HTTP | User Message | When |
|------|------|--------------|------|
| `VALIDATION_ERROR` | 400 | "Please check your input." | Zod / business validation |
| `UNAUTHORIZED` | 401 | "Please sign in to continue." | Missing session |
| `FORBIDDEN` | 403 | "You don't have permission." | Role check failed |
| `NOT_FOUND` | 404 | "Not found." | Room/game/user missing |
| `ROOM_NOT_FOUND` | 404 | "Room not found." | Invalid room code |
| `ROOM_FULL` | 403 | "Room is full." | Max players reached |
| `NOT_HOST` | 403 | "Only the host can do that." | Host-only action |
| `NOT_YOUR_TURN` | 403 | "It's not your turn." | Wrong player submitted |
| `GAME_ALREADY_STARTED` | 409 | "Game already in progress." | Double start |
| `VERSION_CONFLICT` | 409 | "State updated. Syncing…" | Optimistic lock fail |
| `INVALID_GAME_TRANSITION` | 409 | "Action not allowed right now." | State machine reject |
| `RATE_LIMITED` | 429 | "Too many requests. Try again soon." | Rate limit |
| `BANNED` | 403 | "Account suspended." | Banned user |
| `FILE_TOO_LARGE` | 413 | "Drawing file too large." | Upload limit |
| `EXTERNAL_SERVICE_ERROR` | 502 | "Service temporarily unavailable." | Ably/Cloudinary/DB |
| `INTERNAL_ERROR` | 500 | "Something went wrong. Try again." | Unexpected |

---

## Server-Side Handling

### Route Handlers & Server Actions

```typescript
// shared/lib/errors/handle-action-error.ts

export function handleActionError(error: unknown, correlationId: string) {
  if (error instanceof AppError) {
    logger.warn({ err: error, correlationId }, error.code);
    return {
      success: false as const,
      error: {
        code: error.code,
        message: error.message,
        correlationId,
      },
    };
  }

  // Unexpected error
  logger.error({ err: error, correlationId }, 'Unhandled error');
  Sentry.captureException(error, { tags: { correlationId } });

  return {
    success: false as const,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong. Try again.',
      correlationId,
    },
  };
}
```

### Domain Layer

- Domain functions return `Result<T, AppError>` — never throw
- Application layer translates Result → HTTP/Action response
- Infrastructure layer wraps external failures in `ExternalServiceError`

```typescript
type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

---

## Client-Side Handling

### Server Action Response

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorPayload };
```

### UI Error Display

| Severity | UI Component | Example |
|----------|--------------|---------|
| Validation | Inline field error | "Name must be 3+ characters" |
| Action failure | Toast (destructive) | "Room is full" |
| Recoverable sync | Toast + auto-retry | "Syncing…" |
| Fatal | Error boundary | "Something went wrong" |
| Network | Banner | "Reconnecting…" |

### TanStack Query

```typescript
useQuery({
  queryKey: ['room', code],
  queryFn: fetchRoom,
  retry: (count, error) => {
    if (error.statusCode === 404) return false;
    return count < 3;
  },
});
```

### Optimistic Update Rollback

```typescript
onMutate: async (vars) => {
  await queryClient.cancelQueries({ queryKey });
  const previous = queryClient.getQueryData(queryKey);
  queryClient.setQueryData(queryKey, optimistic);
  return { previous };
},
onError: (err, vars, context) => {
  queryClient.setQueryData(queryKey, context.previous);
  toast.error(mapErrorCode(err.code));
},
```

---

## Realtime Error Handling

| Scenario | Client Behavior |
|----------|-----------------|
| Ably disconnect | Show banner; exponential backoff reconnect |
| Version gap | Fetch full snapshot via GET /game |
| Unknown event | Log warning; fetch snapshot if version ahead |
| `room_closed` event | Toast + redirect to home |
| Token expiry | Silent token refresh via /api/realtime/token |

---

## Correlation IDs

```
1. Middleware generates UUID → X-Correlation-Id header
2. Passed to all log statements
3. Returned in error responses
4. Client displays in error toast (dev mode) or support copy
5. Sentry tags include correlationId
```

---

## Error Boundaries

| Boundary | Scope | Fallback |
|----------|-------|----------|
| Root | App shell | Full-page error + retry |
| Game | `/room/[code]/game` | "Game error" + rejoin button |
| Canvas | DrawingCanvas | "Canvas failed" + reload turn |
| Profile | `/profile/*` | Section error card |

```typescript
// shared/components/ErrorBoundary.tsx
// Uses react-error-boundary with Sentry integration
```

---

## External Service Failures

| Service | Failure Mode | Fallback |
|---------|--------------|----------|
| MongoDB | Connection timeout | 502 + retry; Sentry alert |
| Ably publish | REST failure | Retry 3x; if fail, log critical (clients poll snapshot) |
| Cloudinary upload | Upload fail | Return error; client retries submit |
| Upstash (rate limit) | Unavailable | Fail open with logging (configurable fail-closed for auth) |

---

## Validation Error Detail

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check your input.",
    "details": [
      { "field": "displayName", "message": "Must be at least 3 characters" }
    ],
    "correlationId": "..."
  }
}
```

React Hook Form maps `details` to field errors.

---

## Production vs Development

| Aspect | Development | Production |
|--------|-------------|------------|
| Error message | Full stack in console | Generic user message |
| Sentry | Disabled or dev project | Enabled |
| Correlation ID | Shown in toast | Hidden (logged only) |
| Domain errors | Logged at warn | Logged at warn |
| Unexpected errors | Throw in dev (optional) | Captured + 500 |

---

## Testing Errors

| Test | Tool |
|------|------|
| Error code mapping | Vitest unit |
| 404 room join | Playwright |
| Version conflict | Integration test |
| Error boundary render | Vitest + RTL |
| Sentry capture | Mock in test |

---

## Related Documents

- API errors: Document 9
- Logging: Document 18
- Security: Document 13
