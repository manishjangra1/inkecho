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
        'w-full sm:w-auto min-w-[160px] font-semibold text-base py-6 shadow-md transition-all',
        className
      )}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          <Send className="w-5 h-5 mr-2" />
          {label}
        </>
      )}
    </Button>
  );
}
