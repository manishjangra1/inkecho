// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { GameChatSidebar } from './GameChatSidebar';
import { useChatStore } from '../stores/chat-store';
import type { ChatMessageDto } from '../types/chat.types';

describe('GameChatSidebar', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
      true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    useChatStore.getState().clearMessages();
    useChatStore.setState({
      isCollapsed: false,
      unreadCount: 0,
      isSoundEnabled: false,
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders chat header and empty state message when no messages exist', () => {
    act(() => {
      root.render(<GameChatSidebar roomCode="ABC123" currentUserId="user_1" />);
    });

    expect(container.textContent).toContain('Live Chat');
    expect(container.textContent).toContain('No messages yet');
  });

  it('renders incoming messages with sender name and text', () => {
    act(() => {
      root.render(<GameChatSidebar roomCode="ABC123" currentUserId="user_1" />);
    });

    const msg: ChatMessageDto = {
      id: 'm1',
      roomId: 'r1',
      senderId: 'user_2',
      senderName: 'Bob the Builder',
      text: 'Good luck with your drawing!',
      role: 'PLAYER',
      isSystem: false,
      timestamp: new Date().toISOString(),
    };

    act(() => {
      useChatStore.getState().addMessage(msg);
    });

    expect(container.textContent).toContain('Bob the Builder');
    expect(container.textContent).toContain('Good luck with your drawing!');
  });

  it('renders collapsed state when isCollapsed is true', () => {
    act(() => {
      useChatStore.setState({ isCollapsed: true });
      root.render(<GameChatSidebar roomCode="ABC123" currentUserId="user_1" />);
    });

    expect(container.querySelector('aside')?.className).toContain('w-12');
  });
});
