import type { RoomParticipant as PrismaParticipant } from '@prisma/client';

export interface ParticipantDto {
  readonly id: string;
  readonly playerId: string;
  readonly userId?: string | null;
  readonly displayName: string;
  readonly avatarUrl?: string | null;
  readonly role: 'HOST' | 'PLAYER' | 'SPECTATOR';
  readonly isReady: boolean;
  readonly connectionStatus: 'ONLINE' | 'RECONNECTING' | 'OFFLINE';
  readonly joinedAt: string;
}

export function toParticipantDto(raw: PrismaParticipant): ParticipantDto {
  return {
    id: raw.id,
    playerId: raw.playerId,
    userId: raw.userId ?? null,
    displayName: raw.displayName,
    avatarUrl: raw.avatarUrl,
    role: raw.role,
    isReady: raw.isReady,
    connectionStatus: raw.connectionStatus,
    joinedAt: raw.joinedAt.toISOString(),
  };
}
