'use client';

import { forwardRef } from 'react';
import { cn } from '../../lib/cn.js';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
}

/**
 * Accessible on/off toggle (ARIA `switch`). Controlled via `checked` /
 * `onCheckedChange`, styled with the shared gold tokens.
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled, id, ...props }, ref) => (
    <button
      ref={ref}
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'border-gold-500 bg-gold-500/80' : 'border-line bg-surface-2',
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-fg shadow-sm transition-transform',
          checked ? 'translate-x-[1.375rem]' : 'translate-x-1',
        )}
      />
    </button>
  ),
);
Switch.displayName = 'Switch';
