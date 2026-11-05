import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from './Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Right-aligned action row rendered under the body. */
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
  /** Enable scrollable content area for long forms */
  scrollable?: boolean;
}

/**
 * Premium centred overlay dialog: backdrop click, Escape, and scroll lock built in.
 * Size it through className — <Modal className="max-w-sm"> for a confirmation.
 */
export default function Modal({
  open,
  onClose,
  title,
  footer,
  className,
  children,
  scrollable = false,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          data-icod-id="src_components_ui_modal_tsx_dafc">
          {/* Premium backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-foreground/60 backdrop-blur-md"
          />
          
          {/* Modal content with glass effect */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ 
              type: 'spring',
              damping: 25,
              stiffness: 300,
              duration: 0.2 
            }}
            className={cn(
              'relative flex w-full max-w-lg flex-col rounded-3xl border border-border/30',
              'glass text-card-foreground shadow-2xl',
              scrollable ? 'max-h-[calc(100vh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-48px)]' : 'gap-5 p-6',
              className,
            )}
          >
            {title && (
              <div
                className={cn(
                  "flex items-center justify-between border-b border-border/20",
                  scrollable ? "px-6 py-4 sticky top-0 z-10 bg-[rgba(var(--glass-bg))] backdrop-blur-xl rounded-t-3xl" : "pb-2"
                )}
                data-icod-id="src_components_ui_modal_tsx_9f27">
                <h2
                  className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
                  data-icod-id="src_components_ui_modal_tsx_ebca">
                  {title}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-full"
                  data-icod-id="src_components_ui_modal_tsx_a9b6">
                  <X className="h-5 w-5" data-icod-id="src_components_ui_modal_tsx_9a5c" />
                </Button>
              </div>
            )}
            
            <div 
              className={cn(
                "flex-1",
                scrollable && "overflow-y-auto px-6 py-5 pb-safe"
              )} 
              data-icod-id="src_components_ui_modal_tsx_a3f4">
              {children}
            </div>
            
            {footer && (
              <div
                className={cn(
                  "flex justify-end gap-3 border-t border-border/20",
                  scrollable 
                    ? "sticky bottom-0 px-6 py-4 bg-[rgba(var(--glass-bg))] backdrop-blur-xl rounded-b-3xl" 
                    : "pt-4"
                )}
                data-icod-id="src_components_ui_modal_tsx_bc1d">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
