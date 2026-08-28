import { RateLimitError } from '@/shared/lib/errors/app-error';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class InMemoryRateLimiter {
  private readonly store = new Map<string, RateLimitRecord>();

  async check(
    key: string,
    limit: number,
    windowSec: number
  ): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    const windowMs = windowSec * 1000;
    const record = this.store.get(key);

    if (!record || record.resetAt <= now) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1 };
    }

    if (record.count >= limit) {
      return { allowed: false, remaining: 0 };
    }

    record.count += 1;
    return { allowed: true, remaining: limit - record.count };
  }

  // Periodic cleanup
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (record.resetAt <= now) {
        this.store.delete(key);
      }
    }
  }
}

export const rateLimiter = new InMemoryRateLimiter();

export async function assertRateLimit(
  key: string,
  limit: number = 10,
  windowSec: number = 60
): Promise<void> {
  const result = await rateLimiter.check(key, limit, windowSec);
  if (!result.allowed) {
    throw new RateLimitError('Too many requests. Please wait before trying again.');
  }
}
