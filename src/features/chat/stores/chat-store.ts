import { create } from 'zustand';
import type { ChatMessageDto } from '../types/chat.types';

export interface ChatStoreState {
  readonly messages: ChatMessageDto[];
  readonly unreadCount: number;
  readonly isCollapsed: boolean;
  readonly isSoundEnabled: boolean;
  readonly isMobileDrawerOpen: boolean;

  readonly addMessage: (message: ChatMessageDto) => void;
  readonly addSystemMessage: (text: string) => void;
  readonly markAsRead: () => void;
  readonly setCollapsed: (collapsed: boolean) => void;
  readonly toggleSound: () => void;
  readonly setMobileDrawerOpen: (open: boolean) => void;
  readonly clearMessages: () => void;
}

const MAX_STORED_MESSAGES = 150;

export const useChatStore = create<ChatStoreState>((set) => ({
  messages: [],
  unreadCount: 0,
  isCollapsed: false,
  isSoundEnabled: true,
  isMobileDrawerOpen: false,

  addMessage: (message: ChatMessageDto) =>
    set((state) => {
      // Prevent duplicate messages
      if (state.messages.some((m) => m.id === message.id)) {
        return state;
      }

      const shouldIncrementUnread =
        state.isCollapsed || (typeof window !== 'undefined' && window.innerWidth < 768 && !state.isMobileDrawerOpen);

      const nextMessages = [...state.messages, message];
      if (nextMessages.length > MAX_STORED_MESSAGES) {
        nextMessages.shift();
      }

      return {
        messages: nextMessages,
        unreadCount: shouldIncrementUnread ? state.unreadCount + 1 : 0,
      };
    }),

  addSystemMessage: (text: string) =>
    set((state) => {
      const systemMsg: ChatMessageDto = {
        id: `sys_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        roomId: '',
        senderId: 'system',
        senderName: 'System',
        text,
        role: 'SYSTEM',
        isSystem: true,
        timestamp: new Date().toISOString(),
      };

      const nextMessages = [...state.messages, systemMsg];
      if (nextMessages.length > MAX_STORED_MESSAGES) {
        nextMessages.shift();
      }

      return {
        messages: nextMessages,
      };
    }),

  markAsRead: () => set({ unreadCount: 0 }),

  setCollapsed: (collapsed: boolean) =>
    set((state) => ({
      isCollapsed: collapsed,
      unreadCount: collapsed ? state.unreadCount : 0,
    })),

  toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),

  setMobileDrawerOpen: (open: boolean) =>
    set({
      isMobileDrawerOpen: open,
      unreadCount: open ? 0 : 0,
    }),

  clearMessages: () => set({ messages: [], unreadCount: 0 }),
}));
