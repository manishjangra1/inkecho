import { participantRepository } from '@/infrastructure/db/repositories/participant.repository';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { guestSessionRepository } from '@/infrastructure/db/repositories/guest-session.repository';
import { ok, err, type Result } from '@/domain/shared/result';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
  type AppError,
} from '@/shared/lib/errors/app-error';
import { authorize, type AuthContext } from '@/shared/lib/auth/authorize';
import type { ParticipantDto } from '@/infrastructure/db/mappers/participant.mapper';
import type { RoomSnapshotDto } from '@/infrastructure/db/mappers/room.mapper';

export class LobbyService {
  async toggleReady(
    roomCode: string,
    isReady: boolean,
    ctx: AuthContext
  ): Promise<
    Result<
      {
        playerId: string;
        isReady: boolean;
        participant: ParticipantDto;
      },
      AppError
    >
  > {
    if (ctx.type === 'anonymous' || !ctx.playerId || !ctx.roomId) {
      return err(new ForbiddenError('NOT_IN_ROOM', 'Must be in a room to set ready state.'));
    }

    const updated = await participantRepository.updateReady(ctx.roomId, ctx.playerId, isReady);
    if (!updated.ok) {
      return err(updated.error);
    }

    return ok({
      playerId: ctx.playerId,
      isReady,
      participant: updated.value,
    });
  }

  async kickPlayer(
    roomCode: string,
    targetPlayerId: string,
    ctx: AuthContext
  ): Promise<Result<{ kickedPlayerId: string }, AppError>> {
    authorize(ctx, 'room:kick');

    if (ctx.type !== 'anonymous' && ctx.playerId === targetPlayerId) {
      return err(new ValidationError('Host cannot kick themselves.'));
    }

    const roomResult = await roomRepository.findByCode(roomCode);
    if (!roomResult.ok) {
      return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
    }

    const room = roomResult.value;

    await participantRepository.markLeft(room.id, targetPlayerId);
    await roomRepository.addKickedPlayer(room.code, targetPlayerId);
    await guestSessionRepository.deleteByPlayer(room.id, targetPlayerId);

    return ok({ kickedPlayerId: targetPlayerId });
  }

  async transferHost(
    roomCode: string,
    newHostPlayerId: string,
    ctx: AuthContext
  ): Promise<Result<RoomSnapshotDto, AppError>> {
    authorize(ctx, 'room:transfer_host');

    const roomResult = await roomRepository.findByCode(roomCode);
    if (!roomResult.ok) {
      return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
    }

    const room = roomResult.value;
    const oldHostPlayerId = room.hostPlayerId;

    if (oldHostPlayerId === newHostPlayerId) {
      return ok(room);
    }

    // Demote old host to PLAYER, promote new host to HOST
    await participantRepository.updateRole(room.id, oldHostPlayerId, 'PLAYER');
    await participantRepository.updateRole(room.id, newHostPlayerId, 'HOST');
    const updatedRoom = await roomRepository.updateHost(room.code, newHostPlayerId);

    return updatedRoom;
  }
}

export const lobbyService = new LobbyService();
