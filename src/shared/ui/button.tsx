import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';
import { Spinner } from './spinner';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[4px] text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 active:opacity-90 select-none',
  {
    variants: {
      variant: {
        default: 'bg-white text-black hover:bg-neutral-200 border border-white',
        destructive: 'bg-[#D9534F] text-white hover:bg-[#c44744] border border-[#D9534F]',
        outline:
          'border border-border bg-[#111111] text-foreground hover:bg-[#1A1A1A] hover:border-neutral-700',
        secondary: 'bg-[#1C1C1C] text-neutral-200 border border-[#262626] hover:bg-[#262626] hover:text-white',
        ghost: 'hover:bg-[#1A1A1A] text-neutral-300 hover:text-white',
        link: 'text-white underline-offset-4 hover:underline',
        gradient: 'bg-white text-black hover:bg-neutral-200 border border-white font-semibold',
      },
      size: {
        default: 'h-9 px-3.5 py-1.5',
        sm: 'h-7 rounded-[4px] px-2.5 text-[11px]',
        lg: 'h-10 rounded-[4px] px-5 text-sm',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, isLoading = false, children, disabled, ...props },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Spinner className="h-3.5 w-3.5" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
