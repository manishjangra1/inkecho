import { getAblyServerClient } from './ably.server';
import { getRoomChannelName } from '@/features/realtime/lib/channel-names';
import {
  REALTIME_EVENTS,
  type RealtimeEnvelope,
  type RealtimeEventName,
} from '@/shared/constants/realtime-events';
import { logger } from '../monitoring/logger';
import type { GameEntity } from '@/domain/game/game-transitions';
import type { ParticipantDto } from '../db/mappers/participant.mapper';
import type { RoomSnapshotDto } from '../db/mappers/room.mapper';

export class EventPublisher {
  /**
   * Generic publish method wrapping Ably REST call with typed envelope and retry logging.
   */
  async publish<T>(
    roomId: string,
    eventName: RealtimeEventName,
    payload: T,
    version: number = 1,
    scope: 'room' | 'game' = 'game',
    correlationId: string = 'server-generated'
  ): Promise<void> {
    const envelope: RealtimeEnvelope<T> = {
      name: eventName,
      payload,
      version,
      scope,
      timestamp: new Date().toISOString(),
      correlationId,
    };

    const client = getAblyServerClient();
    const channelName = getRoomChannelName(roomId);

    if (!client) {
      logger.debug(
        { channelName, eventName, version, scope },
        '[Mock EventPublisher] Broadcast event skipped (no Ably client)'
      );
      return;
    }

    try {
      const channel = client.channels.get(channelName);
      await channel.publish(eventName, envelope);
      logger.info(
        { channelName, eventName, version, scope },
        'Realtime event published successfully'
      );
    } catch (err) {
      logger.error(
        { err, channelName, eventName, version },
        'Failed to publish realtime event via Ably'
      );
    }
  }

  // --- Lobby Events ---

  async playerJoined(
    roomId: string,
    participant: ParticipantDto,
    participantCount: number,
    correlationId?: string
  ) {
    return this.publish(
      roomId,
      REALTIME_EVENTS.PLAYER_JOINED,
      { player: participant, participantCount },
      0,
      'room',
      correlationId
    );
  }

  async playerLeft(
    roomId: string,
    playerId: string,
    participantCount: number,
    newHostPlayerId?: string,
    correlationId?: string
  ) {
    return this.publish(
      roomId,
      REALTIME_EVENTS.PLAYER_LEFT,
      { playerId, participantCount, newHostPlayerId },
      0,
      'room',
      correlationId
    );
  }

  async playerKicked(roomId: string, playerId: string, kickedBy: string, correlationId?: string) {
    return this.publish(
      roomId,
      REALTIME_EVENTS.PLAYER_KICKED,
      { playerId, kickedBy, reason: 'KICKED_BY_HOST' },
      0,
      'room',
      correlationId
    );
  }

  async playerReadyChanged(
    roomId: string,
    playerId: string,
    isReady: boolean,
    readyCount: number,
    totalPlayers: number,
    correlationId?: string
  ) {
    return this.publish(
      roomId,
      REALTIME_EVENTS.PLAYER_READY_CHANGED,
      { playerId, isReady, readyCount, totalPlayers },
      0,
      'room',
      correlationId
    );
  }

  async roomSettingsUpdated(
    roomId: string,
    settings: RoomSnapshotDto['settings'],
    updatedBy: string,
    correlationId?: string
  ) {
    return this.publish(
      roomId,
      REALTIME_EVENTS.ROOM_SETTINGS_UPDATED,
      { settings, updatedBy },
      0,
      'room',
      correlationId
    );
  }

  async hostChanged(
    roomId: string,
    previousHostPlayerId: string,
    newHostPlayerId: string,
    correlationId?: string
  ) {
    return this.publish(
      roomId,
      REALTIME_EVENTS.HOST_CHANGED,
      { previousHostPlayerId, newHostPlayerId },
      0,
      'room',
      correlationId
    );
  }

  // --- Game Lifecycle Events ---

