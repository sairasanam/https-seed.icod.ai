import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';

export type CardProps = ComponentPropsWithoutRef<'div'> & {
  /** Enable glassmorphism effect */
  glass?: boolean;
  /** Add subtle glow effect */
  glow?: boolean;
};

/**
 * Premium bordered surface: content card, dashboard tile, form panel, list row.
 * Pass padding and layout through className — <Card className="p-4 flex gap-3">.
 */
export default function Card({ 
  className, 
  glass = false, 
  glow = false,
  ...rest 
}: CardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 animate-fade-slide-in',
        glass 
          ? 'glass border-white/20' 
          : 'border-border/50 bg-card text-card-foreground',
        glow && 'shadow-[0_0_20px_rgba(var(--glow-primary)/0.15)] hover:shadow-[0_0_30px_rgba(var(--glow-primary)/0.25)]',
        !glass && !glow && 'hover:shadow-md',
        // Add subtle hover lift for interactive cards
        'card-hover-lift',
        className,
      )}
      data-icod-id="src_components_ui_card_tsx_6f5d"
      {...rest} />
  );
}
