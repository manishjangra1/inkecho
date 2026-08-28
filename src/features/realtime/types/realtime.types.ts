export interface RealtimePresenceData {
  readonly playerId: string;
  readonly displayName: string;
  readonly role: 'HOST' | 'PLAYER' | 'SPECTATOR';
  readonly connectionStatus: 'ONLINE' | 'RECONNECTING';
}

export type ConnectionState =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'suspended'
  | 'failed';
