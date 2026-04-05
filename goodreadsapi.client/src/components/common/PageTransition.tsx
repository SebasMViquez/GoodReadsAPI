import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

export function PageTransition({ children }: PropsWithChildren) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.992, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -16, scale: 1.006, filter: 'blur(6px)' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: 'transform, opacity, filter' }}
    >
      {children}
    </motion.div>
  );
}
