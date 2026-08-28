import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendChatMessageAction } from './send-chat-message.action';
import { chatService } from '../services/chat.service';
import * as sessionModule from '@/infrastructure/auth/session';
import { ok } from '@/domain/shared/result';
import type { ChatMessageDto } from '../types/chat.types';

describe('sendChatMessageAction', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('validates input, extracts auth context, and executes chat service', async () => {
    const mockMessage: ChatMessageDto = {
      id: 'msg-123',
      roomId: 'room-abc',
      senderId: 'player-1',
      senderName: 'Alice',
      text: 'Hello room!',
      role: 'PLAYER',
      isSystem: false,
      timestamp: new Date().toISOString(),
    };

    vi.spyOn(sessionModule, 'getAuthContext').mockResolvedValue({
      type: 'guest',
      guestSessionId: 'sess-1',
      playerId: 'player-1',
      roomId: 'room-abc',
      displayName: 'Alice',
      role: 'PLAYER',
    });

    vi.spyOn(chatService, 'sendChatMessage').mockResolvedValue(ok(mockMessage));

    const res = await sendChatMessageAction({
      roomCode: 'ABC123',
      text: 'Hello room!',
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.message.text).toBe('Hello room!');
      expect(res.data.message.senderName).toBe('Alice');
    }
  });

  it('returns structured validation error on bad input', async () => {
    const res = await sendChatMessageAction({
      roomCode: 'INVALID_CODE',
      text: '',
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe('VALIDATION_ERROR');
    }
  });
});
