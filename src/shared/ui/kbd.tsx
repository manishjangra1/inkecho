import * as React from 'react';
import { cn } from '@/shared/lib/cn';

export type KbdProps = React.HTMLAttributes<HTMLElement>;

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center rounded-[3px] border border-[#2B2B2B] bg-[#161616] px-1.5 py-0.5 font-mono text-[10px] font-medium text-neutral-400 select-none shadow-none',
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
