import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';

/**
 * Premium form-control look as a class string. Use it directly on <textarea> and
 * <select>; use <Input> for <input>.
 *   <textarea className={inputClass('min-h-24 resize-none')} />
 *   <select className={inputClass()} />
 */
export function inputClass(className?: string): string {
  return cn(
    'w-full rounded-xl border border-border/50 bg-card/80 px-4 py-3 text-sm text-foreground',
    'placeholder:text-muted-foreground/60 transition-all duration-300',
    'focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card',
    'disabled:cursor-not-allowed disabled:bg-muted/50 disabled:text-muted-foreground',
    'shadow-inner',
    className,
  );
}

export type InputProps = ComponentPropsWithoutRef<'input'>;

/** Every <input> in the app. Wrap it in <Field> to get a label and error text. */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={inputClass(className)}
      data-icod-id="src_components_ui_input_tsx_4e5d"
      {...rest} />
  );
});

export default Input;
