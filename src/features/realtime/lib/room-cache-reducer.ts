import { REALTIME_EVENTS, type RealtimeEnvelope } from '@/shared/constants/realtime-events';
import type { RoomSnapshotDto } from '@/features/rooms/types/room.types';
import type { ParticipantDto } from '@/infrastructure/db/mappers/participant.mapper';
import { evaluateCanStartGame } from '@/domain/room/room-rules';

function recomputeCanStart(room: RoomSnapshotDto): RoomSnapshotDto {
  const evalResult = evaluateCanStartGame(
    room.participants,
    room.settings.minPlayers,
    room.settings.maxPlayers
  );
  return {
    ...room,
    canStart: room.status === 'LOBBY' && evalResult.canStart,
    canStartReasons: evalResult.reasons,
  };
}

/**
 * Pure cache reducer for RoomSnapshotDto
 * Applies Ably realtime envelope mutations directly into in-memory cached state.
 */
export function reduceRoomCacheEvent(
  envelope: RealtimeEnvelope,
  currentRoom: RoomSnapshotDto
): RoomSnapshotDto {
  switch (envelope.name) {
    case REALTIME_EVENTS.PLAYER_JOINED: {
      const p = envelope.payload as { player: ParticipantDto; participantCount: number };
      if (!p?.player) return currentRoom;

      const existingIndex = currentRoom.participants.findIndex(
        (x) => x.playerId === p.player.playerId
      );
      const updatedParticipants = [...currentRoom.participants];
      if (existingIndex >= 0) {
        updatedParticipants[existingIndex] = p.player;
      } else if (p.player.role !== 'SPECTATOR') {
        updatedParticipants.push(p.player);
      }

      const updatedSpectators =
        p.player.role === 'SPECTATOR'
          ? [
              ...currentRoom.spectators.filter((x) => x.playerId !== p.player.playerId),
              p.player,
            ]
          : currentRoom.spectators;

      return recomputeCanStart({
        ...currentRoom,
        participants: updatedParticipants,
        spectators: updatedSpectators,
      });
    }

    case REALTIME_EVENTS.PLAYER_LEFT: {
      const p = envelope.payload as {
        playerId: string;
        participantCount: number;
        newHostPlayerId?: string;
      };
      if (!p?.playerId) return currentRoom;

      return recomputeCanStart({
        ...currentRoom,
        hostPlayerId: p.newHostPlayerId ?? currentRoom.hostPlayerId,
        participants: currentRoom.participants.filter((x) => x.playerId !== p.playerId),
        spectators: currentRoom.spectators.filter((x) => x.playerId !== p.playerId),
      });
    }

    case REALTIME_EVENTS.PLAYER_READY_CHANGED: {
      const p = envelope.payload as {
        playerId: string;
        isReady: boolean;
      };
      if (!p || p.playerId === undefined) return currentRoom;

      return recomputeCanStart({
        ...currentRoom,
        participants: currentRoom.participants.map((x) =>
          x.playerId === p.playerId ? { ...x, isReady: p.isReady } : x
        ),
      });
    }

    case REALTIME_EVENTS.HOST_CHANGED: {
      const p = envelope.payload as {
        previousHostPlayerId: string;
        newHostPlayerId: string;
      };
      if (!p?.newHostPlayerId) return currentRoom;

      return recomputeCanStart({
        ...currentRoom,
        hostPlayerId: p.newHostPlayerId,
        participants: currentRoom.participants.map((x) =>
          x.playerId === p.newHostPlayerId ? { ...x, role: 'HOST' as const } : x
        ),
      });
    }

    case REALTIME_EVENTS.ROOM_SETTINGS_UPDATED: {
      const p = envelope.payload as { settings: RoomSnapshotDto['settings'] };
      if (!p?.settings) return currentRoom;

      return recomputeCanStart({
        ...currentRoom,
        settings: {
          ...currentRoom.settings,
          ...p.settings,
        },
      });
    }

    case REALTIME_EVENTS.GAME_STARTED: {
      return {
        ...currentRoom,
        status: 'IN_PROGRESS',
        canStart: false,
      };
    }

    case REALTIME_EVENTS.REVEAL_STARTED:
    case REALTIME_EVENTS.GAME_COMPLETED: {
      return {
        ...currentRoom,
        status: 'REVEAL',
        canStart: false,
      };
    }

    case REALTIME_EVENTS.ROOM_CLOSED: {
      return {
        ...currentRoom,
        status: 'CLOSED',
        canStart: false,
      };
    }

    case REALTIME_EVENTS.RETURNED_TO_LOBBY: {
      const resetParticipants = currentRoom.participants.map((x) => ({
        ...x,
        isReady: x.role === 'HOST',
      }));
      return recomputeCanStart({
        ...currentRoom,
        status: 'LOBBY',
        participants: resetParticipants,
      });
    }

    default:
      return currentRoom;
  }
}
