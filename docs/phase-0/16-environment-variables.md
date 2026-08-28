# Document 16 — Environment Variables

## Overview

All secrets and environment-specific configuration are loaded from environment variables. **No secrets in source code.** Client-exposed variables use `NEXT_PUBLIC_` prefix.

Configuration constants (timers, limits) live in `shared/config/` and may be overridden by env where noted.

---

## Variable Reference

### Application

| Variable | Required | Client | Description | Example |
|----------|----------|--------|-------------|---------|
| `NODE_ENV` | ✓ | No | Runtime environment | `production` |
| `NEXT_PUBLIC_APP_URL` | ✓ | Yes | Canonical app URL | `https://inkecho.app` |
| `NEXT_PUBLIC_APP_NAME` | ✓ | Yes | Display name | `InkEcho` |

---

### Database

| Variable | Required | Client | Description | Example |
|----------|----------|--------|-------------|---------|
| `DATABASE_URL` | ✓ | No | MongoDB connection string | `mongodb+srv://...` |

---

### Authentication (Better Auth)

| Variable | Required | Client | Description | Example |
|----------|----------|--------|-------------|---------|
| `BETTER_AUTH_SECRET` | ✓ | No | Session signing secret (32+ bytes) | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | ✓ | No | Auth base URL | `https://inkecho.app` |
| `GOOGLE_CLIENT_ID` | OAuth | No | Google OAuth client ID | — |
| `GOOGLE_CLIENT_SECRET` | OAuth | No | Google OAuth secret | — |
| `GITHUB_CLIENT_ID` | OAuth | No | GitHub OAuth client ID | — |
| `GITHUB_CLIENT_SECRET` | OAuth | No | GitHub OAuth secret | — |

---

### Guest Sessions

| Variable | Required | Client | Description | Example |
|----------|----------|--------|-------------|---------|
| `GUEST_SESSION_SECRET` | ✓ | No | JWT signing secret for guest tokens | `openssl rand -base64 32` |
| `GUEST_SESSION_TTL_HOURS` | | No | Guest session expiry | `24` |

---

### Ably Realtime

| Variable | Required | Client | Description | Example |
|----------|----------|--------|-------------|---------|
| `ABLY_API_KEY` | ✓ | No | Server-side root API key (publish) | `xxx:yyy` |
| `NEXT_PUBLIC_ABLY_CLIENT_KEY` | | Yes | Subset key subscribe-only (optional) | Prefer token auth |
| `ABLY_TOKEN_TTL_SECONDS` | | No | Token lifetime | `3600` |

**Note:** Prefer server-issued token auth (Document 13). Do not expose root API key to client.

---

### Cloudinary

| Variable | Required | Client | Description | Example |
|----------|----------|--------|-------------|---------|
| `CLOUDINARY_CLOUD_NAME` | ✓ | No | Cloud name | `inkecho` |
| `CLOUDINARY_API_KEY` | ✓ | No | API key | — |
| `CLOUDINARY_API_SECRET` | ✓ | No | API secret | — |
| `CLOUDINARY_UPLOAD_FOLDER` | | No | Upload folder prefix | `inkecho/production/drawings` |

---

### Monitoring & Logging

| Variable | Required | Client | Description | Example |
|----------|----------|--------|-------------|---------|
| `SENTRY_DSN` | ✓ | No | Sentry server DSN | `https://...@sentry.io/...` |
| `NEXT_PUBLIC_SENTRY_DSN` | ✓ | Yes | Sentry client DSN | Same project |
| `SENTRY_AUTH_TOKEN` | CI | No | Source map upload | — |
| `SENTRY_ORG` | CI | No | Sentry org slug | — |
| `SENTRY_PROJECT` | CI | No | Sentry project slug | `inkecho` |
| `LOG_LEVEL` | | No | Pino log level | `info` / `debug` |

---

### Rate Limiting

| Variable | Required | Client | Description | Example |
|----------|----------|--------|-------------|---------|
| `UPSTASH_REDIS_REST_URL` | ✓ | No | Upstash Redis URL | `https://...` |
| `UPSTASH_REDIS_REST_TOKEN` | ✓ | No | Upstash token | — |

*Alternative: Vercel KV bindings*

---

### Cron & Internal

| Variable | Required | Client | Description | Example |
|----------|----------|--------|-------------|---------|
| `CRON_SECRET` | ✓ | No | Protects cron route handlers | `openssl rand -hex 32` |

---

### Feature Flags (Optional)

| Variable | Required | Client | Description | Default |
|----------|----------|--------|-------------|---------|
| `NEXT_PUBLIC_ENABLE_PUBLIC_ROOMS` | | Yes | Show public room browser | `true` |
| `NEXT_PUBLIC_ENABLE_VOTING` | | Yes | Funniest chain voting | `true` |
| `NEXT_PUBLIC_ENABLE_OAUTH` | | Yes | Show OAuth buttons | `true` |

---

## Environment Files

```
.env.example          # Template (committed)
.env.local            # Local dev (gitignored)
.env.test             # Test runner (gitignored)
```

### .env.example

```bash
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=InkEcho

# Database
DATABASE_URL=mongodb://localhost:27017/inkecho

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Guest
GUEST_SESSION_SECRET=
GUEST_SESSION_TTL_HOURS=24

# Ably
ABLY_API_KEY=
ABLY_TOKEN_TTL_SECONDS=3600

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=inkecho/dev/drawings

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
LOG_LEVEL=debug

# Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Cron
CRON_SECRET=

# Feature Flags
NEXT_PUBLIC_ENABLE_PUBLIC_ROOMS=true
NEXT_PUBLIC_ENABLE_VOTING=true
```

---

## Vercel Environment Scopes

| Variable | Development | Preview | Production |
|----------|-------------|---------|------------|
| `DATABASE_URL` | Dev cluster | Staging cluster | Prod cluster |
| `ABLY_API_KEY` | Dev app | Staging app | Prod app |
| `CLOUDINARY_*` | Dev folder | Staging folder | Prod folder |
| `BETTER_AUTH_URL` | localhost | Preview URL | Prod URL |
| `LOG_LEVEL` | debug | info | info |

---

## Validation at Startup

```typescript
// shared/config/env.ts (Phase 2)
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  ABLY_API_KEY: z.string().min(1),
  // ...
});

export const env = envSchema.parse(process.env);
```

- Fail fast on missing required vars at build/runtime
- Zod schema co-located with env loader
- Client vars validated separately (`NEXT_PUBLIC_*`)

---

## Security Rules

| Rule | Enforcement |
|------|-------------|
| Never commit `.env.local` | `.gitignore` |
| Never log secrets | Pino redact paths |
| Rotate on leak | Document 13 incident response |
| Min privilege per env | Separate Ably/MongoDB/Cloudinary apps |
| CI secrets | GitHub Actions secrets only |

### Pino Redact Paths

```typescript
redact: {
  paths: [
    'req.headers.authorization',
    'req.headers.cookie',
    'DATABASE_URL',
    'ABLY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ],
  censor: '[REDACTED]',
}
```

---

## Related Documents

- Deployment: Document 15
- Security: Document 13
- Logging: Document 18
