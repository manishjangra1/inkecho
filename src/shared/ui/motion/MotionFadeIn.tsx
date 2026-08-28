'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { MOTION } from '@/shared/config/motion.config';

export interface MotionFadeInProps extends HTMLMotionProps<'div'> {
  delay?: number;
  duration?: number;
}

export function MotionFadeIn({
  children,
  delay = 0,
  duration = MOTION.duration.normal,
  className,
  ...props
}: MotionFadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay, ease: MOTION.ease.out }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
