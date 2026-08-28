'use client';

import * as React from 'react';
import { useReducedMotion } from 'framer-motion';

export function MotionReduced({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{fallback ?? children}</>;
  }

  return <>{children}</>;
}