  async gameStarted(roomId: string, game: GameEntity, correlationId?: string) {
    const firstChain = game.chains[0];
    return this.publish(
      roomId,
      REALTIME_EVENTS.GAME_STARTED,
      {
        gameId: game.id,
        playerOrder: [...game.playerOrder],
        chainCount: game.chains.length,
        firstTurn: {
          phase: game.turnPhase,
          activePlayerId: game.activePlayerId,
          chainIndex: game.currentChainIndex,
          turnIndex: game.currentTurnIndex,
          turnEndsAt: game.turnEndsAt.toISOString(),
          starterPrompt: firstChain?.starterPrompt ?? '',
        },
      },
      game.version,
      'game',
      correlationId
    );
  }

  async descriptionSubmitted(
    roomId: string,
    chainIndex: number,
    turnIndex: number,
    playerId: string,
    version: number,
    autoSubmitted: boolean = false,
    correlationId?: string
  ) {
    return this.publish(
      roomId,
      REALTIME_EVENTS.DESCRIPTION_SUBMITTED,
      { chainIndex, turnIndex, playerId, autoSubmitted },
      version,
      'game',
      correlationId
    );
  }

  async drawingSubmitted(
    roomId: string,
    chainIndex: number,
    turnIndex: number,
    playerId: string,
    version: number,
    autoSubmitted: boolean = false,
    correlationId?: string
  ) {
    return this.publish(
      roomId,
      REALTIME_EVENTS.DRAWING_SUBMITTED,
      { chainIndex, turnIndex, playerId, autoSubmitted },
      version,
      'game',
      correlationId
    );
  }

  async turnChanged(
    roomId: string,
    game: GameEntity,
    previousTurn: { chainIndex: number; turnIndex: number },
    correlationId?: string
  ) {
    return this.publish(
      roomId,
      REALTIME_EVENTS.TURN_CHANGED,
      {
        previousTurn,
        currentTurn: {
          phase: game.turnPhase,
          chainIndex: game.currentChainIndex,
          turnIndex: game.currentTurnIndex,
          activePlayerId: game.activePlayerId,
          turnEndsAt: game.turnEndsAt.toISOString(),
        },
        gameStatus: game.status,
      },
      game.version,
      'game',
      correlationId
    );
  }

  async gamePaused(
    roomId: string,
    pausedBy: string,
    remainingSeconds: number,
    version: number,
    correlationId?: string
  ) {
    return this.publish(
      roomId,
      REALTIME_EVENTS.GAME_PAUSED,
      { pausedBy, pausedAt: new Date().toISOString(), remainingSeconds },
      version,
      'game',
      correlationId
    );
  }

  async gameResumed(
    roomId: string,
    turnEndsAt: Date,
    remainingSeconds: number,
    version: number,
    correlationId?: string
  ) {
    return this.publish(
      roomId,
      REALTIME_EVENTS.GAME_RESUMED,
      { turnEndsAt: turnEndsAt.toISOString(), remainingSeconds },
      version,
      'game',
      correlationId
    );
  }

  async gameCompleted(
    roomId: string,
    gameId: string,
    totalChains: number,
    version: number,
    correlationId?: string
  ) {
    return this.publish(
      roomId,
      REALTIME_EVENTS.GAME_COMPLETED,
      { gameId, totalChains },
      version,
      'game',
      correlationId
    );
  }

  async returnedToLobby(roomId: string, correlationId?: string) {
    return this.publish(
      roomId,
      REALTIME_EVENTS.RETURNED_TO_LOBBY,
      { roomStatus: 'LOBBY' },
      0,
      'room',
      correlationId
    );
  }

  async roomClosed(roomId: string, reason: string, message: string, correlationId?: string) {
    return this.publish(
      roomId,
      REALTIME_EVENTS.ROOM_CLOSED,
      { reason, message },
      0,
      'room',
      correlationId
    );
  }
}

export const eventPublisher = new EventPublisher();
