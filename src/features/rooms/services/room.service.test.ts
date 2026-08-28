import { describe, it, expect, vi } from 'vitest';
import { roomService } from './room.service';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { participantRepository } from '@/infrastructure/db/repositories/participant.repository';
import { guestSessionService } from '@/features/auth/services/guest-session.service';
import { ok, err } from '@/domain/shared/result';
import { NotFoundError } from '@/shared/lib/errors/app-error';

describe('RoomService', () => {
  const mockRoom = {
    id: '65e3a7b9c1d2e3f4a5b6c7d9',
    code: 'ABC123',
    status: 'LOBBY' as const,
    visibility: 'PRIVATE' as const,
    hostPlayerId: 'host-player-id',
    settings: {
      maxPlayers: 8,
      minPlayers: 3,
      roundCount: 1,
      describeTimerSec: 60,
      drawTimerSec: 90,
      profanityFilter: false,
      allowSpectators: true,
    },
    participants: [],
    spectators: [],
    canStart: false,
    canStartReasons: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('creates a new room with host participant and guest session', async () => {
    vi.spyOn(roomRepository, 'findByCode').mockResolvedValue(
      err(new NotFoundError('ROOM_NOT_FOUND', 'Not found'))
    );
    vi.spyOn(roomRepository, 'create').mockResolvedValue(ok(mockRoom));
    vi.spyOn(participantRepository, 'create').mockResolvedValue(
      ok({
        id: 'p1',
        playerId: 'host-player-id',
        displayName: 'HostPlayer',
        role: 'HOST',
        isReady: true,
        connectionStatus: 'ONLINE',
        joinedAt: new Date().toISOString(),
      })
    );
    vi.spyOn(guestSessionService, 'create').mockResolvedValue(
      ok({
        guestSessionId: 'g1',
        token: 'token-abc',
        playerId: 'host-player-id',
        expiresAt: new Date(),
      })
    );

    const result = await roomService.createRoom(
      { displayName: 'HostPlayer', visibility: 'PRIVATE' },
      { type: 'anonymous' }
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.roomCode).toBeDefined();
      expect(result.value.token).toBe('token-abc');
    }
  });

  it('joins an existing room in LOBBY state', async () => {
    vi.spyOn(roomRepository, 'findByCode').mockResolvedValue(ok(mockRoom));
    vi.spyOn(participantRepository, 'countActivePlayers').mockResolvedValue(2);
    vi.spyOn(participantRepository, 'create').mockResolvedValue(
      ok({
        id: 'p2',
        playerId: 'player-2',
        displayName: 'GuestTwo',
        role: 'PLAYER',
        isReady: false,
        connectionStatus: 'ONLINE',
        joinedAt: new Date().toISOString(),
      })
    );
    vi.spyOn(guestSessionService, 'create').mockResolvedValue(
      ok({
        guestSessionId: 'g2',
        token: 'token-xyz',
        playerId: 'player-2',
        expiresAt: new Date(),
      })
    );

    const result = await roomService.joinRoom(
      { roomCode: 'ABC123', displayName: 'GuestTwo', asSpectator: false },
      { type: 'anonymous' }
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.role).toBe('PLAYER');
      expect(result.value.redirectTo).toBe('lobby');
    }
  });
});
