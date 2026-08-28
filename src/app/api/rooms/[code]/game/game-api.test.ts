import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as startGame } from './start/route';
import { GET as getGameSnapshot } from './route';
import { POST as pauseGame } from './pause/route';
import { POST as resumeGame } from './resume/route';
import { POST as submitDescription } from './submit/description/route';
import { POST as submitDrawing } from './submit/drawing/route';
import { POST as voteChain } from './vote/route';
import { POST as rematchGame } from './rematch/route';
import { GET as getRealtimeToken } from '../../../realtime/token/route';
import { lobbyService } from '@/features/lobby/services/lobby.service';
import { gameService } from '@/features/game/services/game.service';
import { revealService } from '@/features/reveal/services/reveal.service';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { ablyTokenService } from '@/infrastructure/realtime/ably-token.service';
import { ok } from '@/domain/shared/result';

vi.mock('@/infrastructure/auth/session', () => ({
  getAuthContext: vi.fn().mockResolvedValue({
    type: 'guest',
    playerId: '550e8400-e29b-41d4-a716-446655440000',
    guestSessionId: 'g-123',
    roomId: '65e3a7b9c1d2e3f4a5b6c7d9',
    displayName: 'TestPlayer',
    role: 'HOST',
  }),
}));

describe('Game Lifecycle REST API Endpoints', () => {

  const mockRoom = {
    id: '65e3a7b9c1d2e3f4a5b6c7d9',
    code: 'ROOM99',
    status: 'IN_PROGRESS' as const,
    visibility: 'PUBLIC' as const,
    hostPlayerId: '550e8400-e29b-41d4-a716-446655440000',
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/rooms/[code]/game/start starts game and returns 201', async () => {
    vi.spyOn(lobbyService, 'startGame').mockResolvedValue(
      ok({
        gameId: '65e3a7b9c1d2e3f4a5b6c7d8',
        status: 'IN_PROGRESS',
        version: 1,
        currentTurn: {
          id: 'turn-1',
          phase: 'DESCRIBE',
          activePlayerId: '550e8400-e29b-41d4-a716-446655440000',
          chainIndex: 0,
          turnIndex: 0,
          turnStartedAt: new Date().toISOString(),
          turnEndsAt: new Date().toISOString(),
          isMyTurn: true,
          promptContext: null,
        },
      })
    );

    const req = new Request('http://localhost:3000/api/rooms/ROOM99/game/start', {
      method: 'POST',
    });

    const res = await startGame(req, { params: Promise.resolve({ code: 'ROOM99' }) });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.gameId).toBe('65e3a7b9c1d2e3f4a5b6c7d8');
  });

  it('GET /api/rooms/[code]/game returns reconnect snapshot', async () => {
    vi.spyOn(gameService, 'getSnapshot').mockResolvedValue(
      ok({
        id: '65e3a7b9c1d2e3f4a5b6c7d8',
        roomId: '65e3a7b9c1d2e3f4a5b6c7d9',
        status: 'IN_PROGRESS',
        version: 1,
        currentRoundIndex: 0,
        currentChainIndex: 0,
        currentTurnIndex: 0,
        turnPhase: 'DESCRIBE',
        activePlayerId: '550e8400-e29b-41d4-a716-446655440000',
        playerOrder: ['550e8400-e29b-41d4-a716-446655440000'],
        currentTurn: {
          id: 'turn-1',
          chainIndex: 0,
          turnIndex: 0,
          phase: 'DESCRIBE',
          activePlayerId: '550e8400-e29b-41d4-a716-446655440000',
          turnStartedAt: new Date().toISOString(),
          turnEndsAt: new Date().toISOString(),
          isMyTurn: true,
          promptContext: null,
        },
        chains: [],
        serverTime: new Date().toISOString(),
      })
    );

    const req = new Request('http://localhost:3000/api/rooms/ROOM99/game');
    const res = await getGameSnapshot(req, { params: Promise.resolve({ code: 'ROOM99' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe('65e3a7b9c1d2e3f4a5b6c7d8');
    expect(json.data.version).toBe(1);
  });

  it('POST /api/rooms/[code]/game/pause pauses the active game', async () => {
    vi.spyOn(gameService, 'pauseGame').mockResolvedValue(
      ok({
        version: 2,
        status: 'PAUSED',
        pausedAt: new Date().toISOString(),
        remainingSeconds: 45,
      })
    );

    const req = new Request('http://localhost:3000/api/rooms/ROOM99/game/pause', {
      method: 'POST',
    });

    const res = await pauseGame(req, { params: Promise.resolve({ code: 'ROOM99' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.status).toBe('PAUSED');
  });

  it('POST /api/rooms/[code]/game/resume resumes the paused game', async () => {
    vi.spyOn(gameService, 'resumeGame').mockResolvedValue(
      ok({
        version: 3,
        status: 'IN_PROGRESS',
        turnEndsAt: new Date().toISOString(),
        remainingSeconds: 45,
      })
    );

    const req = new Request('http://localhost:3000/api/rooms/ROOM99/game/resume', {
      method: 'POST',
    });

    const res = await resumeGame(req, { params: Promise.resolve({ code: 'ROOM99' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.status).toBe('IN_PROGRESS');
  });

  it('POST /api/rooms/[code]/game/submit/description submits description turn', async () => {
    vi.spyOn(gameService, 'submitDescription').mockResolvedValue(
      ok({
        version: 2,
        gameStatus: 'IN_PROGRESS',
        currentTurn: {
          id: 'turn-2',
          phase: 'DRAW',
          activePlayerId: 'player-2',
          chainIndex: 0,
          turnIndex: 1,
          turnStartedAt: new Date().toISOString(),
          turnEndsAt: new Date().toISOString(),
          isMyTurn: false,
          promptContext: null,
        },
      })
    );

    const req = new Request('http://localhost:3000/api/rooms/ROOM99/game/submit/description', {
      method: 'POST',
      body: JSON.stringify({
        roomCode: 'ROOM99',
        roomId: '65e3a7b9c1d2e3f4a5b6c7d9',
        text: 'A friendly alien eating pizza',
        expectedVersion: 1,
      }),
    });

    const res = await submitDescription(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.version).toBe(2);
    expect(json.data.currentTurn.phase).toBe('DRAW');
  });

  it('POST /api/rooms/[code]/game/submit/drawing submits drawing turn', async () => {
    vi.spyOn(roomRepository, 'findByCode').mockResolvedValue(ok(mockRoom));
    vi.spyOn(gameService, 'submitDrawing').mockResolvedValue(
      ok({
        version: 3,
        drawingUrl: 'https://res.cloudinary.com/demo/image/upload/drawing.webp',
        gameStatus: 'IN_PROGRESS',
        currentTurn: {
          id: 'turn-3',
          phase: 'DESCRIBE',
          activePlayerId: 'player-3',
          chainIndex: 0,
          turnIndex: 2,
          turnStartedAt: new Date().toISOString(),
          turnEndsAt: new Date().toISOString(),
          isMyTurn: false,
          promptContext: null,
        },
      })
    );

    const req = new Request('http://localhost:3000/api/rooms/ROOM99/game/submit/drawing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageDataUrl: 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAA...',
        expectedVersion: 2,
      }),
    });

    const res = await submitDrawing(req, { params: Promise.resolve({ code: 'ROOM99' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.drawingUrl).toContain('cloudinary.com');
  });

  it('POST /api/rooms/[code]/game/vote votes for reveal chain', async () => {
    vi.spyOn(revealService, 'voteChain').mockResolvedValue(
      ok({
        votes: { '0': 4, '1': 2 },
        winningChainIndex: 0,
      })
    );

    const req = new Request('http://localhost:3000/api/rooms/ROOM99/game/vote', {
      method: 'POST',
      body: JSON.stringify({ chainIndex: 0 }),
    });

    const res = await voteChain(req, { params: Promise.resolve({ code: 'ROOM99' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.votes['0']).toBe(4);
  });

  it('POST /api/rooms/[code]/game/rematch resets game to lobby', async () => {
    vi.spyOn(revealService, 'rematch').mockResolvedValue(
      ok({
        roomStatus: 'LOBBY',
      })
    );

    const req = new Request('http://localhost:3000/api/rooms/ROOM99/game/rematch', {
      method: 'POST',
    });

    const res = await rematchGame(req, { params: Promise.resolve({ code: 'ROOM99' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.roomStatus).toBe('LOBBY');
  });

  it('GET /api/realtime/token returns Ably token request', async () => {
    vi.spyOn(ablyTokenService, 'createTokenRequest').mockResolvedValue(
      ok({
        keyName: 'key-1',
        ttl: 3600000,
        timestamp: Date.now(),
        capability: '{"room:65e3a7b9c1d2e3f4a5b6c7d9":["subscribe","presence"]}',
        clientId: '550e8400-e29b-41d4-a716-446655440000',
        nonce: 'random-nonce',
        mac: 'hmac-signature',
      } as unknown as import('ably').TokenRequest)
    );

    const req = new Request(
      'http://localhost:3000/api/realtime/token?roomId=65e3a7b9c1d2e3f4a5b6c7d9'
    );

    const res = await getRealtimeToken(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.keyName).toBe('key-1');
    expect(json.clientId).toBe('550e8400-e29b-41d4-a716-446655440000');
  });
});
