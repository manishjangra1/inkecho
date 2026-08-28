import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatMessageDto } from '../types/chat.types';

export interface ChatStoreState {
  readonly messages: ChatMessageDto[];
  readonly unreadCount: number;
  readonly isCollapsed: boolean;
  readonly isSoundEnabled: boolean;
  readonly isMobileDrawerOpen: boolean;

  readonly setInitialMessages: (messages: ChatMessageDto[]) => void;
  readonly addMessage: (message: ChatMessageDto) => void;
  readonly addSystemMessage: (text: string) => void;
  readonly markAsRead: () => void;
  readonly setCollapsed: (collapsed: boolean) => void;
  readonly toggleSound: () => void;
  readonly setMobileDrawerOpen: (open: boolean) => void;
  readonly clearMessages: () => void;
}

const MAX_STORED_MESSAGES = 150;

export const useChatStore = create<ChatStoreState>()(
  persist(
    (set) => ({
      messages: [],
      unreadCount: 0,
      isCollapsed: false,
      isSoundEnabled: true,
      isMobileDrawerOpen: false,

      setInitialMessages: (newMessages: ChatMessageDto[]) =>
        set((state) => {
          if (!newMessages || newMessages.length === 0) return state;
          const existingIds = new Set(state.messages.map((m) => m.id));
          const toAdd = newMessages.filter((m) => !existingIds.has(m.id));
          if (toAdd.length === 0) return state;

          const merged = [...state.messages, ...toAdd]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .slice(-MAX_STORED_MESSAGES);

          return {
            messages: merged,
          };
        }),

      addMessage: (message: ChatMessageDto) =>
        set((state) => {
          // Prevent duplicate messages
          if (state.messages.some((m) => m.id === message.id)) {
            return state;
          }

          const shouldIncrementUnread =
            state.isCollapsed ||
            (typeof window !== 'undefined' &&
              window.innerWidth < 768 &&
              !state.isMobileDrawerOpen);

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
    }),
    {
      name: 'inkecho_chat_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? sessionStorage : localStorage)),
      partialize: (state) => ({
        messages: state.messages,
        isSoundEnabled: state.isSoundEnabled,
        isCollapsed: state.isCollapsed,
      }),
    }
  )
);
