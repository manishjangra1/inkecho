# Document 13 — Security Design

## Overview

InkEcho handles user-generated content (text + drawings), realtime channels, and guest sessions. Security follows **defense in depth**: validate at every boundary, least privilege, server authority.

---

## Threat Model

| Threat | Impact | Mitigation |
|--------|--------|------------|
| Unauthorized room access | Data leak, griefing | Session + membership checks |
| Game state manipulation | Cheating | Server-authoritative transitions |
| XSS via descriptions | Account compromise | Output encoding, CSP, sanitization |
| CSRF on mutations | Unauthorized actions | SameSite cookies, CSRF tokens |
| Replay attacks | Duplicate submits | Version + idempotency keys |
| Ably token theft | Channel snooping | Short TTL, scoped capabilities |
| Rate abuse | DoS, spam | Rate limiting |
| NSFW/abusive content | User harm | Reporting, bans, moderation |
| Drawing malware | Server compromise | MIME validation, Cloudinary sandbox |

---

## Authentication & Authorization

### Session Management

| Aspect | Implementation |
|--------|----------------|
| Registered users | Better Auth httpOnly secure cookies |
| Guest users | Signed JWT in httpOnly cookie (`ink_player_session`) |
| Cookie flags | `Secure`, `SameSite=Lax`, `HttpOnly` |
| Session TTL | 30 days (registered), 24h (guest) |
| Rotation | Refresh on privilege change |

### Authorization Matrix

| Action | Guest | Player | Host | Spectator | Admin |
|--------|-------|--------|------|-----------|-------|
| Create room | ✓ | ✓ | — | — | ✓ |
| Join room | ✓ | ✓ | — | ✓ | ✓ |
| Update settings | — | — | ✓ | — | ✓ |
| Kick player | — | — | ✓ | — | ✓ |
| Start game | — | — | ✓ | — | ✓ |
| Submit turn | — | ✓ (own turn) | ✓ (own turn) | — | — |
| View hidden content | — | — | — | — | — |
| Ban users | — | — | — | — | ✓ |

Every Server Action / Route Handler calls `authorize(context, permission)` before domain logic.

---

## Input Validation

| Layer | Tool | Scope |
|-------|------|-------|
| API boundary | Zod schemas | All inputs |
| Domain | Business rules | State transitions |
| DB | Prisma types | Schema enforcement |

### Validation Rules

```
displayName: 3–20 chars, regex /^[\w\s-]+$/, profanity check optional
description: 1–200 chars, trimmed, HTML stripped
roomCode: /^[A-Z0-9]{6}$/
drawing: image/png|webp, max 2MB, magic byte check
settings: numeric ranges enforced server-side
```

**Never trust client** for timers, turn order, or role assignment.

---

## XSS Prevention

| Vector | Mitigation |
|--------|------------|
| Description text | Strip HTML; React auto-escapes on render |
| Display names | Same sanitization |
| Drawing URLs | Only allow Cloudinary domain whitelist |
| CSP | Strict Content-Security-Policy header |

### Content-Security-Policy (Production)

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' (Next.js required);
style-src 'self' 'unsafe-inline';
img-src 'self' data: https://res.cloudinary.com;
connect-src 'self' https://*.ably.io wss://*.ably.io https://*.sentry.io;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

Review and tighten `unsafe-inline/eval` with Next.js nonce strategy post-MVP.

---

## CSRF Prevention

| Mechanism | Application |
|-----------|-------------|
| SameSite=Lax cookies | Default for session |
| Server Actions | Built-in origin check (Next.js) |
| Route Handlers | Verify `Origin`/`Referer` for mutations |
| Double-submit cookie | Optional for sensitive admin routes |

---

## Replay Attack Prevention

| Attack | Mitigation |
|--------|------------|
| Duplicate turn submit | `expectedVersion` optimistic lock; idempotent response |
| Replayed API request | Short-lived nonce optional; version check sufficient for MVP |
| Stale Ably events | Client ignores `version <= localVersion` |

```typescript
// Idempotent submit pattern
if (turn.status === 'SUBMITTED') {
  return { success: true, version: game.version }; // no-op
}
```

---

## Rate Limiting

Implemented via **Upstash Redis** or **Vercel KV** sliding window.

| Endpoint / Action | Limit | Key |
|-------------------|-------|-----|
| Room create | 5/hour | userId or IP |
| Guest session | 10/hour | IP |
| Join room | 20/hour | IP |
| Turn submit | 30/min | playerId |
| Report | 5/hour | userId |
| Auth login | 10/15min | IP + email |
| Public room list | 60/min | IP |

**Response:** `429 Too Many Requests` with `Retry-After` header.

---

## Room Security

| Concern | Mitigation |
|---------|------------|
| Room code guessing | 6 alphanumeric = 2.1B combos; rate limit joins |
| Private room access | Code required; not listed publicly |
| Mid-game join as player | Blocked; spectator only |
| Host impersonation | hostPlayerId validated server-side |
| Kick evasion | Kicked playerId blocklist on room for session |

---

## Ably Token Auth

```
1. Client never receives Ably API key
2. GET /api/realtime/token?roomId=X
3. Server verifies session + room membership
4. Issues token with capabilities:
   { "room:{roomId}": ["subscribe", "presence"] }
5. Token TTL: 1 hour; auto-refresh at 55 min
6. Publish capability: SERVER ONLY (API key on server)
```

### Channel Isolation

- No wildcard subscribe
- Token scoped to single room
- Room ID is ObjectId (not guessable code) in channel name

---

## Data Protection

| Data | Classification | Handling |
|------|----------------|----------|
| Email | PII | Encrypted at rest (Atlas), not logged |
| Display name | Low sensitivity | Logged |
| Drawings | User content | Cloudinary; reported content flagged |
| IP address | PII | Rate limit keys only; not stored long-term |
| Session tokens | Secret | httpOnly; never in logs |

### GDPR Considerations

- Account deletion → soft delete user, anonymize history option
- Data export on request (post-MVP)
- Cookie consent for analytics (post-MVP)

---

## Dependency Security

| Practice | Tool |
|----------|------|
| Dependency audit | `npm audit`, Dependabot |
| Lock file | Committed `package-lock.json` |
| Secret scanning | GitHub secret scanning |
| Env vars | Never in repo; Vercel env management |

---

## Moderation & Abuse

| Feature | Implementation |
|---------|----------------|
| Report flow | FR-12.1, Report collection |
| Auto-flag | Keyword list for descriptions (optional) |
| Ban system | `bannedUntil`, `bannedPermanently` on User |
| Kick | Immediate removal + session invalidation for room |
| Drawing review | Admin queue with Cloudinary URL |

---

## Security Headers (Next.js Middleware)

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Incident Response

| Severity | Response |
|----------|----------|
| P0 (data breach) | Rotate secrets, notify users within 72h |
| P1 (Ably key leak) | Rotate Ably key, invalidate tokens |
| P2 (spam wave) | Tighten rate limits, enable CAPTCHA |
| P3 (single report) | Manual review queue |

---

## Security Checklist (Pre-Launch)

- [ ] All Route Handlers have auth + validation
- [ ] Ably publish restricted to server
- [ ] CSP configured and tested
- [ ] Rate limits enabled in production
- [ ] Secrets in Vercel env only
- [ ] HTTPS enforced
- [ ] OWASP ZAP scan passed
- [ ] Dependency audit clean (no critical)
- [ ] Admin routes protected by role check
- [ ] Cloudinary upload preset restricted (unsigned disabled)

---

## Related Documents

- API auth: Document 9
- Error handling: Document 17
- Environment variables: Document 16
