import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getRooms, POST as postRoom } from './route';
import { GET as getRoomByCode, PATCH as patchRoom, DELETE as deleteRoom } from './[code]/route';
import { POST as joinRoom } from './[code]/join/route';
import { POST as leaveRoom } from './[code]/leave/route';
import { POST as toggleReady } from './[code]/ready/route';
import { POST as kickPlayer } from './[code]/kick/route';
import { POST as transferHost } from './[code]/transfer-host/route';
import { POST as createGuestSession } from '../guest/session/route';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { roomService } from '@/features/rooms/services/room.service';
import { lobbyService } from '@/features/lobby/services/lobby.service';
import { guestSessionService } from '@/features/auth/services/guest-session.service';
import { ok } from '@/domain/shared/result';

vi.mock('@/infrastructure/auth/session', () => ({
  getAuthContext: vi.fn().mockResolvedValue({
    type: 'guest',
    playerId: 'host-123',
    guestSessionId: 'g-123',
    roomId: 'room-123',
    displayName: 'TestHost',
    role: 'HOST',
  }),
}));

describe('Rooms & Guest REST API Endpoints', () => {
  const mockSnapshot = {
    id: '65e3a7b9c1d2e3f4a5b6c7d9',
    code: 'ROOM99',
    status: 'LOBBY' as const,
    visibility: 'PUBLIC' as const,
    hostPlayerId: 'host-123',
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

  it('GET /api/rooms returns public rooms list', async () => {
    vi.spyOn(roomRepository, 'listPublic').mockResolvedValue(
      ok({
        items: [
          {
            id: 'room-1',
            code: 'ROOM01',
            hostDisplayName: 'HostOne',
            playerCount: 3,
            maxPlayers: 8,
            roundCount: 1,
            drawTimerSec: 90,
            describeTimerSec: 60,
            lastActivityAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        limit: 12,
        totalPages: 1,
      })
    );

    const req = new NextRequest('http://localhost:3000/api/rooms?page=1&limit=10');
    const res = await getRooms(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.items).toHaveLength(1);
    expect(json.data.items[0].code).toBe('ROOM01');
  });

  it('POST /api/rooms creates a new room and returns 201 with cookie', async () => {
    vi.spyOn(roomService, 'createRoom').mockResolvedValue(
      ok({
        roomId: '65e3a7b9c1d2e3f4a5b6c7d9',
        roomCode: 'ROOM99',
        playerId: 'host-123',
        inviteUrl: 'http://localhost:3000/join/ROOM99',
        token: 'mock-jwt-token',
        expiresAt: new Date(),
      })
    );

    const req = new NextRequest('http://localhost:3000/api/rooms', {
      method: 'POST',
      body: JSON.stringify({
        displayName: 'HostPlayer',
        visibility: 'PUBLIC',
      }),
    });

    const res = await postRoom(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.roomCode).toBe('ROOM99');
    expect(res.cookies.get('ink_player_session')).toBeDefined();
  });

  it('GET /api/rooms/[code] returns room snapshot', async () => {
    vi.spyOn(roomRepository, 'findByCode').mockResolvedValue(ok(mockSnapshot));

    const req = new NextRequest('http://localhost:3000/api/rooms/ROOM99');
    const res = await getRoomByCode(req, { params: Promise.resolve({ code: 'ROOM99' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.code).toBe('ROOM99');
  });

  it('PATCH /api/rooms/[code] updates room settings', async () => {
    vi.spyOn(roomService, 'updateSettings').mockResolvedValue(ok(mockSnapshot));

    const req = new NextRequest('http://localhost:3000/api/rooms/ROOM99', {
      method: 'PATCH',
      body: JSON.stringify({
        settings: {
          maxPlayers: 10,
        },
      }),
    });

    const res = await patchRoom(req, { params: Promise.resolve({ code: 'ROOM99' }) });
    expect(res.status).toBe(200);
  });

  it('DELETE /api/rooms/[code] closes room and returns 204', async () => {
    vi.spyOn(roomService, 'closeRoom').mockResolvedValue(ok(undefined));

    const req = new NextRequest('http://localhost:3000/api/rooms/ROOM99', {
      method: 'DELETE',
    });

    const res = await deleteRoom(req, { params: Promise.resolve({ code: 'ROOM99' }) });
    expect(res.status).toBe(204);
  });

  it('POST /api/rooms/[code]/join joins room and sets session cookie', async () => {
    vi.spyOn(roomService, 'joinRoom').mockResolvedValue(
      ok({
        playerId: 'player-2',
        role: 'PLAYER',
        redirectTo: 'lobby',
        room: mockSnapshot,
        token: 'guest-player-token',
        expiresAt: new Date(),
      })
    );

    const req = new NextRequest('http://localhost:3000/api/rooms/ROOM99/join', {
      method: 'POST',
      body: JSON.stringify({
        displayName: 'JoiningPlayer',
        asSpectator: false,
      }),
    });

    const res = await joinRoom(req, { params: Promise.resolve({ code: 'ROOM99' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.role).toBe('PLAYER');
    expect(res.cookies.get('ink_player_session')).toBeDefined();
  });

  it('POST /api/rooms/[code]/leave leaves room and deletes cookie', async () => {
    vi.spyOn(roomService, 'leaveRoom').mockResolvedValue(ok({ left: true }));

    const req = new NextRequest('http://localhost:3000/api/rooms/ROOM99/leave', {
      method: 'POST',
    });

    const res = await leaveRoom(req, { params: Promise.resolve({ code: 'ROOM99' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.left).toBe(true);
  });

  it('POST /api/rooms/[code]/ready toggles ready state', async () => {
    vi.spyOn(lobbyService, 'toggleReady').mockResolvedValue(
      ok({
        playerId: 'host-123',
        isReady: true,
        participant: {
          id: 'p-1',
          playerId: 'host-123',
          displayName: 'TestHost',
          role: 'HOST',
          isReady: true,
          connectionStatus: 'ONLINE',
          joinedAt: new Date().toISOString(),
        },
      })
    );

    const req = new NextRequest('http://localhost:3000/api/rooms/ROOM99/ready', {
      method: 'POST',
      body: JSON.stringify({ isReady: true }),
    });

    const res = await toggleReady(req, { params: Promise.resolve({ code: 'ROOM99' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.isReady).toBe(true);
  });

  it('POST /api/rooms/[code]/kick kicks player', async () => {
    vi.spyOn(lobbyService, 'kickPlayer').mockResolvedValue(
      ok({ kickedPlayerId: '550e8400-e29b-41d4-a716-446655440000' })
    );

    const req = new NextRequest('http://localhost:3000/api/rooms/ROOM99/kick', {
      method: 'POST',
      body: JSON.stringify({ playerId: '550e8400-e29b-41d4-a716-446655440000' }),
    });

    const res = await kickPlayer(req, { params: Promise.resolve({ code: 'ROOM99' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.kickedPlayerId).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('POST /api/rooms/[code]/transfer-host transfers host role', async () => {
    vi.spyOn(lobbyService, 'transferHost').mockResolvedValue(ok(mockSnapshot));

    const req = new NextRequest('http://localhost:3000/api/rooms/ROOM99/transfer-host', {
      method: 'POST',
      body: JSON.stringify({ newHostPlayerId: '550e8400-e29b-41d4-a716-446655440000' }),
    });

    const res = await transferHost(req, { params: Promise.resolve({ code: 'ROOM99' }) });
    expect(res.status).toBe(200);
  });

  it('POST /api/guest/session creates session for room', async () => {
    vi.spyOn(roomRepository, 'findByCode').mockResolvedValue(ok(mockSnapshot));
    vi.spyOn(guestSessionService, 'create').mockResolvedValue(
      ok({
        guestSessionId: 'g-99',
        playerId: 'p-99',
        token: 'guest-session-token',
        expiresAt: new Date(),
      })
    );

    const req = new NextRequest('http://localhost:3000/api/guest/session', {
      method: 'POST',
      body: JSON.stringify({
        displayName: 'GuestTester',
        roomCode: 'ROOM99',
      }),
    });

    const res = await createGuestSession(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.playerId).toBe('p-99');
    expect(json.data.roomCode).toBe('ROOM99');
  });
});
