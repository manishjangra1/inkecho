import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { participantRepository } from '@/infrastructure/db/repositories/participant.repository';
import { guestSessionService } from '@/features/auth/services/guest-session.service';
import { eventPublisher } from '@/infrastructure/realtime/event-publisher';
import { generateRoomCode } from '@/domain/shared/value-objects/room-code';
import { isRoomFull } from '@/domain/room/room-rules';
import { ok, err, type Result } from '@/domain/shared/result';
import {
  ValidationError,
  ForbiddenError,
  GameStateError,
  NotFoundError,
  type AppError,
} from '@/shared/lib/errors/app-error';
import { authorize, type AuthContext } from '@/shared/lib/auth/authorize';
import { getAvatarUrl } from '@/shared/lib/avatar';
import { ROOM_CONFIG } from '@/shared/config/room.config';
import { env } from '@/shared/config/env';
import type { CreateRoomInput } from '../schemas/create-room.schema';
import type { JoinRoomInput } from '../schemas/join-room.schema';
import type { UpdateRoomSettingsInput } from '../schemas/room-settings.schema';
import type {
  CreateRoomResponse,
  JoinRoomResponse,
  LeaveRoomResponse,
  RoomSnapshotDto,
} from '../types/room.types';

export class RoomService {
  async createRoom(
    dto: CreateRoomInput,
    ctx: AuthContext
  ): Promise<Result<CreateRoomResponse & { token: string; expiresAt: Date }, AppError>> {
    const displayName = ctx.type === 'registered' ? ctx.displayName : dto.displayName?.trim();

    if (!displayName) {
      return err(new ValidationError('Display name is required to create a room.'));
    }

    const hostPlayerId = crypto.randomUUID();
    let code = generateRoomCode();

    // Ensure room code uniqueness
    let attempts = 0;
    while (attempts < 5) {
      const existing = await roomRepository.findByCode(code);
      if (!existing.ok) break; // Not found -> code is available
      code = generateRoomCode();
      attempts++;
    }

    const settings = {
      maxPlayers: dto.settings?.maxPlayers ?? ROOM_CONFIG.DEFAULT_MAX_PLAYERS,
      minPlayers: dto.settings?.minPlayers ?? ROOM_CONFIG.MIN_PLAYERS,
      roundCount: dto.settings?.roundCount ?? ROOM_CONFIG.DEFAULT_ROUNDS,
      describeTimerSec: dto.settings?.describeTimerSec ?? 60,
      drawTimerSec: dto.settings?.drawTimerSec ?? 90,
      profanityFilter: dto.settings?.profanityFilter ?? false,
      allowSpectators: dto.settings?.allowSpectators ?? true,
    };

    const roomResult = await roomRepository.create({
      code,
      hostPlayerId,
      visibility: dto.visibility ?? 'PRIVATE',
      settings,
    });

    if (!roomResult.ok) {
      return err(roomResult.error);
    }

    const room = roomResult.value;

    const participantResult = await participantRepository.create({
      roomId: room.id,
      playerId: hostPlayerId,
      userId: ctx.type === 'registered' ? ctx.userId : undefined,
      displayName,
      avatarUrl: getAvatarUrl(hostPlayerId || displayName),
      role: 'HOST',
      isReady: true, // Host is ready by default
    });

    if (!participantResult.ok) {
      return err(participantResult.error);
    }

    const sessionResult = await guestSessionService.create({
      roomId: room.id,
      displayName,
      playerId: hostPlayerId,
      role: 'HOST',
      userId: ctx.type === 'registered' ? ctx.userId : undefined,
    });

    if (!sessionResult.ok) {
      return err(sessionResult.error);
    }

    const baseUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/join/${code}`;

    return ok({
      roomId: room.id,
      roomCode: code,
      playerId: hostPlayerId,
      inviteUrl,
      token: sessionResult.value.token,
      expiresAt: sessionResult.value.expiresAt,
    });
  }

  async joinRoom(
    dto: JoinRoomInput,
    ctx: AuthContext
  ): Promise<Result<JoinRoomResponse & { token: string; expiresAt: Date }, AppError>> {
    const roomResult = await roomRepository.findByCode(dto.roomCode);
    if (!roomResult.ok) {
      return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
    }

    const room = roomResult.value;

    if (room.status === 'CLOSED') {
      return err(new GameStateError('ROOM_CLOSED', 'This room has been closed.'));
    }

    const displayName = ctx.type === 'registered' ? ctx.displayName : dto.displayName?.trim();

    if (!displayName) {
      return err(new ValidationError('Display name is required to join a room.'));
    }

    // Role determination
    let role: 'HOST' | 'PLAYER' | 'SPECTATOR' = 'PLAYER';
    let redirectTo: 'lobby' | 'game' | 'reveal' | 'spectate' = 'lobby';

    if (dto.asSpectator || (room.status !== 'LOBBY' && room.settings.allowSpectators)) {
      role = 'SPECTATOR';
      redirectTo =
        room.status === 'IN_PROGRESS' ? 'game' : room.status === 'REVEAL' ? 'reveal' : 'spectate';
    } else if (room.status !== 'LOBBY') {
      return err(
        new GameStateError(
          'GAME_IN_PROGRESS',
          'Game is already in progress. You may join as a spectator.'
        )
      );
    } else {
      const activeCount = await participantRepository.countActivePlayers(room.id);
      if (isRoomFull(activeCount, room.settings.maxPlayers)) {
        return err(new ForbiddenError('ROOM_FULL', 'This room is currently full.'));
      }
      role = 'PLAYER';
      redirectTo = 'lobby';
    }

    const playerId = crypto.randomUUID();

    const participantResult = await participantRepository.create({
      roomId: room.id,
      playerId,
      userId: ctx.type === 'registered' ? ctx.userId : undefined,
      displayName,
      avatarUrl: getAvatarUrl(playerId || displayName),
      role,
      isReady: false,
    });

    if (!participantResult.ok) {
      return err(participantResult.error);
    }

    const sessionResult = await guestSessionService.create({
      roomId: room.id,
      displayName,
      playerId,
      role,
      userId: ctx.type === 'registered' ? ctx.userId : undefined,
    });

    if (!sessionResult.ok) {
      return err(sessionResult.error);
    }

    const refreshedRoom = await roomRepository.findByCode(dto.roomCode);

    return ok({
      playerId,
      role,
      redirectTo,
      room: refreshedRoom.ok ? refreshedRoom.value : room,
      token: sessionResult.value.token,
      expiresAt: sessionResult.value.expiresAt,
    });
  }

  async leaveRoom(
    roomCode: string,
    ctx: AuthContext
  ): Promise<Result<LeaveRoomResponse, AppError>> {
    if (ctx.type === 'anonymous') {
      return ok({ left: true });
    }

    const roomResult = await roomRepository.findByCode(roomCode);
    if (!roomResult.ok) {
      return ok({ left: true });
    }

    const room = roomResult.value;
    const playerId = ctx.playerId;

    if (playerId) {
      await participantRepository.markLeft(room.id, playerId);
      await guestSessionService.revoke(ctx.type === 'guest' ? ctx.guestSessionId : '');

      // Check if room host left
      if (room.hostPlayerId === playerId) {
        const remaining = await participantRepository.listByRoom(room.id);
        const activePlayers = remaining.ok
          ? remaining.value.filter((p) => p.role === 'HOST' || p.role === 'PLAYER')
          : [];

        if (activePlayers.length === 0) {
          await roomRepository.close(room.code, 'HOST');
        } else {
          const nextHost = activePlayers[0];
          if (nextHost) {
            await participantRepository.updateRole(room.id, nextHost.playerId, 'HOST');
            await roomRepository.updateHost(room.code, nextHost.playerId);
          }
        }
      }
    }

    return ok({ left: true });
  }

  async updateSettings(
    dto: UpdateRoomSettingsInput,
    ctx: AuthContext
  ): Promise<Result<RoomSnapshotDto, AppError>> {
    authorize(ctx, 'room:settings');
    return roomRepository.updateSettings(dto.roomCode, dto.settings);
  }

  async closeRoom(roomCode: string, ctx: AuthContext): Promise<Result<void, AppError>> {
    authorize(ctx, 'room:settings');
    const roomResult = await roomRepository.findByCode(roomCode);
    if (!roomResult.ok) {
      return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
    }

    const room = roomResult.value;
    if (ctx.type === 'anonymous' || !ctx.playerId || room.hostPlayerId !== ctx.playerId) {
      return err(new ForbiddenError('NOT_HOST', 'Only the room host can close the room.'));
    }

    await roomRepository.close(roomCode, 'HOST');
    await eventPublisher.roomClosed(room.id, 'HOST', 'Room has been closed by the host.');

    return ok(undefined);
  }
}

export const roomService = new RoomService();
