import { create } from 'zustand';
import type { GameSnapshotDto, TurnSnapshotDto, GameStatus } from '../types/game.types';

export interface GameStoreState {
  game: GameSnapshotDto | null;
  roomCode: string | null;
  roomId: string | null;
  playerId: string | null;
  isHost: boolean;
  isSpectator: boolean;
  isPaused: boolean;
  remainingSeconds: number;
  connectionState: 'connected' | 'connecting' | 'disconnected' | 'suspended';

  // Actions
  initRoomContext: (params: {
    roomCode: string;
    roomId: string;
    playerId: string;
    isHost: boolean;
    isSpectator: boolean;
  }) => void;
  setSnapshot: (snapshot: GameSnapshotDto) => void;
  replaceFromSnapshot: (snapshot: GameSnapshotDto) => void;
  setPaused: (isPaused: boolean, remainingSeconds?: number) => void;
  setTurn: (turn: TurnSnapshotDto, version: number, status?: GameStatus) => void;
  setRemainingSeconds: (seconds: number) => void;
  setConnectionState: (state: GameStoreState['connectionState']) => void;
  reset: () => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  game: null,
  roomCode: null,
  roomId: null,
  playerId: null,
  isHost: false,
  isSpectator: false,
  isPaused: false,
  remainingSeconds: 0,
  connectionState: 'connecting',

  initRoomContext: (params) =>
    set({
      roomCode: params.roomCode,
      roomId: params.roomId,
      playerId: params.playerId,
      isHost: params.isHost,
      isSpectator: params.isSpectator,
    }),

  setSnapshot: (snapshot) => {
    const isPaused = snapshot.status === 'PAUSED';
    const remainingSeconds = snapshot.pauseRemainingMs
      ? Math.ceil(snapshot.pauseRemainingMs / 1000)
      : Math.max(
          0,
          Math.ceil((new Date(snapshot.currentTurn.turnEndsAt).getTime() - Date.now()) / 1000)
        );

    set({
      game: snapshot,
      isPaused,
      remainingSeconds,
    });
  },

  replaceFromSnapshot: (snapshot) => {
    const isPaused = snapshot.status === 'PAUSED';
    const remainingSeconds = snapshot.pauseRemainingMs
      ? Math.ceil(snapshot.pauseRemainingMs / 1000)
      : Math.max(
          0,
          Math.ceil((new Date(snapshot.currentTurn.turnEndsAt).getTime() - Date.now()) / 1000)
        );

    set({
      game: snapshot,
      isPaused,
      remainingSeconds,
    });
  },

  setPaused: (isPaused, remainingSeconds) =>
    set((state) => ({
      isPaused,
      remainingSeconds: remainingSeconds !== undefined ? remainingSeconds : state.remainingSeconds,
      game: state.game
        ? {
            ...state.game,
            status: isPaused ? 'PAUSED' : 'IN_PROGRESS',
          }
        : null,
    })),

  setTurn: (turn, version, status) =>
    set((state) => {
      const effectiveStatus: GameStatus = status || state.game?.status || 'IN_PROGRESS';
      if (!state.game) {
        return {
          game: {
            id: 'active_game',
            roomId: state.roomId || 'unknown_room',
            status: effectiveStatus,
            version,
            currentRoundIndex: 0,
            currentChainIndex: turn.chainIndex,
            currentTurnIndex: turn.turnIndex,
            turnPhase: turn.phase,
            activePlayerId: turn.activePlayerId,
            playerOrder: [turn.activePlayerId],
            currentTurn: turn,
            chains: [],
            serverTime: new Date().toISOString(),
          },
          isPaused: effectiveStatus === 'PAUSED',
        };
      }
      return {
        game: {
          ...state.game,
          version,
          status: effectiveStatus,
          currentTurnIndex: turn.turnIndex,
          currentChainIndex: turn.chainIndex,
          turnPhase: turn.phase,
          activePlayerId: turn.activePlayerId,
          currentTurn: turn,
        },
        isPaused: effectiveStatus === 'PAUSED',
      };
    }),

  setRemainingSeconds: (seconds) => set({ remainingSeconds: Math.max(0, seconds) }),

  setConnectionState: (connectionState) => set({ connectionState }),

  reset: () =>
    set({
      game: null,
      roomCode: null,
      roomId: null,
      playerId: null,
      isHost: false,
      isSpectator: false,
      isPaused: false,
      remainingSeconds: 0,
      connectionState: 'connecting',
    }),
}));
