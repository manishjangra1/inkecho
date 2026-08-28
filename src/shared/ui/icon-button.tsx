import * as React from 'react';
import { Button, type ButtonProps } from './button';
import { cn } from '@/shared/lib/cn';

export interface IconButtonProps extends Omit<ButtonProps, 'size'> {
  'aria-label': string;
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'md', variant = 'ghost', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8 p-0 rounded-md',
      md: 'h-10 w-10 p-0 rounded-lg',
      lg: 'h-12 w-12 p-0 rounded-xl',
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn(sizeClasses[size], className)}
        {...props}
      />
    );
  }
);
IconButton.displayName = 'IconButton';
