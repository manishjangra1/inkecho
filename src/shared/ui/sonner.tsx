'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'dark' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
        error: <AlertCircle className="h-4 w-4 text-[#FF6B6B] shrink-0" />,
        warning: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
        info: <Info className="h-4 w-4 text-cyan-400 shrink-0" />,
        loading: <Loader2 className="h-4 w-4 text-white animate-spin shrink-0" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-[#0E0E0E]/95 group-[.toaster]:text-neutral-200 group-[.toaster]:border group-[.toaster]:border-[#262626] group-[.toaster]:shadow-2xl group-[.toaster]:rounded-[6px] group-[.toaster]:p-3 group-[.toaster]:gap-2.5 group-[.toaster]:text-xs group-[.toaster]:font-sans group-[.toaster]:backdrop-blur-md select-none',
          title: 'group-[.toast]:font-semibold group-[.toast]:text-white group-[.toast]:text-xs leading-tight',
          description: 'group-[.toast]:text-neutral-400 group-[.toast]:text-[11px] leading-snug mt-0.5',
          actionButton:
            'group-[.toast]:bg-white group-[.toast]:text-black group-[.toast]:rounded-[4px] group-[.toast]:px-2.5 group-[.toast]:py-1 group-[.toast]:text-xs group-[.toast]:font-semibold hover:group-[.toast]:bg-neutral-200 transition-colors',
          cancelButton:
            'group-[.toast]:bg-[#1C1C1C] group-[.toast]:text-neutral-300 group-[.toast]:rounded-[4px] group-[.toast]:px-2.5 group-[.toast]:py-1 group-[.toast]:text-xs group-[.toast]:border group-[.toast]:border-neutral-800',
          closeButton:
            'group-[.toast]:bg-[#141414] group-[.toast]:border-neutral-800 group-[.toast]:text-neutral-400 group-[.toast]:hover:text-white group-[.toast]:hover:bg-[#202020] group-[.toast]:rounded-[4px]',
          success:
            'group-[.toaster]:border-emerald-500/30 group-[.toaster]:bg-[#0C120F]/95 group-[.toaster]:shadow-emerald-950/20',
          error:
            'group-[.toaster]:border-[#D9534F]/40 group-[.toaster]:bg-[#140C0C]/95 group-[.toaster]:shadow-red-950/20',
          warning:
            'group-[.toaster]:border-amber-500/30 group-[.toaster]:bg-[#14110C]/95 group-[.toaster]:shadow-amber-950/20',
          info:
            'group-[.toaster]:border-cyan-500/30 group-[.toaster]:bg-[#0C1114]/95 group-[.toaster]:shadow-cyan-950/20',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
