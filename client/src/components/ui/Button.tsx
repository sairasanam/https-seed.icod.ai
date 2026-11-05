import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';
import Spinner from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glow' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-50 button-press';

const variantClass: Record<ButtonVariant, string> = {
  primary: 
    'bg-gradient-to-r from-primary to-success text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40',
  secondary: 
    'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md',
  outline: 
    'border-2 border-primary/30 bg-transparent text-foreground hover:bg-primary/5 hover:border-primary/50',
  ghost: 
    'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
  destructive: 
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/30',
  glow: 
    'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--glow-primary)/0.4)] hover:shadow-[0_0_30px_rgba(var(--glow-primary)/0.6)]',
  glass: 
    'glass text-foreground hover:bg-white/10 backdrop-blur-md',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
  icon: 'h-10 w-10 p-0 rounded-full',
};

/**
 * The Button look as a class string — for an element that must stay an <a> or a
 * react-router <Link>:
 *   <Link to="/signup" className={buttonClass({ size: 'sm' })}>Sign up</Link>
 */
export function buttonClass(
  opts: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {},
): string {
  const { variant = 'primary', size = 'md', className } = opts;
  return cn(base, variantClass[variant], sizeClass[size], className);
}

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
}

/** Every clickable action in the app. An icon-only button is size="icon". */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={buttonClass({ variant, size, className })}
      disabled={disabled || loading}
      data-icod-id="src_components_ui_button_tsx_40b3"
      {...rest}>
      {loading && <Spinner
        size="sm"
        className="border-current border-t-transparent"
        data-icod-id="src_components_ui_button_tsx_8bb5" />}
      {children}
    </button>
  );
});

export default Button;
