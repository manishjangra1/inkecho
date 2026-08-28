'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { pageTransitionVariants } from '@/shared/config/motion.config';

export function MotionPage({ children, className, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
