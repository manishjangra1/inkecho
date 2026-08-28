import { participantRepository } from '@/infrastructure/db/repositories/participant.repository';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { guestSessionRepository } from '@/infrastructure/db/repositories/guest-session.repository';
import { ok, err, type Result } from '@/domain/shared/result';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
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

  async startGame(
    roomCode: string,
    ctx: AuthContext
  ): Promise<Result<import('@/features/game/types/game.types').StartGameResponse, AppError>> {
    authorize(ctx, 'room:start');

    const roomResult = await roomRepository.findByCode(roomCode);
    if (!roomResult.ok) {
      return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
    }

    const room = roomResult.value;
    if (room.status !== 'LOBBY') {
      return err(
        new ConflictError('INVALID_ROOM_STATE', 'Game can only be started from LOBBY state.')
      );
    }

    const participantsResult = await participantRepository.listByRoom(room.id);
    if (!participantsResult.ok) {
      return err(participantsResult.error);
    }

    const participants = participantsResult.value;
    const players = participants.filter((p) => p.role === 'HOST' || p.role === 'PLAYER');

    if (players.length < room.settings.minPlayers) {
      return err(
        new ValidationError(
          `At least ${room.settings.minPlayers} players are required to start the game.`
        )
      );
    }

    // Dynamic import to avoid circular dependency
    const { gameService } = await import('@/features/game/services/game.service');
    const { eventPublisher } = await import('@/infrastructure/realtime/event-publisher');
    const { toTurnSnapshotDto } = await import('@/infrastructure/db/mappers/game.mapper');
    const { prisma } = await import('@/infrastructure/db/prisma.client');

    const playerIds = players.map((p) => p.playerId);
    const gameResult = await gameService.createAndStart(room.id, playerIds, room.settings);

    if (!gameResult.ok) {
      return err(gameResult.error);
    }

    const game = gameResult.value;

    // Link game to room and update status
    await prisma.room.update({
      where: { id: room.id },
      data: {
        status: 'IN_PROGRESS',
        currentGameId: game.id,
        lastActivityAt: new Date(),
      },
    });

    await eventPublisher.gameStarted(room.id, game);

    const callerPlayerId = ctx.type !== 'anonymous' && ctx.playerId ? ctx.playerId : playerIds[0]!;
    const turnSnapshot = toTurnSnapshotDto(game, callerPlayerId);

    return ok({
      gameId: game.id,
      status: 'IN_PROGRESS',
      version: game.version,
      currentTurn: turnSnapshot,
    });
  }
}

export const lobbyService = new LobbyService();

