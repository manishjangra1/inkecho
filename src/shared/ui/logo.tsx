'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/shared/lib/cn';
import { ROUTES } from '@/shared/constants/routes';
import { COMMON_COPY } from '@/shared/constants/copy/common';

export interface LogoMarkProps extends React.SVGProps<SVGSVGElement> {
  readonly sizeClassName?: string;
  readonly className?: string;
}

export function LogoMark({
  sizeClassName = 'h-5 w-5',
  className,
  ...props
}: LogoMarkProps) {
  const gradientId = React.useId();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      className={cn('shrink-0 select-none', sizeClassName, className)}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="96" y1="96" x2="416" y2="416" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="100%" stopColor="#00C2FF" />
        </linearGradient>
      </defs>

      {/* Continuous ribbon */}
      <path
        d="
          M156 136
          C156 92 192 64 240 64
          L272 64
          C320 64 356 92 356 136

          C356 170 338 194 308 208

          C270 226 246 240 246 272

          C246 304 270 318 308 336

          C338 350 356 374 356 408

          C356 452 320 480 272 480
          L240 480

          C192 480 156 452 156 408"
        stroke={`url(#${gradientId})`}
        strokeWidth="44"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center bar (I) */}
      <line
        x1="256"
        y1="150"
        x2="256"
        y2="362"
        stroke="#F8FAFC"
        strokeWidth="26"
        strokeLinecap="round"
      />

      {/* Echo pulse */}
      <circle cx="256" cy="422" r="18" fill="#00C2FF" />
    </svg>
  );
}

export interface LogoProps {
  readonly href?: string | null;
  readonly onClick?: (e: React.MouseEvent) => void;
  readonly className?: string;
  readonly textClassName?: string;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly showText?: boolean;
}

export function Logo({
  href = ROUTES.HOME,
  onClick,
  className,
  textClassName,
  size = 'md',
  showText = true,
}: LogoProps) {
  const sizeMap = {
    sm: { icon: 'h-4 w-4', text: 'text-xs' },
    md: { icon: 'h-5 w-5', text: 'text-xs tracking-wider uppercase' },
    lg: { icon: 'h-8 w-8', text: 'text-lg tracking-wide' },
  };

  const content = (
    <div className={cn('flex items-center gap-2 group', className)}>
      <LogoMark
        sizeClassName={sizeMap[size].icon}
        className="transition-transform duration-300 group-hover:scale-105"
      />
      {showText && (
        <span
          className={cn(
            'font-bold text-white tracking-wider transition-colors',
            sizeMap[size].text,
            textClassName
          )}
        >
          {COMMON_COPY.APP_NAME}
        </span>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center hover:opacity-95 transition-opacity cursor-pointer bg-transparent border-0 p-0 text-left"
      >
        {content}
      </button>
    );
  }

  if (href) {
    return (
      <Link href={href} className="flex items-center hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
