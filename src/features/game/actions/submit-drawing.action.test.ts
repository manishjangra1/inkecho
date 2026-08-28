import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitDrawingAction } from './submit-drawing.action';
import { gameService } from '../services/game.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { ok } from '@/domain/shared/result';

vi.mock('../services/game.service');
vi.mock('@/infrastructure/auth/session');
vi.mock('@/infrastructure/monitoring/request-context', () => ({
  getCorrelationId: vi.fn().mockResolvedValue('test-corr-id'),
}));

describe('submitDrawingAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates schema and calls gameService.submitDrawing', async () => {
    vi.mocked(getAuthContext).mockResolvedValue({
      type: 'guest',
      guestSessionId: 'g_1',
      playerId: 'player_1',
      roomId: 'room_123',
      displayName: 'Alice',
      role: 'PLAYER',
    });

    vi.mocked(gameService.submitDrawing).mockResolvedValue(
      ok({
        version: 2,
        drawingUrl: 'https://res.cloudinary.com/inkecho/image/upload/drawing.webp',
        gameStatus: 'IN_PROGRESS',
        currentTurn: null,
      })
    );

    const result = await submitDrawingAction({
      roomCode: 'ABC123',
      roomId: '507f1f77bcf86cd799439011',
      expectedVersion: 1,
      imageDataUrl: 'data:image/webp;base64,mockdrawing',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.drawingUrl).toContain('cloudinary.com');
      expect(result.data.version).toBe(2);
    }
  });

  it('fails with validation error when required image is missing', async () => {
    const result = await submitDrawingAction({
      roomCode: 'ABC123',
      roomId: '507f1f77bcf86cd799439011',
      expectedVersion: 1,
    } as never);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });
});
