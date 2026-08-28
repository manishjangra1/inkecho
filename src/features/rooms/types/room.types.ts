import type { RoomSnapshotDto, RoomListItemDto } from '@/infrastructure/db/mappers/room.mapper';
import type { ParticipantDto } from '@/infrastructure/db/mappers/participant.mapper';

export type { RoomSnapshotDto, RoomListItemDto, ParticipantDto };

export interface CreateRoomResponse {
  readonly roomId: string;
  readonly roomCode: string;
  readonly playerId: string;
  readonly inviteUrl: string;
}

export interface JoinRoomResponse {
  readonly playerId: string;
  readonly role: 'HOST' | 'PLAYER' | 'SPECTATOR';
  readonly redirectTo: 'lobby' | 'game' | 'reveal' | 'spectate';
  readonly room: RoomSnapshotDto;
}

export interface LeaveRoomResponse {
  readonly left: true;
}
