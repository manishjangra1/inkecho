'use client';

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface SubmitButtonProps {
  readonly isSubmitting: boolean;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly onClick?: () => void;
  readonly className?: string;
}

export function SubmitButton({
  isSubmitting,
  disabled,
  label = 'Submit Turn',
  onClick,
  className,
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={disabled || isSubmitting}
      onClick={onClick}
      className={cn(
        'w-full min-w-[160px] py-6 text-base font-semibold shadow-md transition-all sm:w-auto',
        className
      )}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          <Send className="mr-2 h-5 w-5" />
          {label}
        </>
      )}
    </Button>
  );
}
