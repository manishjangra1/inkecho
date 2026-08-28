import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatService } from './chat.service';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { eventPublisher } from '@/infrastructure/realtime/event-publisher';
import { ok, err } from '@/domain/shared/result';
import { NotFoundError, AppError } from '@/shared/lib/errors/app-error';
import type { AuthContext } from '@/shared/lib/auth/authorize';
import type { RoomSnapshotDto } from '@/infrastructure/db/mappers/room.mapper';

describe('ChatService', () => {
  const mockRoom: RoomSnapshotDto = {
    id: 'room_12345',
    code: 'CHAT99',
    status: 'IN_PROGRESS',
    visibility: 'PRIVATE',
    hostPlayerId: 'host_p1',
    settings: {
      maxPlayers: 8,
      minPlayers: 3,
      roundCount: 1,
      describeTimerSec: 60,
      drawTimerSec: 90,
      profanityFilter: false,
      allowSpectators: true,
    },
    participants: [
      {
        id: 'part_1',
        playerId: 'host_p1',
        displayName: 'Alice Host',
        role: 'HOST',
        isReady: true,
        connectionStatus: 'ONLINE',
        joinedAt: new Date().toISOString(),
      },
      {
        id: 'part_2',
        playerId: 'player_p2',
        displayName: 'Bob Player',
        role: 'PLAYER',
        isReady: true,
        connectionStatus: 'ONLINE',
        joinedAt: new Date().toISOString(),
      },
    ],
    spectators: [],
    canStart: false,
    canStartReasons: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    chatService.clearRateLimits();
  });

  it('successfully sends an ephemeral chat message without persisting to DB', async () => {
    vi.spyOn(roomRepository, 'findByCode').mockResolvedValue(ok(mockRoom));
    const publishSpy = vi.spyOn(eventPublisher, 'chatMessage').mockResolvedValue(undefined);

    const ctx: AuthContext = {
      type: 'guest',
      guestSessionId: 'sess_1',
      playerId: 'host_p1',
      roomId: 'room_12345',
      displayName: 'Alice Host',
      role: 'HOST',
    };

    const result = await chatService.sendChatMessage('CHAT99', 'Good luck everyone!', ctx);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.text).toBe('Good luck everyone!');
      expect(result.value.senderName).toBe('Alice Host');
      expect(result.value.role).toBe('HOST');
      expect(result.value.roomId).toBe('room_12345');
      expect(result.value.isSystem).toBe(false);
      expect(publishSpy).toHaveBeenCalledTimes(1);
      expect(publishSpy).toHaveBeenCalledWith(
        'room_12345',
        expect.objectContaining({
          text: 'Good luck everyone!',
          senderId: 'host_p1',
        }),
        undefined
      );
    }
  });

  it('rejects anonymous unauthenticated chat attempts', async () => {
    const ctx: AuthContext = { type: 'anonymous' };
    const result = await chatService.sendChatMessage('CHAT99', 'Hello', ctx);

    expect(result.ok).toBe(false);
    if (!result.ok && result.error instanceof AppError) {
      expect(result.error.statusCode).toBe(401);
    }
  });

  it('rejects message if room is not found', async () => {
    vi.spyOn(roomRepository, 'findByCode').mockResolvedValue(
      err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found'))
    );

    const ctx: AuthContext = {
      type: 'guest',
      guestSessionId: 'sess_2',
      playerId: 'player_p2',
      roomId: 'room_unknown',
      displayName: 'Bob',
      role: 'PLAYER',
    };

    const result = await chatService.sendChatMessage('BAD999', 'Hello', ctx);
    expect(result.ok).toBe(false);
    if (!result.ok && result.error instanceof AppError) {
      expect(result.error.code).toBe('ROOM_NOT_FOUND');
    }
  });

  it('filters profanity when room setting profanityFilter is true', async () => {
    const profanityRoom: RoomSnapshotDto = {
      ...mockRoom,
      settings: { ...mockRoom.settings, profanityFilter: true },
    };

    vi.spyOn(roomRepository, 'findByCode').mockResolvedValue(ok(profanityRoom));
    vi.spyOn(eventPublisher, 'chatMessage').mockResolvedValue(undefined);

    const ctx: AuthContext = {
      type: 'guest',
      guestSessionId: 'sess_1',
      playerId: 'player_p2',
      roomId: 'room_12345',
      displayName: 'Bob Player',
      role: 'PLAYER',
    };

    const result = await chatService.sendChatMessage('CHAT99', 'This drawing is shit!', ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.text).toBe('This drawing is ****!');
    }
  });

  it('enforces rate limit when too many messages are sent rapidly', async () => {
    vi.spyOn(roomRepository, 'findByCode').mockResolvedValue(ok(mockRoom));
    vi.spyOn(eventPublisher, 'chatMessage').mockResolvedValue(undefined);

    const ctx: AuthContext = {
      type: 'guest',
      guestSessionId: 'sess_1',
      playerId: 'spammer_1',
      roomId: 'room_12345',
      displayName: 'Spammer',
      role: 'PLAYER',
    };

    // Send 5 messages (allowed)
    for (let i = 0; i < 5; i++) {
      const res = await chatService.sendChatMessage('CHAT99', `Message ${i}`, ctx);
      expect(res.ok).toBe(true);
    }

    // 6th message should be rate limited
    const sixthRes = await chatService.sendChatMessage('CHAT99', 'Spam!', ctx);
    expect(sixthRes.ok).toBe(false);
    if (!sixthRes.ok && sixthRes.error instanceof AppError) {
      expect(sixthRes.error.statusCode).toBe(429);
      expect(sixthRes.error.code).toBe('RATE_LIMITED');
    }
  });
});
