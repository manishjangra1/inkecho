import { headers } from 'next/headers';
import { createRequestLogger } from './logger';

export async function getCorrelationId(): Promise<string> {
  try {
    const h = await headers();
    return h.get('x-correlation-id') ?? crypto.randomUUID();
  } catch {
    return crypto.randomUUID();
  }
}

export { createRequestLogger };
