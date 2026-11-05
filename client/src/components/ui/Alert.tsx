import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

const variantClass: Record<AlertVariant, string> = {
  error: 'border-destructive/40 bg-destructive/10 text-destructive',
  success: 'border-success/40 bg-success/10 text-success',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  info: 'border-border/50 bg-muted/50 text-muted-foreground',
};

const icons: Record<AlertVariant, typeof Info> = {
  error: XCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

export interface AlertProps {
  variant?: AlertVariant;
  className?: string;
  children: ReactNode;
}

/** Premium inline status banner: form errors, save confirmations, empty-result notices. */
export default function Alert({ variant = 'error', className, children }: AlertProps) {
  const Icon = icons[variant];
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm backdrop-blur-sm',
        variantClass[variant],
        className,
      )}
    >
      <Icon
        className="mt-0.5 h-5 w-5 shrink-0"
        data-icod-id="src_components_ui_alert_tsx_e18a" />
      <div
        className="min-w-0 font-medium"
        data-icod-id="src_components_ui_alert_tsx_1f1b">{children}</div>
    </motion.div>
  );
}
