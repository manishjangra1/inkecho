import { describe, it, expect } from 'vitest';
import { parseRealtimeEnvelope } from './parse-envelope';
import { REALTIME_EVENTS } from '@/shared/constants/realtime-events';

describe('parseRealtimeEnvelope', () => {
  it('returns an object envelope unchanged', () => {
    const envelope = {
      name: REALTIME_EVENTS.PLAYER_JOINED,
      payload: { playerId: 'p2' },
      version: 0,
      scope: 'room' as const,
      timestamp: '2026-08-28T10:00:00.000Z',
      correlationId: 'c1',
    };

    expect(parseRealtimeEnvelope(envelope)).toEqual(envelope);
  });

  it('parses a JSON string envelope', () => {
    const envelope = {
      name: REALTIME_EVENTS.PLAYER_READY_CHANGED,
      payload: { playerId: 'p1', isReady: true },
      version: 0,
      scope: 'room' as const,
      timestamp: '2026-08-28T10:00:00.000Z',
      correlationId: 'c2',
    };

    const parsed = parseRealtimeEnvelope(JSON.stringify(envelope));
    expect(parsed?.name).toBe(REALTIME_EVENTS.PLAYER_READY_CHANGED);
    expect(parsed?.payload).toEqual(envelope.payload);
  });

  it('wraps payload-only data using the Ably event name', () => {
    const parsed = parseRealtimeEnvelope(
      { playerId: 'p3', isReady: false },
      REALTIME_EVENTS.PLAYER_READY_CHANGED
    );

    expect(parsed?.name).toBe(REALTIME_EVENTS.PLAYER_READY_CHANGED);
    expect(parsed?.payload).toEqual({ playerId: 'p3', isReady: false });
  });

  it('returns null for invalid payloads', () => {
    expect(parseRealtimeEnvelope(null)).toBeNull();
    expect(parseRealtimeEnvelope('not-json')).toBeNull();
    expect(parseRealtimeEnvelope({ foo: 1 })).toBeNull();
  });
});
