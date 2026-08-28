import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from './chat-store';
import type { ChatMessageDto } from '../types/chat.types';

describe('useChatStore', () => {
  beforeEach(() => {
    useChatStore.getState().clearMessages();
    useChatStore.setState({
      isCollapsed: false,
      unreadCount: 0,
      isMobileDrawerOpen: false,
    });
  });

  it('adds messages and prevents duplicates', () => {
    const msg: ChatMessageDto = {
      id: 'm1',
      roomId: 'r1',
      senderId: 'p1',
      senderName: 'Alice',
      text: 'Hello!',
      role: 'PLAYER',
      isSystem: false,
      timestamp: new Date().toISOString(),
    };

    useChatStore.getState().addMessage(msg);
    expect(useChatStore.getState().messages).toHaveLength(1);

    // Duplicate
    useChatStore.getState().addMessage(msg);
    expect(useChatStore.getState().messages).toHaveLength(1);
  });

  it('increments unreadCount when collapsed', () => {
    useChatStore.getState().setCollapsed(true);

    const msg: ChatMessageDto = {
      id: 'm2',
      roomId: 'r1',
      senderId: 'p1',
      senderName: 'Alice',
      text: 'Are you ready?',
      role: 'PLAYER',
      isSystem: false,
      timestamp: new Date().toISOString(),
    };

    useChatStore.getState().addMessage(msg);
    expect(useChatStore.getState().unreadCount).toBe(1);

    useChatStore.getState().markAsRead();
    expect(useChatStore.getState().unreadCount).toBe(0);
  });

  it('adds system messages properly', () => {
    useChatStore.getState().addSystemMessage('Round 1 started');
    const messages = useChatStore.getState().messages;
    expect(messages).toHaveLength(1);
    expect(messages[0]?.isSystem).toBe(true);
    expect(messages[0]?.text).toBe('Round 1 started');
    expect(messages[0]?.role).toBe('SYSTEM');
  });

  it('toggles sound setting', () => {
    const initial = useChatStore.getState().isSoundEnabled;
    useChatStore.getState().toggleSound();
    expect(useChatStore.getState().isSoundEnabled).toBe(!initial);
  });

  it('hydrates initial messages without duplicate entries', () => {
    const msg1: ChatMessageDto = {
      id: 'm1',
      roomId: 'r1',
      senderId: 'p1',
      senderName: 'Alice',
      text: 'First',
      role: 'PLAYER',
      isSystem: false,
      timestamp: '2026-08-28T10:00:00.000Z',
    };
    const msg2: ChatMessageDto = {
      id: 'm2',
      roomId: 'r1',
      senderId: 'p2',
      senderName: 'Bob',
      text: 'Second',
      role: 'PLAYER',
      isSystem: false,
      timestamp: '2026-08-28T10:01:00.000Z',
    };

    useChatStore.getState().addMessage(msg1);
    useChatStore.getState().setInitialMessages([msg1, msg2]);
    expect(useChatStore.getState().messages).toHaveLength(2);
    expect(useChatStore.getState().messages[1]?.id).toBe('m2');
  });
});
