import type { ComponentType, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface EmptyStateProps {
  /** A lucide-react icon component, e.g. icon={StickyNote}. */
  icon?: ComponentType<{ className?: string }>;
  /** Custom illustration component (takes precedence over icon) */
  illustration?: ReactNode;
  title: string;
  description?: string;
  /** Primary call to action, usually a <Button>. */
  action?: ReactNode;
  className?: string;
}

/** Premium "Nothing here yet" placeholder for empty lists, grids, and search results. */
export default function EmptyState({
  icon: Icon = Inbox,
  illustration,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <motion.div
      initial={!prefersReducedMotion ? { opacity: 0, y: 20 } : undefined}
      animate={!prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center px-6 py-24 text-center',
        className,
      )}
    >
      {/* Render custom illustration or animated icon container */}
      {illustration ? (
        <div className="mb-6" data-icod-id="src_components_ui_emptystate_tsx_56f9">
          {illustration}
        </div>
      ) : (
        <motion.div 
          className="relative mb-6"
          animate={!prefersReducedMotion ? {
            y: [0, -8, 0],
          } : undefined}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Glow effect behind icon */}
          <div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 to-success/20 blur-xl opacity-60"
            data-icod-id="src_components_ui_emptystate_tsx_449e" />
          
          <div
            className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-success/10 border border-primary/20 shadow-lg"
            data-icod-id="src_components_ui_emptystate_tsx_cba2">
            <Icon
              className="h-10 w-10 text-primary"
              data-icod-id="src_components_ui_emptystate_tsx_03a7" />
          </div>
        </motion.div>
      )}
      <h3
        className="text-xl font-bold text-foreground"
        style={{ letterSpacing: 'var(--tracking-tight)' }}
        data-icod-id="src_components_ui_emptystate_tsx_a862">{title}</h3>
      {description && (
        <p
          className="mt-2 max-w-sm text-muted-foreground leading-relaxed"
          style={{ lineHeight: 'var(--leading-relaxed)' }}
          data-icod-id="src_components_ui_emptystate_tsx_6612">{description}</p>
      )}
      {action && (
        <motion.div 
          className="mt-6"
          initial={!prefersReducedMotion ? { opacity: 0, scale: 0.9 } : undefined}
          animate={!prefersReducedMotion ? { opacity: 1, scale: 1 } : undefined}
          transition={{ delay: 0.2 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
