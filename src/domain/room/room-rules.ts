import { ROOM_CONFIG } from '@/shared/config/room.config';

export interface RoomParticipantSummary {
  readonly playerId: string;
  readonly isReady: boolean;
  readonly role: 'HOST' | 'PLAYER' | 'SPECTATOR';
}

export interface RoomRulesEvaluation {
  readonly canStart: boolean;
  readonly reasons: string[];
}

/**
 * Validates whether the room satisfies all criteria to start the game:
 * 1. Must be in LOBBY state
 * 2. Total active non-spectator players >= minPlayers (default 3)
 * 3. Total active players <= maxPlayers
 * 4. All active players must be ready
 */
export function evaluateCanStartGame(
  participants: ReadonlyArray<RoomParticipantSummary>,
  minPlayers: number = ROOM_CONFIG.MIN_PLAYERS,
  maxPlayers: number = ROOM_CONFIG.MAX_PLAYERS
): RoomRulesEvaluation {
  const activePlayers = participants.filter((p) => p.role === 'HOST' || p.role === 'PLAYER');
  const reasons: string[] = [];

  if (activePlayers.length < minPlayers) {
    reasons.push(
      `Need at least ${minPlayers} players to start (currently ${activePlayers.length}).`
    );
  }

  if (activePlayers.length > maxPlayers) {
    reasons.push(`Room exceeds maximum capacity of ${maxPlayers} players.`);
  }

  const unreadyCount = activePlayers.filter((p) => !p.isReady).length;
  if (unreadyCount > 0) {
    reasons.push(`${unreadyCount} player${unreadyCount > 1 ? 's are' : ' is'} not ready yet.`);
  }

  return {
    canStart: reasons.length === 0,
    reasons,
  };
}

/**
 * Checks if the room has reached capacity for active players.
 */
export function isRoomFull(
  currentParticipantCount: number,
  maxPlayers: number = ROOM_CONFIG.DEFAULT_MAX_PLAYERS
): boolean {
  return currentParticipantCount >= maxPlayers;
}
