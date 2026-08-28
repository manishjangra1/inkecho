/**
 * Realtime Event Names and Envelopes (Ably)
 * Reference: docs/phase-0/10-realtime-events.md
 */

export const REALTIME_EVENTS = {
  // Connection Lifecycle
  CONNECTION_ESTABLISHED: 'connection_established',

  // Lobby Events
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  PLAYER_KICKED: 'player_kicked',
  PLAYER_READY_CHANGED: 'player_ready_changed',
  ROOM_SETTINGS_UPDATED: 'room_settings_updated',
  HOST_CHANGED: 'host_changed',

  // Game Lifecycle
  GAME_STARTED: 'game_started',
  GAME_PAUSED: 'game_paused',
  GAME_RESUMED: 'game_resumed',
  GAME_COMPLETED: 'game_completed',
  RETURNED_TO_LOBBY: 'returned_to_lobby',

  // Turn Events
  TURN_STARTED: 'turn_started',
  DESCRIPTION_SUBMITTED: 'description_submitted',
  DRAWING_SUBMITTED: 'drawing_submitted',
  TURN_SKIPPED: 'turn_skipped',
  TURN_CHANGED: 'turn_changed',

  // Timer Events
  TIMER_TICK: 'timer_tick',
  TIMER_EXPIRED: 'timer_expired',

  // Connection State
  PLAYER_CONNECTION_CHANGED: 'player_connection_changed',

  // Reveal Events
  REVEAL_STARTED: 'reveal_started',
  REVEAL_CHAIN_STEP: 'reveal_chain_step',
  REVEAL_COMPLETED: 'reveal_completed',

  // Errors & Lifecycle
  ROOM_CLOSED: 'room_closed',
  ERROR: 'error',
} as const;

export type RealtimeEventName =
  (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];

export interface RealtimeEnvelope<T = unknown> {
  readonly name: RealtimeEventName;
  readonly payload: T;
  readonly version: number;
  readonly scope: 'room' | 'game';
  readonly timestamp: string;
  readonly correlationId: string;
}
