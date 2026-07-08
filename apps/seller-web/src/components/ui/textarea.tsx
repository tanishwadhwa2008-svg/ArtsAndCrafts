import { forwardRef } from 'react';
import { cn } from '../../lib/cn.js';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'min-h-[90px] w-full rounded-md border border-line bg-surface-2/60 px-3 py-2 text-sm text-fg',
      'placeholder:text-faint transition-colors',
      'focus-visible:border-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/30',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
