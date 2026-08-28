import { describe, it, expect } from 'vitest';
import { sendChatMessageSchema } from './chat.schemas';

describe('sendChatMessageSchema', () => {
  it('validates a correct chat message payload', () => {
    const res = sendChatMessageSchema.safeParse({
      roomCode: 'ABC123',
      text: 'Hello, world!',
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.text).toBe('Hello, world!');
      expect(res.data.roomCode).toBe('ABC123');
    }
  });

  it('rejects empty or whitespace-only messages', () => {
    const res = sendChatMessageSchema.safeParse({
      roomCode: 'ABC123',
      text: '   ',
    });
    expect(res.success).toBe(false);
  });

  it('rejects messages exceeding max length', () => {
    const res = sendChatMessageSchema.safeParse({
      roomCode: 'ABC123',
      text: 'a'.repeat(301),
    });
    expect(res.success).toBe(false);
  });

  it('rejects invalid room codes', () => {
    const res = sendChatMessageSchema.safeParse({
      roomCode: 'invalid!',
      text: 'Hello',
    });
    expect(res.success).toBe(false);
  });
});
