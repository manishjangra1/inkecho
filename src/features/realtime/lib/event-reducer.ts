import { REALTIME_EVENTS, type RealtimeEnvelope } from '@/shared/constants/realtime-events';
import type { GameStoreState } from '@/features/game/stores/game-store';

/**
 * Pure Event Reducer
 * Applies Ably realtime events directly to the Zustand game store state.
 * Reference: docs/phase-5/01-realtime-architecture-overview.md
 */
export function reduceRealtimeEvent(
  envelope: RealtimeEnvelope,
  store: GameStoreState,
  viewerPlayerId: string
): void {
  const { name, payload, version, scope } = envelope;

  // Monotonic version ordering check for game events
  if (scope === 'game' && store.game && version > 0) {
    if (version < store.game.version) {
      // Ignore stale/duplicate event
      return;
    }
  }

  switch (name) {
    case REALTIME_EVENTS.GAME_STARTED: {
      const p = payload as {
        gameId: string;
        playerOrder: string[];
        chainCount: number;
        firstTurn: {
          phase: 'DESCRIBE' | 'DRAW';
          activePlayerId: string;
          chainIndex: number;
          turnIndex: number;
          turnEndsAt: string;
          starterPrompt: string;
        };
      };

      const isMyTurn = p.firstTurn.activePlayerId === viewerPlayerId;
      store.setTurn(
        {
          id: `${p.firstTurn.chainIndex}_${p.firstTurn.turnIndex}`,
          chainIndex: p.firstTurn.chainIndex,
          turnIndex: p.firstTurn.turnIndex,
          phase: p.firstTurn.phase,
          activePlayerId: p.firstTurn.activePlayerId,
          turnStartedAt: new Date().toISOString(),
          turnEndsAt: p.firstTurn.turnEndsAt,
          isMyTurn,
          promptContext: isMyTurn
            ? {
                type: 'STARTER_PROMPT',
                text: p.firstTurn.starterPrompt,
                drawingUrl: null,
              }
            : null,
        },
        version,
        'IN_PROGRESS'
      );
      break;
    }

    case REALTIME_EVENTS.TURN_CHANGED: {
      const p = payload as {
        previousTurn: { chainIndex: number; turnIndex: number };
        currentTurn: {
          phase: 'DESCRIBE' | 'DRAW';
          chainIndex: number;
          turnIndex: number;
          activePlayerId: string;
          turnEndsAt: string;
        };
        gameStatus: 'IN_PROGRESS' | 'PAUSED' | 'REVEAL' | 'COMPLETED';
      };

      const isMyTurn = p.currentTurn.activePlayerId === viewerPlayerId;
      store.setTurn(
        {
          id: `${p.currentTurn.chainIndex}_${p.currentTurn.turnIndex}`,
          chainIndex: p.currentTurn.chainIndex,
          turnIndex: p.currentTurn.turnIndex,
          phase: p.currentTurn.phase,
          activePlayerId: p.currentTurn.activePlayerId,
          turnStartedAt: new Date().toISOString(),
          turnEndsAt: p.currentTurn.turnEndsAt,
          isMyTurn,
          // Prompt context will be resolved when fetching snapshot or next active turn
          promptContext: null,
        },
        version,
        p.gameStatus
      );
      break;
    }

    case REALTIME_EVENTS.GAME_PAUSED: {
      const p = payload as { remainingSeconds: number };
      store.setPaused(true, p.remainingSeconds);
      break;
    }

    case REALTIME_EVENTS.GAME_RESUMED: {
      const p = payload as { remainingSeconds: number };
      store.setPaused(false, p.remainingSeconds);
      break;
    }

    case REALTIME_EVENTS.TIMER_TICK: {
      const p = payload as { remainingSeconds: number };
      store.setRemainingSeconds(p.remainingSeconds);
      break;
    }

    default:
      break;
  }
}
