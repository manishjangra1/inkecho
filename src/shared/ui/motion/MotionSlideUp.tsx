'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { MOTION } from '@/shared/config/motion.config';

export interface MotionSlideUpProps extends HTMLMotionProps<'div'> {
  delay?: number;
  offsetY?: number;
  duration?: number;
}

export function MotionSlideUp({
  children,
  delay = 0,
  offsetY = 16,
  duration = MOTION.duration.normal,
  className,
  ...props
}: MotionSlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: offsetY }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -offsetY }}
      transition={{ duration, delay, ease: MOTION.ease.out }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
