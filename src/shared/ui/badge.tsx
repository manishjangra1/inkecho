import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-[3px] border px-2 py-0.5 text-[11px] font-medium transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-white text-black font-semibold',
        secondary: 'border-[#262626] bg-[#1A1A1A] text-neutral-300',
        destructive: 'border-[#D9534F]/40 bg-[#D9534F]/10 text-[#D9534F]',
        outline: 'border-border bg-transparent text-neutral-300',
        success: 'border-white/40 bg-white/10 text-white',
        warning: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
        spectator: 'border-neutral-700 bg-[#161616] text-neutral-400',
        online: 'border-neutral-700 bg-[#161616] text-white',
        ready: 'border-white/50 bg-white text-black font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
