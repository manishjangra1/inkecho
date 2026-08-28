import type { Room as PrismaRoom, RoomParticipant as PrismaParticipant } from '@prisma/client';
import { toParticipantDto, type ParticipantDto } from './participant.mapper';
import { evaluateCanStartGame } from '@/domain/room/room-rules';

export interface RoomSnapshotDto {
  readonly id: string;
  readonly code: string;
  readonly status: 'LOBBY' | 'IN_PROGRESS' | 'REVEAL' | 'CLOSED';
  readonly visibility: 'PUBLIC' | 'PRIVATE';
  readonly hostPlayerId: string;
  readonly settings: {
    readonly maxPlayers: number;
    readonly minPlayers: number;
    readonly roundCount: number;
    readonly describeTimerSec: number;
    readonly drawTimerSec: number;
    readonly profanityFilter: boolean;
    readonly allowSpectators: boolean;
  };
  readonly participants: ReadonlyArray<ParticipantDto>;
  readonly spectators: ReadonlyArray<ParticipantDto>;
  readonly canStart: boolean;
  readonly canStartReasons: ReadonlyArray<string>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RoomListItemDto {
  readonly id: string;
  readonly code: string;
  readonly hostDisplayName: string;
  readonly playerCount: number;
  readonly maxPlayers: number;
  readonly roundCount: number;
  readonly drawTimerSec: number;
  readonly describeTimerSec: number;
  readonly createdAt: string;
}

export function toRoomSnapshotDto(
  room: PrismaRoom & { participants?: PrismaParticipant[] }
): RoomSnapshotDto {
  const allActiveParticipants = (room.participants ?? []).filter((p) => !p.leftAt);
  const players = allActiveParticipants
    .filter((p) => p.role === 'HOST' || p.role === 'PLAYER')
    .map(toParticipantDto);
  const spectators = allActiveParticipants
    .filter((p) => p.role === 'SPECTATOR')
    .map(toParticipantDto);

  const { canStart, reasons } = evaluateCanStartGame(
    players,
    room.settings.minPlayers,
    room.settings.maxPlayers
  );

  return {
    id: room.id,
    code: room.code,
    status: room.status,
    visibility: room.visibility,
    hostPlayerId: room.hostPlayerId,
    settings: {
      maxPlayers: room.settings.maxPlayers,
      minPlayers: room.settings.minPlayers,
      roundCount: room.settings.roundCount,
      describeTimerSec: room.settings.describeTimerSec,
      drawTimerSec: room.settings.drawTimerSec,
      profanityFilter: room.settings.profanityFilter,
      allowSpectators: room.settings.allowSpectators,
    },
    participants: players,
    spectators,
    canStart: room.status === 'LOBBY' && canStart,
    canStartReasons: reasons,
    createdAt: room.createdAt.toISOString(),
    updatedAt: room.updatedAt.toISOString(),
  };
}

export function toRoomListItemDto(
  room: PrismaRoom & { participants?: PrismaParticipant[] }
): RoomListItemDto {
  const activePlayers = (room.participants ?? []).filter(
    (p) => !p.leftAt && (p.role === 'HOST' || p.role === 'PLAYER')
  );
  const host = activePlayers.find((p) => p.playerId === room.hostPlayerId);

  return {
    id: room.id,
    code: room.code,
    hostDisplayName: host?.displayName ?? 'Host',
    playerCount: activePlayers.length,
    maxPlayers: room.settings.maxPlayers,
    roundCount: room.settings.roundCount,
    drawTimerSec: room.settings.drawTimerSec,
    describeTimerSec: room.settings.describeTimerSec,
    createdAt: room.createdAt.toISOString(),
  };
}
