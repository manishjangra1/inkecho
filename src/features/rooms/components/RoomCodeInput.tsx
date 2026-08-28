'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/cn';
import { ROOM_CONFIG } from '@/shared/config/room.config';

interface RoomCodeInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly autoFocus?: boolean;
}

export function RoomCodeInput({
  value,
  onChange,
  disabled = false,
  autoFocus = true,
}: RoomCodeInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const length = ROOM_CONFIG.ROOM_CODE_LENGTH;

  // Split value into array of characters
  const chars = Array.from({ length }, (_, i) => value[i] || '');

  React.useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!chars[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      const newChars = [...chars];
      newChars[index] = '';
      onChange(newChars.join(''));
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.toUpperCase();
    const validChar = rawVal.slice(-1);

    if (validChar && ROOM_CONFIG.ROOM_CODE_ALPHABET.includes(validChar)) {
      const newChars = [...chars];
      newChars[index] = validChar;
      const combined = newChars.join('');
      onChange(combined);

      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!pasted) return;

    const trimmed = pasted.slice(0, length);
    onChange(trimmed);

    const nextIndex = Math.min(trimmed.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="text"
          maxLength={1}
          disabled={disabled}
          value={chars[i]}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={cn(
            'w-11 h-14 sm:w-13 sm:h-16 text-center font-mono font-extrabold text-2xl uppercase rounded-xl border bg-background/80 transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent',
            chars[i]
              ? 'border-brand-primary/80 shadow-glow bg-brand-primary/5 text-foreground'
              : 'border-border/80 text-muted-foreground'
          )}
        />
      ))}
    </div>
  );
}
