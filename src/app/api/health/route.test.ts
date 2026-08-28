import { describe, it, expect } from 'vitest';
import { GET } from './route';

describe('GET /api/health', () => {
  it('returns healthy status with correlation ID header', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.status).toBe('healthy');
    expect(json.version).toBeDefined();
    expect(json.environment).toBeDefined();
    expect(json.uptime).toBeGreaterThanOrEqual(0);
    expect(json.timestamp).toBeDefined();

    expect(response.headers.get('x-correlation-id')).toBeDefined();
  });
});
