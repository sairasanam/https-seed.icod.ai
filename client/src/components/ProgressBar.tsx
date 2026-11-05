import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showLabel?: boolean;
}

export default function ProgressBar({ current, total, className, showLabel = false }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div
      className={cn('w-full', className)}
      data-icod-id="src_components_progressbar_tsx_95ed">
      {/* Premium progress bar with gradient and glow */}
      <div
        className="relative h-3 w-full rounded-full bg-muted/50 overflow-hidden border border-border/20"
        data-icod-id="src_components_progressbar_tsx_013f">
        {/* Background shimmer effect */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer bg-[length:200%_100%]"
          data-icod-id="src_components_progressbar_tsx_ffe6" />
        
        {/* Progress fill with gradient */}
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary via-success to-primary shadow-[0_0_15px_rgba(var(--glow-primary)/0.4)]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
        />
        
        {/* Shine overlay on the progress */}
        <motion.div
          className="absolute top-0 left-0 h-full w-full bg-gradient-to-b from-white/20 to-transparent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
        />
      </div>
      {showLabel && (
        <p
          className="mt-2 text-xs font-semibold text-muted-foreground"
          data-icod-id="src_components_progressbar_tsx_8af7">
          {current} of {total} tasks ({percentage}%)
        </p>
      )}
    </div>
  );
}
