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
    const roomWithHost = {
      ...mockRoom,
      participants: [
        {
          id: 'p1',
          playerId: 'host-player-id',
          displayName: 'HostPlayer',
          role: 'HOST' as const,
          isReady: true,
          connectionStatus: 'ONLINE' as const,
          joinedAt: new Date().toISOString(),
        },
      ],
    };
    vi.spyOn(roomRepository, 'findByCode').mockResolvedValue(ok(roomWithHost));
    vi.spyOn(participantRepository, 'countActivePlayers').mockResolvedValue(1);
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

  it('reconnects existing registered user without creating duplicate player', async () => {
    vi.spyOn(roomRepository, 'findByCode').mockResolvedValue(ok(mockRoom));
    vi.spyOn(participantRepository, 'findByRoomAndUser').mockResolvedValue(
      ok({
        id: 'p-existing',
        playerId: 'host-player-id',
        userId: 'user-123',
        displayName: 'RegisteredHost',
        role: 'HOST',
        isReady: true,
        connectionStatus: 'ONLINE',
        joinedAt: new Date().toISOString(),
      })
    );
    vi.spyOn(participantRepository, 'reactivateParticipant').mockResolvedValue(
      ok({
        id: 'p-existing',
        playerId: 'host-player-id',
        userId: 'user-123',
        displayName: 'RegisteredHost',
        role: 'HOST',
        isReady: true,
        connectionStatus: 'ONLINE',
        joinedAt: new Date().toISOString(),
      })
    );
    vi.spyOn(guestSessionService, 'create').mockResolvedValue(
      ok({
        guestSessionId: 'g-reconn',
        token: 'token-reconn',
        playerId: 'host-player-id',
        expiresAt: new Date(),
      })
    );

    const result = await roomService.joinRoom(
      { roomCode: 'ABC123', displayName: 'RegisteredHost', asSpectator: false },
      { type: 'registered', userId: 'user-123', displayName: 'RegisteredHost', userRole: 'USER' }
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.playerId).toBe('host-player-id');
      expect(result.value.role).toBe('HOST');
    }
  });

  it('auto-promotes next player when host leaves', async () => {
    vi.spyOn(roomRepository, 'findByCode').mockResolvedValue(ok(mockRoom));
    vi.spyOn(participantRepository, 'markLeft').mockResolvedValue(ok(undefined));
    vi.spyOn(guestSessionService, 'revoke').mockResolvedValue(ok(undefined));
    vi.spyOn(participantRepository, 'listByRoom').mockResolvedValue(
      ok([
        {
          id: 'p-next',
          playerId: 'player-2',
          displayName: 'PlayerTwo',
          role: 'PLAYER',
          isReady: false,
          connectionStatus: 'ONLINE',
          joinedAt: new Date().toISOString(),
        },
      ])
    );
    const updateRoleSpy = vi.spyOn(participantRepository, 'updateRole').mockResolvedValue(
      ok({
        id: 'p-next',
        playerId: 'player-2',
        displayName: 'PlayerTwo',
        role: 'HOST',
        isReady: false,
        connectionStatus: 'ONLINE',
        joinedAt: new Date().toISOString(),
      })
    );
    const updateHostSpy = vi.spyOn(roomRepository, 'updateHost').mockResolvedValue(ok(mockRoom));

    const result = await roomService.leaveRoom('ABC123', {
      type: 'guest',
      guestSessionId: 'g1',
      playerId: 'host-player-id',
      roomId: mockRoom.id,
      displayName: 'HostPlayer',
      role: 'HOST',
    });

    expect(result.ok).toBe(true);
    expect(updateRoleSpy).toHaveBeenCalledWith(mockRoom.id, 'player-2', 'HOST');
    expect(updateHostSpy).toHaveBeenCalledWith('ABC123', 'player-2');
  });

  it('allows host to delete room', async () => {
    vi.spyOn(roomRepository, 'findByCode').mockResolvedValue(ok(mockRoom));
    const deleteSpy = vi.spyOn(roomRepository, 'delete').mockResolvedValue(ok(undefined));

    const result = await roomService.deleteRoom('ABC123', {
      type: 'guest',
      guestSessionId: 'g1',
      playerId: 'host-player-id',
      roomId: mockRoom.id,
      displayName: 'HostPlayer',
      role: 'HOST',
    });

    expect(result.ok).toBe(true);
    expect(deleteSpy).toHaveBeenCalledWith('ABC123');
  });
});
