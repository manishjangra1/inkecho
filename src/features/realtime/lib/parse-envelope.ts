import {
  REALTIME_EVENTS,
  type RealtimeEnvelope,
  type RealtimeEventName,
} from '@/shared/constants/realtime-events';

const EVENT_NAMES = new Set<string>(Object.values(REALTIME_EVENTS));

function isRealtimeEventName(value: unknown): value is RealtimeEventName {
  return typeof value === 'string' && EVENT_NAMES.has(value);
}

function isEnvelope(value: unknown): value is RealtimeEnvelope {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return isRealtimeEventName(record.name);
}

/**
 * Normalizes an Ably message payload into a typed realtime envelope.
 * Handles object data, JSON strings, and payload-only messages that use `message.name`.
 */
export function parseRealtimeEnvelope(
  data: unknown,
  eventName?: string
): RealtimeEnvelope | null {
  let parsed: unknown = data;

  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data) as unknown;
    } catch {
      return null;
    }
  }

  if (isEnvelope(parsed)) {
    return parsed;
  }

  if (eventName && isRealtimeEventName(eventName) && parsed !== undefined && parsed !== null) {
    return {
      name: eventName,
      payload: parsed,
      version: 0,
      scope: 'room',
      timestamp: new Date().toISOString(),
      correlationId: 'ably-message',
    };
  }

  return null;
}
