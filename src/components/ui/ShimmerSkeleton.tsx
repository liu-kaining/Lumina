import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ShimmerSkeletonProps {
  className?: string;
}

/**
 * 微光骨架屏组件
 */
export function ShimmerSkeleton({ className }: ShimmerSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'relative overflow-hidden rounded-xl',
        'bg-gradient-to-r from-white/10 via-white/20 to-white/10',
        'bg-[length:200%_100%]',
        className
      )}
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)',
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
}