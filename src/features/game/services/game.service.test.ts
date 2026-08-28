import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameService } from './game.service';
import { gameRepository } from '@/infrastructure/db/repositories/game.repository';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { promptPoolRepository } from '@/infrastructure/db/repositories/prompt-pool.repository';
import { eventPublisher } from '@/infrastructure/realtime/event-publisher';
import { ok } from '@/domain/shared/result';
import type { AuthContext } from '@/shared/lib/auth/authorize';
import type { GameEntity } from '@/domain/game/game-transitions';

vi.mock('@/infrastructure/db/repositories/game.repository');
vi.mock('@/infrastructure/db/repositories/room.repository');
vi.mock('@/infrastructure/db/repositories/prompt-pool.repository');
vi.mock('@/infrastructure/realtime/event-publisher');

describe('GameService', () => {
  let service: GameService;

  const mockGameEntity: GameEntity = {
    id: 'game_123',
    roomId: 'room_123',
    status: 'IN_PROGRESS',
    version: 1,
    currentRoundIndex: 0,
    currentChainIndex: 0,
    currentTurnIndex: 0,
    turnPhase: 'DESCRIBE',
    turnStartedAt: new Date(),
    turnEndsAt: new Date(Date.now() + 60000),
    activePlayerId: 'player_1',
    playerOrder: ['player_1', 'player_2', 'player_3'],
    chains: [
      {
        chainIndex: 0,
        starterPrompt: 'A magic dragon',
        turns: [
          {
            id: '0_0',
            turnIndex: 0,
            playerId: 'player_1',
            phase: 'DESCRIBE',
            textContent: null,
            drawingUrl: null,
            drawingPublicId: null,
            submittedAt: null,
            skipped: false,
            autoSubmitted: false,
          },
        ],
      },
    ],
    revealChainIndex: 0,
    revealStepIndex: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GameService();
  });

  it('createAndStart validates minimum 3 players', async () => {
    const res = await service.createAndStart('room_123', ['p1', 'p2'], {
      roundCount: 1,
      describeTimerSec: 60,
      drawTimerSec: 90,
    });

    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.message).toContain('At least 3 players');
  });

  it('createAndStart successfully initializes a game', async () => {
    vi.mocked(promptPoolRepository.randomActive).mockResolvedValue(ok('A dancing bear'));
    vi.mocked(gameRepository.create).mockResolvedValue(ok(mockGameEntity));

    const res = await service.createAndStart('room_123', ['p1', 'p2', 'p3'], {
      roundCount: 1,
      describeTimerSec: 60,
      drawTimerSec: 90,
    });

    expect(res.ok).toBe(true);
    expect(gameRepository.create).toHaveBeenCalledTimes(1);
  });

  it('submitDescription validates caller is active player', async () => {
    vi.mocked(gameRepository.findActiveByRoomId).mockResolvedValue(ok(mockGameEntity));

    const wrongPlayerCtx: AuthContext = {
      type: 'guest',
      guestSessionId: 'g_2',
      playerId: 'player_2',
      roomId: 'room_123',
      displayName: 'Bob',
      role: 'PLAYER',
    };

    const res = await service.submitDescription(
      {
        roomCode: 'TEST01',
        roomId: 'room_123',
        text: 'A giant dancing bear',
        expectedVersion: 1,
      },
      wrongPlayerCtx
    );

    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('NOT_YOUR_TURN');
  });

  it('submitDescription advances turn and publishes realtime events', async () => {
    vi.mocked(gameRepository.findActiveByRoomId).mockResolvedValue(ok(mockGameEntity));
    vi.mocked(roomRepository.findById).mockResolvedValue(
      ok({
        id: 'room_123',
        code: 'TEST01',
        hostPlayerId: 'player_1',
        visibility: 'PUBLIC',
        status: 'IN_PROGRESS',
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
      })
    );

    const updatedEntity: GameEntity = {
      ...mockGameEntity,
      version: 2,
      currentTurnIndex: 1,
      turnPhase: 'DRAW',
      activePlayerId: 'player_2',
    };

    vi.mocked(gameRepository.updateWithVersion).mockResolvedValue(ok(updatedEntity));

    const activePlayerCtx: AuthContext = {
      type: 'guest',
      guestSessionId: 'g_1',
      playerId: 'player_1',
      roomId: 'room_123',
      displayName: 'Alice',
      role: 'PLAYER',
    };

    const res = await service.submitDescription(
      {
        roomCode: 'TEST01',
        roomId: 'room_123',
        text: 'A funny dancing bear in a disco',
        expectedVersion: 1,
      },
      activePlayerCtx
    );

    expect(res.ok).toBe(true);
    expect(eventPublisher.descriptionSubmitted).toHaveBeenCalledTimes(1);
    expect(eventPublisher.turnChanged).toHaveBeenCalledTimes(1);
  });

  it('submitDrawing rejects submission when current turn phase is not DRAW', async () => {
    vi.mocked(gameRepository.findActiveByRoomId).mockResolvedValue(ok(mockGameEntity)); // turnPhase is DESCRIBE

    const activePlayerCtx: AuthContext = {
      type: 'guest',
      guestSessionId: 'g_1',
      playerId: 'player_1',
      roomId: 'room_123',
      displayName: 'Alice',
      role: 'PLAYER',
    };

    const res = await service.submitDrawing(
      {
        roomCode: 'TEST01',
        roomId: 'room_123',
        expectedVersion: 1,
        imageDataUrl: 'data:image/webp;base64,mock',
      },
      activePlayerCtx
    );

    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('INVALID_GAME_TRANSITION');
  });

  it('submitDrawing successfully transitions DRAW phase and publishes drawingSubmitted event', async () => {
    const drawPhaseGameEntity: GameEntity = {
      ...mockGameEntity,
      turnPhase: 'DRAW',
      activePlayerId: 'player_1',
    };

    vi.mocked(gameRepository.findActiveByRoomId).mockResolvedValue(ok(drawPhaseGameEntity));
    vi.mocked(roomRepository.findById).mockResolvedValue(
      ok({
        id: 'room_123',
        code: 'TEST01',
        hostPlayerId: 'player_1',
        visibility: 'PUBLIC',
        status: 'IN_PROGRESS',
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
      })
    );

    const updatedEntity: GameEntity = {
      ...drawPhaseGameEntity,
      version: 2,
      currentTurnIndex: 1,
      turnPhase: 'DESCRIBE',
      activePlayerId: 'player_2',
    };

    vi.mocked(gameRepository.updateWithVersion).mockResolvedValue(ok(updatedEntity));

    const activePlayerCtx: AuthContext = {
      type: 'guest',
      guestSessionId: 'g_1',
      playerId: 'player_1',
      roomId: 'room_123',
      displayName: 'Alice',
      role: 'PLAYER',
    };

    const res = await service.submitDrawing(
      {
        roomCode: 'TEST01',
        roomId: 'room_123',
        expectedVersion: 1,
        imageDataUrl: 'data:image/webp;base64,mockdrawingdata',
      },
      activePlayerCtx
    );

    expect(res.ok).toBe(true);
    expect(eventPublisher.drawingSubmitted).toHaveBeenCalledTimes(1);
    expect(eventPublisher.turnChanged).toHaveBeenCalledTimes(1);
  });

  it('expireTurn successfully advances turn on timer expiration', async () => {
    const expiredGameEntity: GameEntity = {
      ...mockGameEntity,
      turnEndsAt: new Date(Date.now() - 5000), // Expired 5 seconds ago
    };

    vi.mocked(roomRepository.findByCode).mockResolvedValue(
      ok({
        id: 'room_123',
        code: 'TEST01',
        hostPlayerId: 'player_1',
        visibility: 'PUBLIC',
        status: 'IN_PROGRESS',
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
      })
    );

    vi.mocked(gameRepository.findActiveByRoomId).mockResolvedValue(ok(expiredGameEntity));
    vi.mocked(gameRepository.findById).mockResolvedValue(ok(expiredGameEntity));
    vi.mocked(roomRepository.findById).mockResolvedValue(
      ok({
        id: 'room_123',
        code: 'TEST01',
        hostPlayerId: 'player_1',
        visibility: 'PUBLIC',
        status: 'IN_PROGRESS',
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
      })
    );

    const advancedEntity: GameEntity = {
      ...expiredGameEntity,
      version: 2,
      currentTurnIndex: 1,
      turnPhase: 'DRAW',
      activePlayerId: 'player_2',
    };

    vi.mocked(gameRepository.updateWithVersion).mockResolvedValue(ok(advancedEntity));

    const res = await service.expireTurn('TEST01', 1);

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.version).toBe(2);
    expect(eventPublisher.turnChanged).toHaveBeenCalledTimes(1);
  });
});
