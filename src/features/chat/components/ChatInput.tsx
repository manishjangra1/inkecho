'use client';

import * as React from 'react';
import { Send, Loader2, Smile } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { sendChatMessageAction } from '../actions/send-chat-message.action';
import { toast } from '@/shared/ui/toast';
import { CHAT_CONFIG } from '../schemas/chat.schemas';
import { cn } from '@/shared/lib/cn';
import { useChatStore } from '../stores/chat-store';

export interface ChatInputProps {
  readonly roomCode: string;
  readonly disabled?: boolean;
}

const QUICK_EMOJIS = ['😂', '🎨', '🔥', '👏', '🤯', '⏱️', '✨'];

export function ChatInput({ roomCode, disabled = false }: ChatInputProps) {
  const [text, setText] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [showEmojis, setShowEmojis] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSend = async (messageToSend?: string) => {
    const rawContent = (messageToSend !== undefined ? messageToSend : text).trim();
    if (!rawContent || isSending || disabled) return;

    if (rawContent.length > CHAT_CONFIG.MAX_LENGTH) {
      toast.error(`Message cannot exceed ${CHAT_CONFIG.MAX_LENGTH} characters.`);
      return;
    }

    setIsSending(true);
    const previousText = text;
    if (messageToSend === undefined) {
      setText('');
    }

    try {
      const result = await sendChatMessageAction({
        roomCode,
        text: rawContent,
      });

      if (!result.success) {
        toast.error(result.error.message || 'Failed to send message.');
        if (messageToSend === undefined) {
          setText(previousText);
        }
      } else {
        // Optimistically ensure message is in store in case of local/mock realtime
        useChatStore.getState().addMessage(result.data.message);
      }
    } catch {
      toast.error('An unexpected error occurred while sending.');
      if (messageToSend === undefined) {
        setText(previousText);
      }
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleQuickEmoji = (emoji: string) => {
    void handleSend(emoji);
    setShowEmojis(false);
  };

  return (
    <div className="flex flex-col gap-2 border-t border-border bg-[#0E0E0E] p-3 px-4 pb-5">
      {/* Quick Emojis Drawer / Strip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleQuickEmoji(emoji)}
              disabled={disabled || isSending}
              className="flex h-7.5 w-7.5 items-center justify-center rounded-[4px] text-base hover:bg-[#1C1C1C] hover:scale-125 active:scale-95 transition-all select-none disabled:opacity-50"
              title={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowEmojis(!showEmojis)}
          className={cn(
            'flex h-7.5 w-7.5 items-center justify-center rounded-[4px] text-neutral-500 hover:text-neutral-200 hover:bg-[#1C1C1C] transition-colors',
            showEmojis && 'text-white bg-[#1C1C1C]'
          )}
          title="Toggle reactions"
        >
          <Smile className="h-4 w-4" />
        </button>
      </div>

      {/* Input Field & Submit Action */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSend();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            maxLength={CHAT_CONFIG.MAX_LENGTH}
            placeholder="Type a message..."
            className="h-9 pr-12 text-xs bg-[#161616] border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-600 rounded-[4px]"
          />
          <span
            className={cn(
              'absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[9px] text-neutral-500 pointer-events-none',
              text.length >= CHAT_CONFIG.MAX_LENGTH * 0.9 && 'text-amber-400 font-semibold'
            )}
          >
            {text.length}/{CHAT_CONFIG.MAX_LENGTH}
          </span>
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={!text.trim() || isSending || disabled}
          className="h-9 w-9 shrink-0 p-0 bg-white text-black hover:bg-neutral-200 disabled:opacity-40 rounded-[4px]"
          title="Send message"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
