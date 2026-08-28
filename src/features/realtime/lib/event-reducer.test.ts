import { describe, it, expect, beforeEach } from 'vitest';
import { reduceRealtimeEvent } from './event-reducer';
import { useGameStore } from '@/features/game/stores/game-store';
import { REALTIME_EVENTS, type RealtimeEnvelope } from '@/shared/constants/realtime-events';

describe('Realtime Event Reducer', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    useGameStore.getState().initRoomContext({
      roomCode: 'TEST01',
      roomId: 'room123',
      playerId: 'p1',
      isHost: true,
      isSpectator: false,
    });
  });

  it('handles GAME_STARTED and sets initial active turn', () => {
    const envelope: RealtimeEnvelope = {
      name: REALTIME_EVENTS.GAME_STARTED,
      version: 1,
      scope: 'game',
      timestamp: new Date().toISOString(),
      correlationId: 'test-corr',
      payload: {
        gameId: 'game123',
        playerOrder: ['p1', 'p2', 'p3'],
        chainCount: 1,
        firstTurn: {
          phase: 'DESCRIBE',
          activePlayerId: 'p1',
          chainIndex: 0,
          turnIndex: 0,
          turnEndsAt: new Date(Date.now() + 60000).toISOString(),
          starterPrompt: 'A dancing penguin',
        },
      },
    };

    reduceRealtimeEvent(envelope, useGameStore.getState(), 'p1');

    const store = useGameStore.getState();
    expect(store.game).not.toBeNull();
    expect(store.game?.version).toBe(1);
    expect(store.game?.currentTurn.phase).toBe('DESCRIBE');
    expect(store.game?.currentTurn.isMyTurn).toBe(true);
    expect(store.game?.currentTurn.promptContext?.text).toBe('A dancing penguin');
  });

  it('handles TURN_CHANGED and updates active player', () => {
    // Start with game in store
    useGameStore.getState().setSnapshot({
      id: 'game123',
      roomId: 'room123',
      status: 'IN_PROGRESS',
      version: 1,
      currentRoundIndex: 0,
      currentChainIndex: 0,
      currentTurnIndex: 0,
      turnPhase: 'DESCRIBE',
      activePlayerId: 'p1',
      playerOrder: ['p1', 'p2', 'p3'],
      currentTurn: {
        id: '0_0',
        chainIndex: 0,
        turnIndex: 0,
        phase: 'DESCRIBE',
        activePlayerId: 'p1',
        turnStartedAt: new Date().toISOString(),
        turnEndsAt: new Date(Date.now() + 60000).toISOString(),
        isMyTurn: true,
        promptContext: null,
      },
      chains: [],
      serverTime: new Date().toISOString(),
    });

    const envelope: RealtimeEnvelope = {
      name: REALTIME_EVENTS.TURN_CHANGED,
      version: 2,
      scope: 'game',
      timestamp: new Date().toISOString(),
      correlationId: 'test-corr-2',
      payload: {
        previousTurn: { chainIndex: 0, turnIndex: 0 },
        currentTurn: {
          phase: 'DRAW',
          chainIndex: 0,
          turnIndex: 1,
          activePlayerId: 'p2',
          turnEndsAt: new Date(Date.now() + 90000).toISOString(),
        },
        gameStatus: 'IN_PROGRESS',
      },
    };

    reduceRealtimeEvent(envelope, useGameStore.getState(), 'p1');

    const store = useGameStore.getState();
    expect(store.game?.version).toBe(2);
    expect(store.game?.currentTurnIndex).toBe(1);
    expect(store.game?.turnPhase).toBe('DRAW');
    expect(store.game?.activePlayerId).toBe('p2');
    expect(store.game?.currentTurn.isMyTurn).toBe(false);
  });

  it('handles GAME_PAUSED and GAME_RESUMED', () => {
    useGameStore.getState().setSnapshot({
      id: 'game123',
      roomId: 'room123',
      status: 'IN_PROGRESS',
      version: 1,
      currentRoundIndex: 0,
      currentChainIndex: 0,
      currentTurnIndex: 0,
      turnPhase: 'DESCRIBE',
      activePlayerId: 'p1',
      playerOrder: ['p1', 'p2'],
      currentTurn: {
        id: '0_0',
        chainIndex: 0,
        turnIndex: 0,
        phase: 'DESCRIBE',
        activePlayerId: 'p1',
        turnStartedAt: new Date().toISOString(),
        turnEndsAt: new Date(Date.now() + 60000).toISOString(),
        isMyTurn: true,
        promptContext: null,
      },
      chains: [],
      serverTime: new Date().toISOString(),
    });

    reduceRealtimeEvent(
      {
        name: REALTIME_EVENTS.GAME_PAUSED,
        version: 2,
        scope: 'game',
        timestamp: new Date().toISOString(),
        correlationId: 'pause-1',
        payload: { remainingSeconds: 45 },
      },
      useGameStore.getState(),
      'p1'
    );

    expect(useGameStore.getState().isPaused).toBe(true);
    expect(useGameStore.getState().remainingSeconds).toBe(45);

    reduceRealtimeEvent(
      {
        name: REALTIME_EVENTS.GAME_RESUMED,
        version: 3,
        scope: 'game',
        timestamp: new Date().toISOString(),
        correlationId: 'resume-1',
        payload: { remainingSeconds: 45 },
      },
      useGameStore.getState(),
      'p1'
    );

    expect(useGameStore.getState().isPaused).toBe(false);
  });
});
