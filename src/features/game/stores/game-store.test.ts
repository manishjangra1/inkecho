import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './game-store';

describe('Game Store (Zustand)', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('initializes room context correctly', () => {
    useGameStore.getState().initRoomContext({
      roomCode: 'ABCD12',
      roomId: 'room_123',
      playerId: 'player_123',
      isHost: true,
      isSpectator: false,
    });

    const state = useGameStore.getState();
    expect(state.roomCode).toBe('ABCD12');
    expect(state.roomId).toBe('room_123');
    expect(state.playerId).toBe('player_123');
    expect(state.isHost).toBe(true);
    expect(state.isSpectator).toBe(false);
  });

  it('replaces state from 409 conflict snapshot', () => {
    useGameStore.getState().replaceFromSnapshot({
      id: 'game_999',
      roomId: 'room_123',
      status: 'IN_PROGRESS',
      version: 5,
      currentRoundIndex: 0,
      currentChainIndex: 0,
      currentTurnIndex: 2,
      turnPhase: 'DESCRIBE',
      activePlayerId: 'p3',
      playerOrder: ['p1', 'p2', 'p3'],
      currentTurn: {
        id: '0_2',
        chainIndex: 0,
        turnIndex: 2,
        phase: 'DESCRIBE',
        activePlayerId: 'p3',
        turnStartedAt: new Date().toISOString(),
        turnEndsAt: new Date(Date.now() + 60000).toISOString(),
        isMyTurn: false,
        promptContext: null,
      },
      chains: [],
      serverTime: new Date().toISOString(),
    });

    const state = useGameStore.getState();
    expect(state.game?.version).toBe(5);
    expect(state.game?.currentTurnIndex).toBe(2);
  });

  it('resetGame resets game data while keeping room context intact', () => {
    useGameStore.getState().initRoomContext({
      roomCode: 'ABCD12',
      roomId: 'room_123',
      playerId: 'player_123',
      isHost: true,
      isSpectator: false,
    });

    useGameStore.getState().setPaused(true, 30);

    useGameStore.getState().resetGame();

    const state = useGameStore.getState();
    expect(state.game).toBeNull();
    expect(state.isPaused).toBe(false);
    expect(state.remainingSeconds).toBe(0);
    expect(state.roomCode).toBe('ABCD12');
    expect(state.playerId).toBe('player_123');
  });
});
