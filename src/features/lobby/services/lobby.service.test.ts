import { describe, it, expect, vi } from 'vitest';
import { lobbyService } from './lobby.service';
import { participantRepository } from '@/infrastructure/db/repositories/participant.repository';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { ok } from '@/domain/shared/result';

describe('LobbyService', () => {
  it('toggles player ready state in room', async () => {
    vi.spyOn(participantRepository, 'updateReady').mockResolvedValue(
      ok({
        id: 'p1',
        playerId: 'player-1',
        displayName: 'PlayerOne',
        role: 'PLAYER',
        isReady: true,
        connectionStatus: 'ONLINE',
        joinedAt: new Date().toISOString(),
      })
    );

    const result = await lobbyService.toggleReady('ABC123', true, {
      type: 'guest',
      guestSessionId: 'g1',
      playerId: 'player-1',
      roomId: 'room-1',
      displayName: 'PlayerOne',
      role: 'PLAYER',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.isReady).toBe(true);
    }
  });

  it('allows host to transfer host role', async () => {
    const mockRoom = {
      id: 'room-1',
      code: 'ABC123',
      status: 'LOBBY' as const,
      visibility: 'PRIVATE' as const,
      hostPlayerId: 'host-1',
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

    vi.spyOn(roomRepository, 'findByCode').mockResolvedValue(ok(mockRoom));
    vi.spyOn(participantRepository, 'updateRole').mockResolvedValue(
      ok({
        id: 'p2',
        playerId: 'player-2',
        displayName: 'PlayerTwo',
        role: 'HOST',
        isReady: true,
        connectionStatus: 'ONLINE',
        joinedAt: new Date().toISOString(),
      })
    );
    vi.spyOn(roomRepository, 'updateHost').mockResolvedValue(
      ok({
        ...mockRoom,
        hostPlayerId: 'player-2',
      })
    );

    const result = await lobbyService.transferHost('ABC123', 'player-2', {
      type: 'guest',
      guestSessionId: 'g1',
      playerId: 'host-1',
      roomId: 'room-1',
      displayName: 'OldHost',
      role: 'HOST',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.hostPlayerId).toBe('player-2');
    }
  });
});
