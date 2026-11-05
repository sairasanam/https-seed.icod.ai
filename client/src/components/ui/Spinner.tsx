import { cn } from '@/utils/cn';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClass = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
} as const;

/**
 * Premium indeterminate loading spinner with gradient effect.
 *
 * On a coloured surface, inherit the text colour instead of the brand colour:
 *   <Spinner size="sm" className="border-current border-t-transparent" />
 */
export default function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full border-primary/20 border-t-primary shadow-[0_0_10px_rgba(var(--glow-primary)/0.3)]',
        sizeClass[size],
        className,
      )}
      data-icod-id="src_components_ui_spinner_tsx_f8fc" />
  );
}
