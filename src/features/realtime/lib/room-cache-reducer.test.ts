import { describe, it, expect } from 'vitest';
import { reduceRoomCacheEvent } from '../lib/room-cache-reducer';
import { REALTIME_EVENTS, type RealtimeEnvelope } from '@/shared/constants/realtime-events';
import type { RoomSnapshotDto } from '@/features/rooms/types/room.types';

describe('reduceRoomCacheEvent', () => {
  const mockRoom: RoomSnapshotDto = {
    id: 'room-1',
    code: 'TEST01',
    status: 'LOBBY',
    visibility: 'PUBLIC',
    hostPlayerId: 'player-host',
    settings: {
      maxPlayers: 8,
      minPlayers: 3,
      roundCount: 1,
      describeTimerSec: 60,
      drawTimerSec: 90,
      profanityFilter: false,
      allowSpectators: true,
    },
    participants: [
      {
        id: 'p1',
        playerId: 'player-host',
        displayName: 'HostPlayer',
        role: 'HOST',
        isReady: true,
        connectionStatus: 'ONLINE',
        joinedAt: '2026-08-28T10:00:00.000Z',
      },
    ],
    spectators: [],
    canStart: false,
    canStartReasons: [],
    createdAt: '2026-08-28T10:00:00.000Z',
    updatedAt: '2026-08-28T10:00:00.000Z',
  };

  it('handles PLAYER_JOINED event', () => {
    const envelope: RealtimeEnvelope = {
      name: REALTIME_EVENTS.PLAYER_JOINED,
      payload: {
        player: {
          id: 'p2',
          playerId: 'player-2',
          displayName: 'PlayerTwo',
          role: 'PLAYER',
          isReady: false,
          connectionStatus: 'ONLINE',
          joinedAt: '2026-08-28T10:01:00.000Z',
        },
        participantCount: 2,
      },
      version: 0,
      scope: 'room',
      timestamp: new Date().toISOString(),
      correlationId: 'c1',
    };

    const updated = reduceRoomCacheEvent(envelope, mockRoom);
    expect(updated.participants).toHaveLength(2);
    expect(updated.participants[1]?.displayName).toBe('PlayerTwo');
  });

  it('handles PLAYER_READY_CHANGED event', () => {
    const envelope: RealtimeEnvelope = {
      name: REALTIME_EVENTS.PLAYER_READY_CHANGED,
      payload: {
        playerId: 'player-host',
        isReady: false,
        readyCount: 0,
        totalPlayers: 1,
      },
      version: 0,
      scope: 'room',
      timestamp: new Date().toISOString(),
      correlationId: 'c2',
    };

    const updated = reduceRoomCacheEvent(envelope, mockRoom);
    expect(updated.participants[0]?.isReady).toBe(false);
  });

  it('handles HOST_CHANGED event and demotes the previous host', () => {
    const roomWithSecondPlayer: RoomSnapshotDto = {
      ...mockRoom,
      participants: [
        ...mockRoom.participants,
        {
          id: 'p2',
          playerId: 'player-2',
          displayName: 'PlayerTwo',
          role: 'PLAYER',
          isReady: true,
          connectionStatus: 'ONLINE',
          joinedAt: '2026-08-28T10:01:00.000Z',
        },
      ],
    };
    const envelope: RealtimeEnvelope = {
      name: REALTIME_EVENTS.HOST_CHANGED,
      payload: {
        previousHostPlayerId: 'player-host',
        newHostPlayerId: 'player-2',
      },
      version: 0,
      scope: 'room',
      timestamp: new Date().toISOString(),
      correlationId: 'c3',
    };

    const updated = reduceRoomCacheEvent(envelope, roomWithSecondPlayer);
    expect(updated.hostPlayerId).toBe('player-2');
    expect(updated.participants.find((p) => p.playerId === 'player-2')?.role).toBe('HOST');
    expect(updated.participants.find((p) => p.playerId === 'player-host')?.role).toBe('PLAYER');
  });

  it('handles PLAYER_KICKED event', () => {
    const roomWithSecondPlayer: RoomSnapshotDto = {
      ...mockRoom,
      participants: [
        ...mockRoom.participants,
        {
          id: 'p2',
          playerId: 'player-2',
          displayName: 'PlayerTwo',
          role: 'PLAYER',
          isReady: false,
          connectionStatus: 'ONLINE',
          joinedAt: '2026-08-28T10:01:00.000Z',
        },
      ],
    };
    const envelope: RealtimeEnvelope = {
      name: REALTIME_EVENTS.PLAYER_KICKED,
      payload: {
        playerId: 'player-2',
        kickedBy: 'player-host',
        reason: 'KICKED_BY_HOST',
      },
      version: 0,
      scope: 'room',
      timestamp: new Date().toISOString(),
      correlationId: 'c-kick',
    };

    const updated = reduceRoomCacheEvent(envelope, roomWithSecondPlayer);
    expect(updated.participants).toHaveLength(1);
    expect(updated.participants[0]?.playerId).toBe('player-host');
  });

  it('handles GAME_STARTED event', () => {
    const envelope: RealtimeEnvelope = {
      name: REALTIME_EVENTS.GAME_STARTED,
      payload: {
        gameId: 'game-1',
        playerOrder: ['player-host'],
        chainCount: 1,
        firstTurn: {
          phase: 'DRAW',
          activePlayerId: 'player-host',
          chainIndex: 0,
          turnIndex: 0,
          turnEndsAt: new Date().toISOString(),
          starterPrompt: 'A cat astronaut',
        },
      },
      version: 1,
      scope: 'game',
      timestamp: new Date().toISOString(),
      correlationId: 'c4',
    };

    const updated = reduceRoomCacheEvent(envelope, mockRoom);
    expect(updated.status).toBe('IN_PROGRESS');
  });

  it('handles ROOM_CLOSED event', () => {
    const envelope: RealtimeEnvelope = {
      name: REALTIME_EVENTS.ROOM_CLOSED,
      payload: {
        reason: 'HOST_DELETED',
        message: 'Room deleted',
      },
      version: 0,
      scope: 'room',
      timestamp: new Date().toISOString(),
      correlationId: 'c5',
    };

    const updated = reduceRoomCacheEvent(envelope, mockRoom);
    expect(updated.status).toBe('CLOSED');
  });

  it('handles RETURNED_TO_LOBBY event', () => {
    const inGameRoom = { ...mockRoom, status: 'REVEAL' as const };
    const envelope: RealtimeEnvelope = {
      name: REALTIME_EVENTS.RETURNED_TO_LOBBY,
      payload: {},
      version: 0,
      scope: 'room',
      timestamp: new Date().toISOString(),
      correlationId: 'c6',
    };

    const updated = reduceRoomCacheEvent(envelope, inGameRoom);
    expect(updated.status).toBe('LOBBY');
  });
});
