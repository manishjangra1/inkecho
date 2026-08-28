'use client';

import * as React from 'react';
import { AnimatePresence, type AnimatePresenceProps } from 'framer-motion';

export interface MotionPresenceProps extends AnimatePresenceProps {
  children?: React.ReactNode;
}

export function MotionPresence({ children, mode = 'wait', ...props }: MotionPresenceProps) {
  return (
    <AnimatePresence mode={mode} {...props}>
      {children}
    </AnimatePresence>
  );
}
