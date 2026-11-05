import { Button, Modal } from '@/components/ui';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'primary';
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  loading = false,
}: ConfirmDialogProps) {
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const isDestructive = variant === 'destructive';
  const Icon = isDestructive ? AlertTriangle : CheckCircle;
  const iconColorClass = isDestructive ? 'text-destructive' : 'text-primary';
  const iconBgClass = isDestructive ? 'bg-destructive/10' : 'bg-primary/10';

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-sm"
      footer={
        <div
          className="flex justify-end gap-3"
          data-icod-id="src_components_confirmdialog_tsx_e285">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl"
            data-icod-id="src_components_confirmdialog_tsx_88ca">
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            loading={loading}
            className="rounded-xl min-w-[100px]"
            data-icod-id="src_components_confirmdialog_tsx_34f9">
            {confirmLabel}
          </Button>
        </div>
      }
      data-icod-id="src_components_confirmdialog_tsx_55a5">
      <div
        className="flex items-start gap-4"
        data-icod-id="src_components_confirmdialog_tsx_78ab">
        <motion.div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
            iconBgClass
          )}
          animate={!prefersReducedMotion && isDestructive && open ? {
            scale: [1, 1.05, 1],
          } : undefined}
          transition={!prefersReducedMotion ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
          data-icod-id="src_components_confirmdialog_tsx_45c7">
          <Icon 
            className={cn('h-6 w-6', iconColorClass)} 
            data-icod-id="src_components_confirmdialog_tsx_3bb9" />
        </motion.div>
        <div className="flex-1" data-icod-id="src_components_confirmdialog_tsx_c265">
          <h3
            className="font-bold text-lg text-foreground"
            style={{ letterSpacing: 'var(--tracking-tight)' }}
            data-icod-id="src_components_confirmdialog_tsx_1c43">{title}</h3>
          <p
            className="mt-2 text-sm text-muted-foreground leading-relaxed"
            style={{ lineHeight: 'var(--leading-relaxed)' }}
            data-icod-id="src_components_confirmdialog_tsx_b96e">{description}</p>
        </div>
      </div>
    </Modal>
  );
}
