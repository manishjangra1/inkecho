'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { MOTION } from '@/shared/config/motion.config';

export interface MotionScaleInProps extends HTMLMotionProps<'div'> {
  delay?: number;
  initialScale?: number;
}

export function MotionScaleIn({
  children,
  delay = 0,
  initialScale = 0.9,
  className,
  ...props
}: MotionScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: initialScale }}
      transition={{ ...MOTION.spring.snappy, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
