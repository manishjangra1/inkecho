import { describe, it, expect, vi, beforeEach } from 'vitest';
import { revealService } from './reveal.service';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { gameRepository } from '@/infrastructure/db/repositories/game.repository';
import { participantRepository } from '@/infrastructure/db/repositories/participant.repository';
import { gameHistoryRepository } from '@/infrastructure/db/repositories/game-history.repository';
import { userStatsRepository } from '@/infrastructure/db/repositories/user-stats.repository';
import { eventPublisher } from '@/infrastructure/realtime/event-publisher';
import { ok } from '@/domain/shared/result';
import type { AuthContext } from '@/shared/lib/auth/authorize';
import type { GameEntity } from '@/domain/game/game-transitions';
import type { RoomSnapshotDto } from '@/infrastructure/db/mappers/room.mapper';

vi.mock('@/infrastructure/db/repositories/room.repository');
vi.mock('@/infrastructure/db/repositories/game.repository');
vi.mock('@/infrastructure/db/repositories/participant.repository');
vi.mock('@/infrastructure/db/repositories/game-history.repository');
vi.mock('@/infrastructure/db/repositories/user-stats.repository');
vi.mock('@/infrastructure/realtime/event-publisher');

describe('RevealService', () => {
  const mockAuthContext: AuthContext = {
    type: 'guest',
    guestSessionId: 'guest-1',
    playerId: 'p1',
    roomId: 'room-1',
    displayName: 'Player One',
    role: 'HOST',
  };

  const mockRoomSnapshot: RoomSnapshotDto = {
    id: 'room-1',
    code: 'TEST01',
    hostPlayerId: 'p1',
    visibility: 'PUBLIC',
    status: 'REVEAL',
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

  const mockGame: GameEntity = {
    id: 'game-1',
    roomId: 'room-1',
    status: 'REVEAL',
    version: 5,
    currentRoundIndex: 0,
    currentChainIndex: 0,
    currentTurnIndex: 2,
    turnPhase: 'DESCRIBE',
    turnStartedAt: new Date(),
    turnEndsAt: new Date(),
    activePlayerId: 'p1',
    chains: [
      {
        chainIndex: 0,
        starterPrompt: 'A flying dragon',
        turns: [
          {
            id: '0_0',
            turnIndex: 0,
            playerId: 'p1',
            phase: 'DRAW',
            textContent: null,
            drawingUrl: 'https://cloudinary.com/dragon.webp',
            drawingPublicId: 'pub_1',
            submittedAt: new Date(),
            skipped: false,
            autoSubmitted: false,
          },
          {
            id: '0_1',
            turnIndex: 1,
            playerId: 'p2',
            phase: 'DESCRIBE',
            textContent: 'A fiery lizard with wings',
            drawingUrl: null,
            drawingPublicId: null,
            submittedAt: new Date(),
            skipped: false,
            autoSubmitted: false,
          },
        ],
      },
    ],
    playerOrder: ['p1', 'p2', 'p3'],
    votes: { counts: { '0': 2 } },
    revealChainIndex: 0,
    revealStepIndex: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(roomRepository.findByCode).mockResolvedValue(ok(mockRoomSnapshot));
    vi.mocked(gameRepository.findActiveByRoomId).mockResolvedValue(ok(mockGame));
    vi.mocked(participantRepository.findByRoomId).mockResolvedValue(
      ok([
        {
          id: 'part-1',
          roomId: 'room-1',
          playerId: 'p1',
          userId: 'user-1',
          displayName: 'Player One',
          avatarUrl: null,
          role: 'HOST',
          isReady: true,
          connectionStatus: 'ONLINE',
          joinedAt: new Date().toISOString(),
        },
      ])
    );
  });

  it('fetches full reveal data for active game', async () => {
    const res = await revealService.getRevealData('TEST01', mockAuthContext);

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.roomCode).toBe('TEST01');
      expect(res.value.chains).toHaveLength(1);
      const chain = res.value.chains[0];
      expect(chain).toBeDefined();
      if (chain) {
        expect(chain.steps).toHaveLength(3); // 1 starter prompt + 2 turns
        expect(chain.steps[0]?.type).toBe('STARTER_PROMPT');
        expect(chain.steps[1]?.type).toBe('DRAWING');
        expect(chain.steps[2]?.type).toBe('DESCRIPTION');
      }
      expect(res.value.winningChainIndex).toBe(0);
    }
  });

  it('casts a vote for a valid story chain', async () => {
    vi.mocked(gameRepository.update).mockResolvedValue(ok(mockGame));

    const res = await revealService.voteChain(
      { roomCode: 'TEST01', chainIndex: 0 },
      mockAuthContext
    );

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.votes['0']).toBe(3); // 2 + 1
      expect(res.value.winningChainIndex).toBe(0);
    }
    expect(gameRepository.update).toHaveBeenCalled();
  });

  it('allows host to rematch and resets room to lobby', async () => {
    vi.mocked(gameRepository.update).mockResolvedValue(ok({ ...mockGame, status: 'COMPLETED' }));
    vi.mocked(roomRepository.updateStatus).mockResolvedValue(
      ok({
        ...mockRoomSnapshot,
        status: 'LOBBY',
      })
    );
    vi.mocked(participantRepository.resetAllReady).mockResolvedValue(ok(undefined));
    vi.mocked(gameHistoryRepository.create).mockResolvedValue(
      ok({
        id: 'hist-1',
        gameId: 'game-1',
        roomId: 'room-1',
        roomCode: 'TEST01',
        userId: 'user-1',
        playerId: 'p1',
        placement: 1,
        chainsPlayed: 1,
        wonVote: true,
        playedAt: new Date().toISOString(),
        snapshotUrl: null,
      })
    );
    vi.mocked(userStatsRepository.incrementStats).mockResolvedValue(
      ok({
        id: 'stats-1',
        userId: 'user-1',
        gamesPlayed: 1,
        gamesWon: 1,
        chainsCompleted: 1,
        turnsSubmitted: 1,
        updatedAt: new Date().toISOString(),
      })
    );

    const res = await revealService.rematch({ roomCode: 'TEST01' }, mockAuthContext);

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.roomStatus).toBe('LOBBY');
    }
    expect(participantRepository.resetAllReady).toHaveBeenCalledWith('room-1');
    expect(eventPublisher.returnedToLobby).toHaveBeenCalledWith('room-1');
  });
});
