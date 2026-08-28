'use client';

import * as React from 'react';
import { Clock, Users, MessageSquare, Send, Eye } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { cn } from '@/shared/lib/cn';

export interface PlayerTurnItem {
  id: string;
  name: string;
  isHost?: boolean;
  status: 'DRAWING' | 'DESCRIBING' | 'WAITING' | 'READY' | 'SUBMITTED';
  isCurrentPlayer?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp?: string;
  isSystem?: boolean;
}

export interface RightContextPanelProps {
  readonly roundInfo?: { current: number; total: number };
  readonly timeRemainingSeconds?: number;
  readonly timerTotalSeconds?: number;
  readonly players?: PlayerTurnItem[];
  readonly spectators?: string[];
  readonly chatMessages?: ChatMessage[];
  readonly onSendMessage?: (message: string) => void;
  readonly currentPrompt?: string;
  readonly nextPlayerName?: string;
}

export function RightContextPanel({
  roundInfo,
  timeRemainingSeconds,
  players = [],
  spectators = [],
  chatMessages = [
    { id: '1', sender: 'System', text: 'Welcome to the room!', isSystem: true },
  ],
  onSendMessage,
  currentPrompt,
  nextPlayerName,
}: RightContextPanelProps) {
  const [inputText, setInputText] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (onSendMessage) {
      onSendMessage(inputText.trim());
    }
    setInputText('');
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const formattedTime =
    timeRemainingSeconds !== undefined
      ? `${String(Math.floor(timeRemainingSeconds / 60)).padStart(2, '0')}:${String(
          timeRemainingSeconds % 60
        ).padStart(2, '0')}`
      : null;

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col justify-between border-l border-border bg-[#0E0E0E] text-neutral-300 select-none">
      {/* Header Info: Timer & Round */}
      <div className="border-b border-border p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            {roundInfo ? `Round ${roundInfo.current} / ${roundInfo.total}` : 'Room Info'}
          </span>
          {formattedTime && (
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white bg-[#1A1A1A] border border-neutral-700 px-2 py-0.5 rounded-[3px]">
              <Clock className="h-3 w-3 text-neutral-400" />
              <span>{formattedTime}</span>
            </div>
          )}
        </div>

        {/* Current Prompt / Next preview if available */}
        {currentPrompt && (
          <div className="rounded-[4px] border border-[#232323] bg-[#141414] p-2 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
              Current Prompt
            </span>
            <p className="text-xs font-medium text-white italic truncate">
              &ldquo;{currentPrompt}&rdquo;
            </p>
            {nextPlayerName && (
              <p className="text-[10px] text-neutral-400">
                Next: <span className="text-white">{nextPlayerName}</span> will describe your drawing
              </p>
            )}
          </div>
        )}
      </div>

      {/* Center Section: Turn Order / Players */}
      <div className="flex-1 overflow-hidden flex flex-col border-b border-border">
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 flex items-center justify-between">
          <span>Players ({players.length})</span>
          <Users className="h-3 w-3 text-neutral-500" />
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 pb-2">
            {players.map((p) => (
              <div
                key={p.id}
                className={cn(
                  'flex items-center justify-between rounded-[4px] px-2 py-1.5 text-xs transition-colors border',
                  p.isCurrentPlayer
                    ? 'border-neutral-700 bg-[#1A1A1A] text-white'
                    : 'border-transparent text-neutral-400 hover:bg-[#141414] hover:text-neutral-200'
                )}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-medium text-neutral-200 truncate">{p.name}</span>
                  {p.isHost && (
                    <Badge variant="outline" className="h-3.5 px-1 text-[8px] text-neutral-400">
                      Host
                    </Badge>
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-mono font-medium',
                    p.status === 'DRAWING'
                      ? 'text-white'
                      : p.status === 'READY' || p.status === 'SUBMITTED'
                      ? 'text-neutral-300'
                      : 'text-neutral-500'
                  )}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Spectators */}
        {spectators.length > 0 && (
          <div className="border-t border-[#1C1C1C] px-3 py-1.5 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> Spectators
            </span>
            <span className="font-mono text-neutral-400">{spectators.length}</span>
          </div>
        )}
      </div>

      {/* Bottom Section: Live Chat Feed */}
      <div className="flex h-56 flex-col">
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 flex items-center justify-between border-b border-[#1C1C1C]">
          <span>Chat</span>
          <MessageSquare className="h-3 w-3 text-neutral-500" />
        </div>

        <ScrollArea className="flex-1 p-3">
          <div className="space-y-2">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-xs leading-relaxed">
                {msg.isSystem ? (
                  <span className="text-[11px] text-neutral-500 italic">{msg.text}</span>
                ) : (
                  <>
                    <strong className="text-neutral-300 font-medium">{msg.sender}: </strong>
                    <span className="text-neutral-400">{msg.text}</span>
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="flex items-center gap-1.5 border-t border-border p-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="h-7 text-xs bg-[#161616] border-[#262626] text-white focus-visible:border-white"
          />
          <Button type="submit" size="sm" variant="outline" className="h-7 w-7 p-0 shrink-0">
            <Send className="h-3 w-3" />
          </Button>
        </form>
      </div>
    </aside>
  );
}
